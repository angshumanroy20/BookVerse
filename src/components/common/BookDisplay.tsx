import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import type { Book, BookWithDetails } from "@/types/types";

interface BookDisplayProps {
  books: (Book | BookWithDetails)[];
}

export default function BookDisplay({ books }: BookDisplayProps) {
  const { viewMode } = useViewMode();

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {books.map((book) => (
          <Link key={book.id} to={`/book/${book.id}`}>
            <Card className="overflow-hidden hover-lift group cursor-pointer border-2 border-border/50 hover:border-primary/30 transition-all duration-300 shadow-elegant">
              <div className="flex gap-6 p-5">
                <div className="relative w-28 xl:w-36 aspect-[2/3] flex-shrink-0 overflow-hidden bg-muted rounded-2xl shadow-elegant">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gradient-primary">
                      <BookOpen className="w-10 h-10 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-xl xl:text-2xl mb-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-base xl:text-lg text-muted-foreground mb-3 font-medium">
                    by {book.author}
                  </p>
                  {book.genre && (
                    <div className="inline-block px-3 py-1 bg-muted/50 rounded-full text-xs xl:text-sm text-muted-foreground mb-3">
                      {book.genre}
                    </div>
                  )}
                  {book.synopsis && (
                    <p className="text-sm xl:text-base text-muted-foreground line-clamp-2 xl:line-clamp-3 leading-relaxed">
                      {book.synopsis}
                    </p>
                  )}
                  {"avg_rating" in book && book.avg_rating !== null && book.avg_rating !== undefined && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {book.avg_rating.toFixed(1)}
                        </span>
                      </div>
                      {"review_count" in book && book.review_count !== undefined && book.review_count > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {book.review_count} {book.review_count === 1 ? "review" : "reviews"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <Link key={book.id} to={`/book/${book.id}`}>
          <Card className="overflow-hidden hover-lift group h-full cursor-pointer border-2 border-border/50 hover:border-primary/30 transition-all duration-300 shadow-elegant">
            <div className="relative aspect-[2/3] overflow-hidden bg-muted">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center gradient-primary">
                  <BookOpen className="w-20 h-20 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-5">
              <h3 className="font-display font-bold text-base xl:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2 font-medium">{book.author}</p>
              {book.genre && (
                <div className="inline-block px-2 py-0.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
                  {book.genre}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
