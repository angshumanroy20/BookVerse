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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, Globe, Clock, AlertCircle } from "lucide-react";
import { searchWeb, formatSearchResponse, type SearchResult } from "@/services/googleSearch";
import { useToast } from "@/hooks/use-toast";

interface WebSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export default function WebSearchDialog({
  open,
  onOpenChange,
  initialQuery = "",
}: WebSearchDialogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchInfo, setSearchInfo] = useState<{
    totalResults: string;
    searchTime: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchInfo(null);

    try {
      const response = await searchWeb(query.trim(), 10);
      setResults(response.items);
      setSearchInfo(response.searchInformation);

      if (response.items.length === 0) {
        setError(`No results found for "${query}"`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search the web";
      setError(errorMessage);
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Web Search
          </DialogTitle>
          <DialogDescription>
            Search the web using Google and get instant results
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-2/3 bg-muted" />
                    <Skeleton className="h-3 w-1/3 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && !loading && (
            <Card className="border-destructive">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Search Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              {searchInfo && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2 border-b">
                  <span className="flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    {parseInt(searchInfo.totalResults).toLocaleString()} results
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {searchInfo.searchTime.toFixed(2)}s
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenLink(result.link)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-primary hover:underline mb-1 line-clamp-2">
                            {result.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{result.displayLink}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLink(result.link);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {!loading && !error && results.length === 0 && !query && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Search the Web</h3>
              <p className="text-muted-foreground">
                Enter a search term to find information from across the internet
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
