import { useState } from "react";
import {
  Search,
  BookOpen,
  Plus,
  Loader2,
  Download,
  ExternalLink,
  Sparkles,
  Library,
  Layers,
  FileCheck,
  CheckCircle2,
  BookMarked,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { searchExternalBooks, type ExternalBook, type ExternalSearchSource } from "@/services/externalBooksApi";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import FlipBookReader from "@/components/common/FlipBookReader";

const POPULAR_TOPICS = [
  "Science Fiction",
  "Artificial Intelligence",
  "Classic Literature",
  "Philosophy",
  "Psychology",
  "Cybersecurity",
  "Dystopian",
  "History",
];

export default function ExternalSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "title" | "author" | "isbn">("all");
  const [source, setSource] = useState<ExternalSearchSource>("all");
  const [results, setResults] = useState<ExternalBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [activeReaderBook, setActiveReaderBook] = useState<{ url: string; title: string } | null>(null);

  const executeSearch = async (queryText: string, searchSource = source) => {
    const q = queryText.trim();
    if (!q) {
      toast({
        title: "Search query required",
        description: "Please enter a book title, author, or keyword.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalQuery = q;
      if (searchType === "title") finalQuery = `intitle:${q}`;
      else if (searchType === "author") finalQuery = `inauthor:${q}`;
      else if (searchType === "isbn") finalQuery = `isbn:${q}`;

      const res = await searchExternalBooks(finalQuery, searchSource, 25);
      setResults(res.books);
      setTotalResults(res.totalResults);

      if (res.books.length === 0) {
        toast({
          title: "No books found",
          description: "Try broader keywords or switch to another provider.",
        });
      }
    } catch (error) {
      console.error("External search error:", error);
      toast({
        title: "Search encountered an issue",
        description: "Displaying available results from remaining active mirrors.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSourceChange = (newSource: string) => {
    const typedSource = newSource as ExternalSearchSource;
    setSource(typedSource);
    if (searchQuery.trim()) {
      executeSearch(searchQuery, typedSource);
    }
  };

  const handleImportBook = async (book: ExternalBook) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save books into your library.",
        variant: "destructive",
      });
      return;
    }

    setImportingIds((prev) => new Set(prev).add(book.id));

    try {
      await api.createBook({
        title: book.title,
        author: book.author,
        genre: book.genre || "General",
        synopsis: book.synopsis || "Imported from external repository.",
        cover_image_url: book.cover_image_url || null,
        pdf_url: book.pdf_url || null,
        created_by: user.id,
      });

      setImportedIds((prev) => new Set(prev).add(book.id));
      toast({
        title: "Book Saved to Library!",
        description: `"${book.title}" is now available in your personal library with full metadata.`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "Could not save the book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImportingIds((prev) => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090a0f] via-[#0d101a] to-[#090a0f] text-foreground pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5 py-12 sm:py-16">
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-3.5 py-1 text-xs tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Global Repository Discovery
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight mb-4 text-white">
            Discover & Import <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-amber-400">Millions of Books</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Seamlessly search Anna's Archive, Internet Archive, Open Library, and Google Books with one-click library imports and direct PDF viewing.
          </p>

          {/* Search Card */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative p-2 rounded-2xl bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-stretch gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 pointer-events-none" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, topic, or ISBN..."
                  className="pl-11 pr-4 h-12 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-zinc-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={searchType} onValueChange={(val: any) => setSearchType(val)}>
                  <SelectTrigger className="w-28 h-12 bg-white/5 border-white/10 text-xs rounded-xl">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="isbn">ISBN</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-6 rounded-xl font-medium bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 shadow-lg shadow-primary/25 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search Books"
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Keyword Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-muted-foreground mr-1">Trending:</span>
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSearchQuery(topic);
                    executeSearch(topic);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Source Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Tabs value={source} onValueChange={handleSourceChange} className="w-full sm:w-auto">
            <TabsList className="bg-card/70 border border-white/10 p-1 rounded-xl h-auto flex flex-wrap gap-1">
              <TabsTrigger
                value="all"
                className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 px-3 py-2"
              >
                <Layers className="w-3.5 h-3.5" />
                All Sources
              </TabsTrigger>
              <TabsTrigger
                value="annas"
                className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-1.5 px-3 py-2"
              >
                <span className="text-sm">🏴‍☠️</span>
                Anna's Archive & Shadow Library
              </TabsTrigger>
              <TabsTrigger
                value="openlibrary"
                className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-1.5 px-3 py-2"
              >
                <Library className="w-3.5 h-3.5" />
                Open Library (Internet Archive)
              </TabsTrigger>
              <TabsTrigger
                value="google"
                className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-1.5 px-3 py-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Google Books
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {results.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{results.length}</span> curated items
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/40 border-white/5 h-64 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map((book) => {
              const isImporting = importingIds.has(book.id);
              const isImported = importedIds.has(book.id);

              return (
                <Card
                  key={book.id}
                  className="group overflow-hidden rounded-2xl bg-card/40 backdrop-blur-md border border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <CardContent className="p-5 flex gap-4">
                    {/* Cover Thumbnail */}
                    <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-muted/30 border border-white/10 flex-shrink-0 shadow-md relative group-hover:scale-105 transition-transform duration-300">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-muted-foreground bg-gradient-to-br from-zinc-800 to-zinc-900">
                          <BookOpen className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] leading-tight line-clamp-2">{book.title}</span>
                        </div>
                      )}

                      {/* File format chip */}
                      {book.file_format && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                          {book.file_format}
                        </span>
                      )}
                    </div>

                    {/* Book Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {book.source === "annas" && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] py-0">
                            Anna's Archive
                          </Badge>
                        )}
                        {book.source === "openlibrary" && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0">
                            Open Library
                          </Badge>
                        )}
                        {book.source === "google" && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] py-0">
                            Google Books
                          </Badge>
                        )}
                        {book.pdf_url && (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> PDF Ready
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-base text-zinc-100 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                        {book.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-1 mb-2 font-medium">
                        by {book.author}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                        {book.synopsis || "Full digital book metadata available for import."}
                      </p>

                      <div className="mt-auto flex items-center gap-2 text-[11px] text-zinc-500">
                        {book.published_date && <span>{book.published_date}</span>}
                        {book.language && <span>• {book.language.toUpperCase()}</span>}
                        {book.publisher && <span className="truncate">• {book.publisher}</span>}
                      </div>
                    </div>
                  </CardContent>

                  {/* Bottom Action Bar */}
                  <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {book.pdf_url ? (
                        <Button
                          size="sm"
                          onClick={() => setActiveReaderBook({ url: book.pdf_url!, title: book.title })}
                          className="h-8 text-xs px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md shadow-emerald-900/30"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Read Now
                        </Button>
                      ) : book.annas_search_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-xs px-3 rounded-lg border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
                        >
                          <a href={book.annas_search_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Anna's Archive Mirror
                          </a>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-xs px-3 rounded-lg border-white/10 gap-1.5"
                        >
                          <a href={book.download_url || "#"} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Source
                          </a>
                        </Button>
                      )}

                      {book.download_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Download file"
                        >
                          <a href={book.download_url} target="_blank" rel="noreferrer">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleImportBook(book)}
                      disabled={isImporting || isImported}
                      variant={isImported ? "secondary" : "default"}
                      className={`h-8 text-xs px-3 rounded-lg gap-1.5 transition-all ${
                        isImported
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-primary/90 hover:bg-primary shadow-md shadow-primary/20"
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Importing...
                        </>
                      ) : isImported ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          In Library
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Add to Library
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty Initial State */
          <div className="text-center py-16 px-4 rounded-3xl bg-card/20 border border-white/5 backdrop-blur-md max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <BookMarked className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">
              Ready to Explore Infinite Books
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              Search above across Anna's Archive, Internet Archive, and global digital libraries. Click any trending topic above to get started immediately.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Frankenstein", "Dune", "Cyberpunk", "Pride and Prejudice"].map((sample) => (
                <Button
                  key={sample}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(sample);
                    executeSearch(sample);
                  }}
                  className="rounded-full text-xs border-white/10 hover:border-primary/40"
                >
                  Try "{sample}"
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {activeReaderBook && (
        <FlipBookReader
          pdfUrl={activeReaderBook.url}
          bookTitle={activeReaderBook.title}
          onClose={() => setActiveReaderBook(null)}
        />
      )}
    </div>
  );
}
