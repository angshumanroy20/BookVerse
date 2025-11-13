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
        className="overflow-hidden card-3d hover-lift group h-full cursor-pointer border-0 transition-all duration-300 shadow-lg hover:shadow-2xl bg-transparent"
        style={{ 
          animationDelay: `${index * 0.1}s`,
        }}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Title and Author Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-12">
            <h3 className="font-display font-bold text-white text-sm sm:text-base mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 line-clamp-1">
              {book.author}
            </p>
          </div>
        </div>
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
            <Card className="overflow-hidden hover-lift group cursor-pointer border border-border/30 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-4 sm:gap-6 p-4 sm:p-6">
                {/* Book Cover Thumbnail */}
                <div className="relative w-20 sm:w-24 aspect-[2/3] flex-shrink-0 overflow-hidden rounded-lg shadow-lg">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-display font-bold text-base sm:text-xl mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 line-clamp-1">
                    {book.author}
                  </p>
                  {book.synopsis && (
                    <p className="text-xs sm:text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {book.synopsis}
                    </p>
                  )}
                </div>

                {/* Add Button */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border/50 hover:border-primary/50 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10">
                    <span className="text-2xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
                  </div>
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
