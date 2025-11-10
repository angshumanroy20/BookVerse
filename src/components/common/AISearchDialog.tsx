import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ExternalLink, Loader2 } from "lucide-react";
import { streamAISearch } from "@/services/aiSearch";
import { useToast } from "@/hooks/use-toast";

interface AISearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export default function AISearchDialog({
  open,
  onOpenChange,
  initialQuery = "",
}: AISearchDialogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<Array<{ uri: string; title: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    console.log("🔍 Starting AI search for:", query);
    setIsSearching(true);
    setResponse("");
    setSources([]);

    try {
      let hasReceivedData = false;
      
      for await (const chunk of streamAISearch(query)) {
        hasReceivedData = true;
        console.log("📦 Received chunk:", chunk.text.substring(0, 50) + "...");
        setResponse(chunk.text);
        if (chunk.sources) {
          setSources(chunk.sources);
        }
      }

      if (!hasReceivedData) {
        throw new Error("No data received from AI Search");
      }

      console.log("✅ AI search completed successfully");
    } catch (error: any) {
      console.error("❌ AI Search error:", error);
      
      const errorMessage = error?.message || "Unknown error occurred";
      
      toast({
        title: "AI Search failed",
        description: errorMessage.length > 200 
          ? "Unable to complete AI search. Please check the console for details." 
          : errorMessage,
        variant: "destructive",
      });

      setResponse(`⚠️ Error: ${errorMessage}\n\nPlease try again or check your internet connection.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setQuery("");
      setResponse("");
      setSources([]);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Book Search
          </DialogTitle>
          <DialogDescription>
            Ask anything about books, get intelligent recommendations, or explore literary topics
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Recommend mystery books with strong female leads' or 'Best sci-fi novels of 2024'"
              className="flex-1"
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Response Display */}
          {(response || isSearching) && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* AI Response */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Response</h3>
                </div>
                
                {response ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                      {response}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Searching and analyzing...</span>
                  </div>
                )}
              </div>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Sources</h3>
                  </div>
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline group"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!response && !isSearching && (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-md">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Book Discovery</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask me anything about books! I can help you find recommendations, 
                  explore genres, discover authors, or answer literary questions.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 Try: "Books similar to Harry Potter"</p>
                  <p>💡 Try: "Best non-fiction books about psychology"</p>
                  <p>💡 Try: "Classic novels everyone should read"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
