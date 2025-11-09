import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await api.getBooks(12);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section 
        className="relative bg-cover bg-center py-32 xl:py-40"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://miaoda-site-img.s3cdn.medo.dev/images/e2fe0e83-7631-42e2-97e4-15cddd1f8779.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl xl:text-7xl font-display font-bold mb-6 leading-tight text-white">
              Unravel the Unwritten.
              <br />
              Explore Worlds Beyond
            </h1>
            <p className="text-xl xl:text-2xl mb-8 text-white/90">
              A book is a dream that you hold in your hand. Discover your next literary obsession.
            </p>
            <Button asChild size="lg" className="text-base bg-primary hover:bg-primary/90">
              <Link to="/browse">
                <Sparkles className="w-5 h-5 mr-2" />
                Discover Your Next Obsession
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 xl:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-display font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Recently added to our collection</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/browse">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
              {books.slice(0, 6).map((book) => (
                <Link key={book.id} to={`/book/${book.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                    <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <BookOpen className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 xl:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl xl:text-4xl font-display font-bold mb-4">
              Curated Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore handpicked selections across genres and discover hidden literary gems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Vast Collection</h3>
              <p className="text-muted-foreground">
                Explore thousands of books across all genres and discover hidden literary gems
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Community Reviews</h3>
              <p className="text-muted-foreground">
                Read authentic reviews from fellow readers and share your own insights
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized book suggestions powered by AI based on your reading history
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section 
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://miaoda-site-img.s3cdn.medo.dev/images/632c160d-5b7b-4cf7-a108-126499cccd81.jpg')`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-4 text-white">
            Join Our Literary Circle
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect with fellow book lovers, share your thoughts, and discover your next favorite read
          </p>
          <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
            <Link to="/browse">
              Explore Books
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
