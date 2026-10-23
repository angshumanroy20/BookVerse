import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Mic,
  Globe,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  Compass,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import VoiceSearchDialog from "@/components/common/VoiceSearchDialog";
import WebSearchDialog from "@/components/common/WebSearchDialog";

export default function Browse() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "author">("newest");
  const [searching, setSearching] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [webSearchDialogOpen, setWebSearchDialogOpen] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    loadBooks();
    loadGenres();
    checkVoiceSupport();
  }, []);

  const checkVoiceSupport = () => {
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setVoiceSupported(supported);
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks(100);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
      toast({
        title: "Error loading catalog",
        description: "Could not fetch local library books.",
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
        title: "Search failed",
        description: "Please check your network and try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleVoiceSearchComplete = async (transcript: string) => {
    setSearchQuery(transcript);
    toast({
      title: "Voice query recognized",
      description: `Searching for: "${transcript}"`,
    });

    try {
      setSearching(true);
      const data = await api.searchBooks(transcript);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not execute voice search.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const openVoiceSearch = () => {
    if (!voiceSupported) {
      toast({
        title: "Voice recognition unavailable",
        description: "Please use Google Chrome, Safari, or Edge for voice recognition.",
        variant: "destructive",
      });
      return;
    }
    setVoiceDialogOpen(true);
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    if (genre === "all") {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      const data = await api.getBooksByGenre(genre, 100);
      setBooks(data);
    } catch (error) {
      toast({
        title: "Filter failed",
        description: "Could not filter by the selected genre.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Client-side sorting
  const sortedBooks = useMemo(() => {
    const list = [...books];
    if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "author") {
      list.sort((a, b) => a.author.localeCompare(b.author));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [books, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      {/* Header Banner */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur-xl py-10 sm:py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                  Curated Catalog
                </span>
                <span className="text-xs text-muted-foreground">• {books.length} Available Titles</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground mb-2">
                Browse Library
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Explore the complete collection with zero-cropping covers, 3D flipbook reading, and real-time category filtering.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 gap-2 text-xs h-10 flex-1 md:flex-none"
              >
                <Link to="/discover">
                  <Compass className="w-4 h-4" />
                  <span>Discover Anna's Archive</span>
                </Link>
              </Button>
              <ViewModeToggle />
            </div>
          </div>

          {/* Search Controls Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search catalog by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 h-11 bg-card border-border/70 rounded-xl text-sm placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    loadBooks();
                  }}
                  className="absolute right-10 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openVoiceSearch}
                className="absolute right-1.5 h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-36 h-11 bg-card border-border/70 rounded-xl text-xs shadow-sm">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Recently Added</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="author">Author (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={() => setWebSearchDialogOpen(true)}
                className="h-11 px-3.5 rounded-xl border-border/70 gap-1.5 text-xs bg-card hover:bg-muted shadow-sm"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Web Search</span>
              </Button>
            </div>
          </div>

          {/* Genre Category Pill Carousel */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <button
              onClick={() => handleGenreSelect("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => handleGenreSelect(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedGenre === g
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Book Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-border/40" />
            ))}
          </div>
        ) : sortedBooks.length > 0 ? (
          <BookDisplay books={sortedBooks} />
        ) : (
          <div className="text-center py-20 px-4 rounded-3xl bg-card border border-border/60 shadow-xl max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-display font-bold text-foreground mb-2">No Local Books Found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              We couldn't find any books matching "{searchQuery}". You can discover and import books instantly from Anna's Archive or Open Library.
            </p>
            <Button asChild className="rounded-xl bg-gradient-to-r from-primary to-indigo-600 gap-2 shadow-lg shadow-primary/25">
              <Link to="/discover">
                <Compass className="w-4 h-4" />
                <span>Search Anna's Archive</span>
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Voice & Web Search Modals */}
      <VoiceSearchDialog
        open={voiceDialogOpen}
        onOpenChange={setVoiceDialogOpen}
        onTranscriptComplete={handleVoiceSearchComplete}
      />
      <WebSearchDialog
        open={webSearchDialogOpen}
        onOpenChange={setWebSearchDialogOpen}
      />
    </div>
  );
}
