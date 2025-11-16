import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReadingList, Book } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import BookDisplay from "@/components/common/BookDisplay";
import ViewModeToggle from "@/components/common/ViewModeToggle";
import { useViewMode } from "@/contexts/ViewModeContext";

export default function MyLibrary() {
  const { user } = useAuth();
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

    const books: Book[] = items
      .map((item) => (item as any).book)
      .filter((book): book is Book => book !== null && book !== undefined);

    return <BookDisplay books={books} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8 bg-muted" />
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[2/3] bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <Skeleton className="w-24 xl:w-32 aspect-[2/3] flex-shrink-0 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                      <Skeleton className="h-4 w-1/3 bg-muted" />
                      <Skeleton className="h-16 w-full bg-muted" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-display font-bold">My Library</h1>
          <ViewModeToggle />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">
                All ({readingLists.length})
              </TabsTrigger>
              <TabsTrigger value="want_to_read" className="text-xs sm:text-sm whitespace-nowrap">
                Want to Read ({filterByStatus("want_to_read").length})
              </TabsTrigger>
              <TabsTrigger value="currently_reading" className="text-xs sm:text-sm whitespace-nowrap">
                Currently Reading ({filterByStatus("currently_reading").length})
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs sm:text-sm whitespace-nowrap">
                Read ({filterByStatus("read").length})
              </TabsTrigger>
            </TabsList>
          </div>

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
