import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Mic, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import VoiceSearchDialog from "@/components/common/VoiceSearchDialog";
import WebSearchDialog from "@/components/common/WebSearchDialog";
import { useViewMode } from "@/contexts/ViewModeContext";

export default function Browse() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searching, setSearching] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [webSearchDialogOpen, setWebSearchDialogOpen] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const { toast } = useToast();
  const { viewMode } = useViewMode();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    loadBooks();
    loadGenres();
    checkVoiceSupport();
  }, []);

  const checkVoiceSupport = () => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setVoiceSupported(supported);
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks(50);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await api.getAllGenres();
      setGenres(data);
    } catch (error) {
      console.error("Failed to load genres:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadBooks();
      return;
    }

    try {
      setSearching(true);
      const data = await api.searchBooks(searchQuery);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleVoiceSearchComplete = async (transcript: string) => {
    setSearchQuery(transcript);
    
    toast({
      title: "Voice recognized",
      description: `Searching for: "${transcript}"`,
    });

    try {
      setSearching(true);
      const data = await api.searchBooks(transcript);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const openVoiceSearch = () => {
    if (!voiceSupported) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    setVoiceDialogOpen(true);
  };

  const handleGenreChange = async (genre: string) => {
    setSelectedGenre(genre);
    
    if (genre === "all") {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      const data = await api.getBooksByGenre(genre, 50);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to filter by genre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-6 sm:mb-8 w-full">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-display font-bold mb-2">Browse Books</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore our collection of books across all genres
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <ViewModeToggle />
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-3 w-full">
            <h2 className="text-lg sm:text-xl font-display font-semibold">Search & Filter</h2>
            <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full max-w-full">
              <div className="flex flex-col gap-2 w-full max-w-full">
                <div className="relative w-full max-w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Search by title, author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 pr-10 sm:pr-12 text-sm sm:text-base w-full max-w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={openVoiceSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-primary flex-shrink-0 z-10"
                    title="Voice search"
                  >
                    <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </Button>
                </div>
                <Select value={selectedGenre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-full max-w-full text-sm sm:text-base">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
                <Button type="submit" disabled={searching} className="w-full sm:flex-1 text-sm sm:text-base min-w-0">
                  {searching ? "Searching..." : "Search"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWebSearchDialogOpen(true)}
                  className="gap-2 w-full sm:flex-1 text-sm sm:text-base min-w-0"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Web Search</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg">
                  <Skeleton className="w-full aspect-[2/3] bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border border-border/30 bg-card/50">
                  <div className="flex gap-4 sm:gap-6 p-4 sm:p-6">
                    <Skeleton className="w-20 sm:w-24 aspect-[2/3] flex-shrink-0 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2 flex flex-col justify-center">
                      <Skeleton className="h-5 sm:h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                      <Skeleton className="h-3 w-full bg-muted" />
                      <Skeleton className="h-3 w-4/5 bg-muted" />
                    </div>
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : books.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No books found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Be the first to add a book!"}
            </p>
            <Button asChild>
              <Link to="/upload">Upload Book</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Showing {books.length} {books.length === 1 ? "book" : "books"}
            </p>
            <BookDisplay books={books} />
          </>
        )}
      </div>

      <VoiceSearchDialog
        open={voiceDialogOpen}
        onOpenChange={setVoiceDialogOpen}
        onTranscriptComplete={handleVoiceSearchComplete}
      />

      <WebSearchDialog
        open={webSearchDialogOpen}
        onOpenChange={setWebSearchDialogOpen}
        initialQuery={searchQuery}
      />
    </div>
  );
}
