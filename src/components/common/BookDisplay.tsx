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
            <Card className="overflow-hidden hover-lift group cursor-pointer">
              <div className="flex gap-4 p-4">
                <div className="relative w-24 xl:w-32 aspect-[2/3] flex-shrink-0 overflow-hidden bg-muted rounded-md">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-lg xl:text-xl mb-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm xl:text-base text-muted-foreground mb-2">
                    by {book.author}
                  </p>
                  {book.genre && (
                    <p className="text-xs xl:text-sm text-muted-foreground mb-2">
                      Genre: {book.genre}
                    </p>
                  )}
                  {book.synopsis && (
                    <p className="text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3">
                      {book.synopsis}
                    </p>
                  )}
                  {"avg_rating" in book && book.avg_rating !== null && book.avg_rating !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {book.avg_rating.toFixed(1)}
                      </span>
                      {"review_count" in book && book.review_count !== undefined && book.review_count > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({book.review_count} {book.review_count === 1 ? "review" : "reviews"})
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
          <Card className="overflow-hidden hover-lift group h-full cursor-pointer">
            <div className="relative aspect-[2/3] overflow-hidden bg-muted">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
              {book.genre && (
                <p className="text-xs text-muted-foreground mt-1">{book.genre}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
