import { useState } from "react";
import { Search, BookOpen, Plus, Loader2, Filter, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { searchExternalBooks, type ExternalBook } from "@/services/externalBooksApi";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import { useFadeInOnScroll } from "@/hooks/use3DAnimation";

export default function ExternalSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "title" | "author" | "isbn">("all");
  const [source, setSource] = useState<"both" | "google" | "openlibrary">("both");
  const [results, setResults] = useState<ExternalBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());
  const { ref: headerRef, isVisible: headerVisible } = useFadeInOnScroll(0.1);
  const { ref: resultsRef, isVisible: resultsVisible } = useFadeInOnScroll(0.1);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let query = searchQuery.trim();
      
      // Add search type prefix for specific searches
      if (searchType === "title") {
        query = `intitle:${query}`;
      } else if (searchType === "author") {
        query = `inauthor:${query}`;
      } else if (searchType === "isbn") {
        query = `isbn:${query}`;
      }

      const searchResults = await searchExternalBooks(query, source, 20);
      setResults(searchResults.books);
      setTotalResults(searchResults.totalResults);

      if (searchResults.books.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search terms or filters",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportBook = async (book: ExternalBook) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to import books",
        variant: "destructive",
      });
      return;
    }

    setImportingIds(prev => new Set(prev).add(book.id));

    try {
      await api.createBook({
        title: book.title,
        author: book.author,
        genre: book.genre,
        synopsis: book.synopsis,
        cover_image_url: book.cover_image_url,
        pdf_url: null,
        created_by: user.id,
      });

      toast({
        title: "Book imported successfully",
        description: `"${book.title}" has been added to your library`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing the book",
        variant: "destructive",
      });
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl:py-12">
        <div
          ref={headerRef}
          className={`mb-8 ${headerVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <h1 className="text-4xl xl:text-5xl font-display font-bold mb-3 gradient-text">
            Discover Books
          </h1>
          <p className="text-lg text-muted-foreground">
            Search millions of books from Google Books and Open Library
          </p>
        </div>

        <Card className="glass-card mb-8 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger className="w-[140px] h-12">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="isbn">ISBN</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={source} onValueChange={(value: any) => setSource(value)}>
                    <SelectTrigger className="w-[160px] h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both Sources</SelectItem>
                      <SelectItem value="google">Google Books</SelectItem>
                      <SelectItem value="openlibrary">Open Library</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button type="submit" disabled={loading} className="h-12 px-6 hover-lift">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Note:</strong> Imported books will include metadata (title, author, cover, description) only. 
            PDF files need to be uploaded separately from the book detail page after importing.
          </AlertDescription>
        </Alert>

        {totalResults > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> results
            </p>
          </div>
        )}

        <div
          ref={resultsRef}
          className={resultsVisible ? 'animate-fade-in-up' : 'opacity-0'}
        >
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((book, index) => (
                <Card
                  key={book.id}
                  className="overflow-hidden hover-lift group border-2 border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4 p-5">
                    <div className="relative w-24 xl:w-28 aspect-[2/3] flex-shrink-0 overflow-hidden bg-gradient-to-br from-muted to-muted/50 rounded-lg">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center gradient-primary">
                          <BookOpen className="w-10 h-10 text-primary-foreground animate-3d-float" />
                        </div>
                      )}
                      <Badge
                        className="absolute top-2 right-2 text-xs"
                        variant={book.source === 'google' ? 'default' : 'secondary'}
                      >
                        {book.source === 'google' ? 'Google' : 'Open Library'}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-display font-bold text-base xl:text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {book.author}
                      </p>
                      {book.genre && (
                        <Badge variant="outline" className="w-fit mb-2 text-xs">
                          {book.genre}
                        </Badge>
                      )}
                      {book.synopsis && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {book.synopsis}
                        </p>
                      )}
                      <div className="mt-auto">
                        <Button
                          size="sm"
                          onClick={() => handleImportBook(book)}
                          disabled={importingIds.has(book.id)}
                          className="w-full hover-lift"
                        >
                          {importingIds.has(book.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-2" />
                              Import to Library
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !loading && (
            <Card className="glass-card p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-3d-float" />
              <h3 className="text-xl font-display font-bold mb-2">No results yet</h3>
              <p className="text-muted-foreground">
                Start searching to discover millions of books from Google Books and Open Library
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
