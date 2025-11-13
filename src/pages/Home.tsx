import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star, TrendingUp, Sparkles, ChevronLeft, ChevronRight, ArrowRight, Library, Users, Heart } from "lucide-react";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import RandomThought from "@/components/common/RandomThought";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useFadeInOnScroll, useStaggerAnimation } from "@/hooks/use3DAnimation";

export default function Home() {
  const { profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { viewMode } = useViewMode();
  const [isMobile, setIsMobile] = useState(false);
  const animatedItems = useStaggerAnimation(100);
  const { ref: sectionRef, isVisible } = useFadeInOnScroll(0.1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await api.getBooks(50);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const BOOKS_PER_PAGE = isMobile ? 6 : 5;
  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const currentBooks = books.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section - Split Layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-soft via-purple-soft to-blue-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 xl:py-24">
          <div className="grid xl:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-left">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-display font-bold leading-tight">
                {profile ? (
                  <>
                    <span className="gradient-text">Welcome back,</span>
                    <br />
                    <span className="text-foreground break-words">{profile.username}! 📚</span>
                  </>
                ) : (
                  <>
                    <span className="gradient-text">Discover</span>
                    <br />
                    <span className="text-foreground">Your Next</span>
                    <br />
                    <span className="gradient-text-warm">Great Read</span>
                  </>
                )}
              </h1>

              <p className="text-lg xl:text-xl text-muted-foreground max-w-xl">
                {profile 
                  ? "Continue your reading adventure with personalized recommendations and your curated collection."
                  : "Join thousands of book lovers discovering, sharing, and celebrating the magic of reading."
                }
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="gradient-primary text-white hover-lift shadow-glow-primary rounded-2xl text-base px-8"
                >
                  <Link to="/browse">
                    <BookOpen className="w-5 h-5 mr-2" />
                    {profile ? "Browse Library" : "Start Exploring"}
                  </Link>
                </Button>
                
                {!profile && (
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="rounded-2xl text-base px-8 border-2 hover-lift"
                  >
                    <Link to="/login">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Join Now
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-fade-in-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover-lift">
                <img 
                  src="https://miaoda-site-img.s3cdn.medo.dev/images/845502f2-3391-44bb-81c5-fce390c05642.jpg"
                  alt="Person reading book in cozy setting"
                  className="w-full h-[500px] xl:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-3d-float pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-3d-float pointer-events-none" style={{ animationDelay: '2s' }} />
      </section>

      {/* Random Thought Section */}
      <section className="py-12 xl:py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RandomThought />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 xl:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-display font-bold mb-4">
              Why Choose <span className="gradient-text">BookVerse</span>?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover, organize, and enjoy your reading journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-coral hover-lift border-0">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-glow-primary">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">Vast Library</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Access thousands of books across all genres. From classics to contemporary bestsellers.
                </p>
              </CardContent>
            </Card>

            <Card className="card-purple hover-lift border-0">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-secondary rounded-2xl flex items-center justify-center shadow-glow-secondary">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">Smart Recommendations</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  AI-powered suggestions based on your reading history and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="card-mint hover-lift border-0">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center shadow-glow-accent">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">Community</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Connect with fellow readers, share reviews, and discover hidden gems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section ref={sectionRef} className="py-12 sm:py-16 xl:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-2xl sm:text-3xl xl:text-5xl font-display font-bold mb-2">
                <span className="gradient-text">New Arrivals</span>
              </h2>
              <p className="text-sm sm:text-base xl:text-lg text-muted-foreground">Recently added to our collection</p>
            </div>
            <div className="flex items-center gap-4">
              <ViewModeToggle />
              <Button asChild variant="outline" className="hover-lift rounded-2xl border-2">
                <Link to="/browse">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {loading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
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
                  <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
                    <div className="flex gap-4 sm:gap-6 p-4 sm:p-5">
                      <Skeleton className="w-24 xl:w-32 aspect-[2/3] flex-shrink-0 bg-muted rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 sm:h-6 w-3/4 bg-muted" />
                        <Skeleton className="h-4 w-1/2 bg-muted" />
                        <Skeleton className="h-3 sm:h-4 w-1/3 bg-muted" />
                        <Skeleton className="h-12 sm:h-16 w-full bg-muted" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <>
              <BookDisplay books={currentBooks} />
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => handlePageClick(page)}
                            className={`rounded-2xl transition-all duration-300 ${
                              currentPage === page
                                ? "gradient-primary text-white shadow-glow-primary"
                                : "border-2 hover:bg-muted/50"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-muted-foreground px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!profile && (
        <section className="py-20 xl:py-28 bg-gradient-to-br from-primary via-pink to-secondary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-3d-float" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-3d-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl xl:text-6xl font-display font-bold text-white mb-6">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community of passionate readers and unlock a world of literary adventures.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 hover-lift shadow-2xl rounded-2xl text-base px-8"
              >
                <Link to="/signup">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-2xl text-base px-8"
              >
                <Link to="/browse">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Books
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
