import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReadingList, Bookmark, Review } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, Bookmark as BookmarkIcon, Library, Star, Upload, Search, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [listsData, bookmarksData, reviewsData] = await Promise.all([
        api.getUserReadingLists(user.id),
        api.getUserBookmarks(user.id),
        api.getUserReviews(user.id),
      ]);
      setReadingLists(listsData);
      setBookmarks(bookmarksData);
      setReviews(reviewsData);
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
    reviews: reviews.length,
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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Welcome back, {profile?.username || "Reader"}! 📚
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your reading journey
          </p>
        </div>

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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="default" className="h-auto py-6">
                <Link to="/upload" className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6" />
                  <span>Upload New Book</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/browse" className="flex flex-col items-center gap-2">
                  <Search className="w-6 h-6" />
                  <span>Browse Books</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/my-library" className="flex flex-col items-center gap-2">
                  <Library className="w-6 h-6" />
                  <span>My Library</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                My Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{stats.reviews}</div>
                  <p className="text-sm text-muted-foreground">
                    You've reviewed {stats.reviews} {stats.reviews === 1 ? "book" : "books"}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/my-library">View All Reviews</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reading Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">
                      {readingLists.length > 0
                        ? Math.round((stats.read / readingLists.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${
                          readingLists.length > 0
                            ? (stats.read / readingLists.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.read} of {readingLists.length} books completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5" />
                Library Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Books</span>
                  <span className="font-bold">{readingLists.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bookmarks</span>
                  <span className="font-bold">{stats.bookmarked}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="font-bold">{stats.reviews}</span>
                </div>
              </div>
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
