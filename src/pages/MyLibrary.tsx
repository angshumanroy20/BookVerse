import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReadingList } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function MyLibrary() {
  const { user } = useAuth();
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReadingLists();
    }
  }, [user]);

  const loadReadingLists = async () => {
    if (!user) return;

    try {
      const data = await api.getUserReadingLists(user.id);
      setReadingLists(data);
    } catch (error) {
      console.error("Error loading reading lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: string) => {
    return readingLists.filter((item) => item.status === status);
  };

  const renderBookGrid = (items: ReadingList[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No books in this list yet</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {items.map((item) => {
          const book = (item as any).book;
          if (!book) return null;

          return (
            <Link key={item.id} to={`/book/${book.id}`}>
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
                  <h3 className="font-display font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8 bg-muted" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-8">My Library</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All ({readingLists.length})</TabsTrigger>
            <TabsTrigger value="want_to_read">
              Want to Read ({filterByStatus("want_to_read").length})
            </TabsTrigger>
            <TabsTrigger value="currently_reading">
              Currently Reading ({filterByStatus("currently_reading").length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({filterByStatus("read").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderBookGrid(readingLists)}</TabsContent>
          <TabsContent value="want_to_read">
            {renderBookGrid(filterByStatus("want_to_read"))}
          </TabsContent>
          <TabsContent value="currently_reading">
            {renderBookGrid(filterByStatus("currently_reading"))}
          </TabsContent>
          <TabsContent value="read">
            {renderBookGrid(filterByStatus("read"))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
