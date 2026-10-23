import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Library,
  Layers,
  Compass,
  Search,
  BookMarked,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import RandomThought from "@/components/common/RandomThought";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [heroSearch, setHeroSearch] = useState("");
  const booksContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/discover?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const BOOKS_PER_PAGE = 10;
  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const currentBooks = books.slice(startIndex, startIndex + BOOKS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/40">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-primary/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none rounded-full dark:opacity-50 opacity-20" />
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full dark:opacity-40 opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border/70 backdrop-blur-xl text-xs font-semibold text-muted-foreground shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Next-Gen Digital Library & Shadow Archive</span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
              Unfold Infinite Worlds with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-amber-400">
                BookVerse
              </span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience books like never before: 3D realistic page-turn physics, instant discovery across Anna's Archive, and full multi-engine reading for all formats.
            </p>

            {/* Quick Hero Search Box */}
            <div className="pt-2 max-w-2xl mx-auto">
              <form
                onSubmit={handleHeroSearch}
                className="p-2 rounded-2xl bg-card border border-border/80 shadow-2xl flex flex-col sm:flex-row items-stretch gap-2 transition-all hover:border-primary/50"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 pointer-events-none" />
                  <Input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search millions of books from Anna's Archive & Open Library..."
                    className="pl-11 pr-4 h-12 bg-transparent border-0 focus-visible:ring-0 text-sm sm:text-base placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-xl font-medium bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 shadow-lg shadow-primary/25"
                >
                  Explore Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-xl h-12 px-7 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25"
              >
                <Link to="/browse">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Catalog
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl h-12 px-7 border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 backdrop-blur-xl"
              >
                <Link to="/discover">
                  <Compass className="w-4 h-4 mr-2" />
                  Discover Anna's Archive
                </Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto border-t border-border/40 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">35+</p>
                <p className="text-xs text-muted-foreground">Curated Classics</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-300">
                  20M+
                </p>
                <p className="text-xs text-muted-foreground">Anna's Archive & Texts</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">3D</p>
                <p className="text-xs text-muted-foreground">Realistic FlipBook</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-amber-500 dark:text-amber-300">100% Free</p>
                <p className="text-xs text-muted-foreground">Universal Open Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-20 border-b border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Engineered for the Modern Bibliophile
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Every detail is designed to make reading, discovering, and collecting books an effortless delight.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="rounded-2xl bg-card border border-border/60 hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-center group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Anna's Archive</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect directly with the world's open shadow libraries to discover millions of full PDFs and EPUBs.
              </p>
            </Card>

            <Card className="rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-center group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">3D FlipBook</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Smooth dual-page and single-page physics with parchment texture, zoom, and multi-engine PDF rendering.
              </p>
            </Card>

            <Card className="rounded-2xl bg-card border border-border/60 hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Canvas Page Physics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                True page-by-page rendering with zero scrollbars, parchment/dark/light reading modes, and smooth flip transitions.
              </p>
            </Card>

            <Card className="rounded-2xl bg-card border border-border/60 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">Zero Cropping</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Responsive cover display ensures 100% of book artwork and titles remain pristine on all screens.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Random Literary Thought Banner */}
      <section className="py-12 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RandomThought />
        </div>
      </section>

      {/* Catalog Showcase Section */}
      <section ref={booksContainerRef} className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Featured Volumes</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-foreground">
                Featured & Popular Books
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ViewModeToggle />
              <Button asChild variant="outline" className="rounded-xl border-border/60 hover:border-primary/50 text-xs">
                <Link to="/browse">
                  View All ({books.length})
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-border/40" />
              ))}
            </div>
          ) : (
            <>
              <BookDisplay books={currentBooks} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-xl border-border/60 text-xs gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  <span className="text-xs text-muted-foreground px-2">
                    Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl border-border/60 text-xs gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
