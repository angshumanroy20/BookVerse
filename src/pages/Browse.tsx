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
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
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

          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 pr-10 sm:pr-12 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={openVoiceSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-primary"
                  title="Voice search"
                >
                  <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </Button>
              </div>
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={searching} className="w-full sm:w-auto text-sm sm:text-base">
                {searching ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWebSearchDialogOpen(true)}
                className="gap-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Globe className="w-4 h-4" />
                <span className="truncate">Web Search</span>
              </Button>
            </div>
          </form>
        </div>

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full aspect-[2/3] bg-muted" />
                  <CardContent className="p-3 sm:p-4">
                    <Skeleton className="h-4 sm:h-5 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-3 sm:h-4 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex gap-3 sm:gap-6 p-3 sm:p-5">
                    <Skeleton className="w-24 sm:w-28 xl:w-32 aspect-[2/3] flex-shrink-0 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 sm:h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-3 sm:h-4 w-1/2 bg-muted" />
                      <Skeleton className="h-3 sm:h-4 w-1/3 bg-muted" />
                      <Skeleton className="h-12 sm:h-16 w-full bg-muted" />
                    </div>
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
