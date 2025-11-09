import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReadingList, Bookmark } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Bookmark as BookmarkIcon, Library, Star } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [listsData, bookmarksData] = await Promise.all([
        api.getUserReadingLists(user.id),
        api.getUserBookmarks(user.id),
      ]);
      setReadingLists(listsData);
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    wantToRead: readingLists.filter((item) => item.status === "want_to_read").length,
    currentlyReading: readingLists.filter((item) => item.status === "currently_reading").length,
    read: readingLists.filter((item) => item.status === "read").length,
    bookmarked: bookmarks.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8 bg-muted" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-8">My Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Want to Read</CardTitle>
              <Library className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.wantToRead}</div>
              <p className="text-xs text-muted-foreground mt-1">books in queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currently Reading</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.currentlyReading}</div>
              <p className="text-xs text-muted-foreground mt-1">books in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.read}</div>
              <p className="text-xs text-muted-foreground mt-1">books finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
              <BookmarkIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.bookmarked}</div>
              <p className="text-xs text-muted-foreground mt-1">saved books</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Currently Reading
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.currentlyReading === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No books currently reading
                </p>
              ) : (
                <div className="space-y-4">
                  {readingLists
                    .filter((item) => item.status === "currently_reading")
                    .slice(0, 5)
                    .map((item) => {
                      const book = (item as any).book;
                      if (!book) return null;

                      return (
                        <Link
                          key={item.id}
                          to={`/book/${book.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="w-12 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                            {book.cover_image_url ? (
                              <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{book.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5" />
                Bookmarked Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No bookmarked books yet
                </p>
              ) : (
                <div className="space-y-4">
                  {bookmarks.slice(0, 5).map((bookmark) => {
                    const book = (bookmark as any).book;
                    if (!book) return null;

                    return (
                      <Link
                        key={bookmark.id}
                        to={`/book/${book.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{book.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
