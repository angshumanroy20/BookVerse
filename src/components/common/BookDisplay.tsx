import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import type { Book, BookWithDetails } from "@/types/types";
import { use3DTilt } from "@/hooks/use3DAnimation";

interface BookDisplayProps {
  books: (Book | BookWithDetails)[];
}

function BookCard({ book, index }: { book: Book | BookWithDetails; index: number }) {
  const tiltRef = use3DTilt(8);
  
  return (
    <Link key={book.id} to={`/book/${book.id}`}>
      <Card 
        ref={tiltRef}
        className="overflow-hidden card-3d hover-lift group h-full cursor-pointer border-2 border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
        style={{ 
          animationDelay: `${index * 0.1}s`,
        }}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center gradient-primary">
              <BookOpen className="w-12 h-12 text-primary-foreground animate-3d-float" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3 sm:p-4 flex flex-col">
          <h3 className="font-display font-bold text-sm sm:text-base xl:text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
            {book.author}
          </p>
          <div className="mt-auto">
            {book.genre && (
              <div className="inline-block px-2 py-1 bg-primary/10 rounded-full text-xs text-primary font-medium mb-2">
                {book.genre}
              </div>
            )}
            {"avg_rating" in book && book.avg_rating !== null && book.avg_rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {book.avg_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BookDisplay({ books }: BookDisplayProps) {
  const { viewMode } = useViewMode();

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {books.map((book) => (
          <Link key={book.id} to={`/book/${book.id}`}>
            <Card className="overflow-hidden hover-lift group cursor-pointer border-2 border-border/50 hover:border-primary/30 transition-all duration-300 shadow-elegant h-full">
              <div className="flex gap-3 sm:gap-6 p-3 sm:p-5 min-h-[180px] sm:min-h-[200px]">
                <div className="relative w-24 sm:w-28 xl:w-36 aspect-[2/3] flex-shrink-0 overflow-hidden bg-muted rounded-xl sm:rounded-2xl shadow-elegant">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gradient-primary">
                      <BookOpen className="w-8 sm:w-10 h-8 sm:h-10 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-display font-bold text-base sm:text-xl xl:text-2xl mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm sm:text-base xl:text-lg text-muted-foreground mb-2 sm:mb-3 font-medium line-clamp-1">
                    by {book.author}
                  </p>
                  {book.genre && (
                    <div className="inline-block px-2 sm:px-3 py-1 bg-muted/50 rounded-full text-xs xl:text-sm text-muted-foreground mb-2 sm:mb-3 w-fit">
                      {book.genre}
                    </div>
                  )}
                  {book.synopsis && (
                    <p className="text-xs sm:text-sm xl:text-base text-muted-foreground line-clamp-2 leading-relaxed mb-2 sm:mb-3 flex-grow">
                      {book.synopsis}
                    </p>
                  )}
                  {"avg_rating" in book && book.avg_rating !== null && book.avg_rating !== undefined && (
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 rounded-full">
                        <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-primary text-primary" />
                        <span className="text-xs sm:text-sm font-semibold text-primary">
                          {book.avg_rating.toFixed(1)}
                        </span>
                      </div>
                      {"review_count" in book && book.review_count !== undefined && book.review_count > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground">
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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {books.map((book, index) => (
        <BookCard key={book.id} book={book} index={index} />
      ))}
    </div>
  );
}
