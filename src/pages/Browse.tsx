import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import { useViewMode } from "@/contexts/ViewModeContext";

export default function Browse() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searching, setSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { viewMode } = useViewMode();

  useEffect(() => {
    loadBooks();
    loadGenres();
    initVoiceRecognition();
  }, []);

  const initVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        
        toast({
          title: "Voice recognized",
          description: `Searching for: "${transcript}"`,
        });

        setTimeout(() => {
          handleVoiceSearch(transcript);
        }, 500);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast({
            title: "No speech detected",
            description: "Please try again and speak clearly",
            variant: "destructive",
          });
        } else if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice search",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Voice recognition error",
            description: "Please try again",
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  };

  const handleVoiceSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      const data = await api.searchBooks(query);
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

  const toggleVoiceSearch = () => {
    if (!voiceSupported) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Browse Books</h1>
              <p className="text-muted-foreground">
                Explore our collection of books across all genres
              </p>
            </div>
            <ViewModeToggle />
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12"
              />
              {voiceSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceSearch}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary'
                  }`}
                  title={isListening ? "Stop listening" : "Voice search"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <Select value={selectedGenre} onValueChange={handleGenreChange}>
              <SelectTrigger className="w-full sm:w-48">
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
            <Button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full aspect-[2/3] bg-muted" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <Skeleton className="w-24 xl:w-32 aspect-[2/3] flex-shrink-0 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                      <Skeleton className="h-4 w-1/3 bg-muted" />
                      <Skeleton className="h-16 w-full bg-muted" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Be the first to add a book!"}
            </p>
            <Button asChild>
              <Link to="/upload">Upload Book</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {books.length} {books.length === 1 ? "book" : "books"}
            </p>
            <BookDisplay books={books} />
          </>
        )}
      </div>
    </div>
  );
}
