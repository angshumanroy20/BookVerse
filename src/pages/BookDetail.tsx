import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Book, Review, ReadingStatus, BookWithDetails } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Star, Edit, Trash2, Download, Bookmark, BookmarkCheck, BookOpenCheck, User as UserIcon, Clock, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookRecommendations } from "@/components/BookRecommendations";
import FlipBookReader from "@/components/common/FlipBookReader";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<BookWithDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookData();
    }
  }, [id, user]);

  const loadBookData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [bookData, reviewsData, ratingData] = await Promise.all([
        api.getBookById(id),
        api.getReviewsByBookId(id),
        api.getBookAverageRating(id),
      ]);

      setBook(bookData);
      setReviews(reviewsData);
      setAvgRating(ratingData.avg);
      setReviewCount(ratingData.count);

      if (user) {
        const userReviewData = await api.getUserReviewForBook(id, user.id);
        setUserReview(userReviewData);
        if (userReviewData) {
          setNewRating(userReviewData.rating);
          setNewReviewText(userReviewData.review_text || "");
        }

        const status = await api.getUserReadingStatus(user.id, id);
        setReadingStatus(status);

        const bookmarkData = await api.checkBookmark(user.id, id);
        setIsBookmarked(!!bookmarkData);
      }
    } catch (error) {
      console.error("Error loading book:", error);
      toast({
        title: "Error",
        description: "Failed to load book details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user || !id) {
      navigate("/login");
      return;
    }

    try {
      if (isBookmarked) {
        await api.deleteBookmarkByBook(user.id, id);
        setIsBookmarked(false);
        toast({ title: "Success", description: "Bookmark removed" });
      } else {
        await api.createBookmark({
          user_id: user.id,
          book_id: id,
          page_number: 1,
          note: null,
        });
        setIsBookmarked(true);
        toast({ title: "Success", description: "Book bookmarked" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !id) {
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      if (userReview) {
        await api.updateReview(userReview.id, {
          rating: newRating,
          review_text: newReviewText,
        });
        toast({ title: "Success", description: "Review updated" });
      } else {
        await api.createReview({
          book_id: id,
          user_id: user.id,
          rating: newRating,
          review_text: newReviewText || null,
        });
        toast({ title: "Success", description: "Review submitted" });
      }
      loadBookData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReadingStatusChange = async (status: ReadingStatus) => {
    if (!user || !id) {
      navigate("/login");
      return;
    }

    try {
      await api.addToReadingList(user.id, id, status);
      setReadingStatus(status);
      toast({ title: "Success", description: "Added to your library" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reading list",
        variant: "destructive",
      });
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "PDF file must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleUploadPdf = async () => {
    if (!pdfFile || !id || !book) return;

    try {
      setUploading(true);
      const pdfFileName = sanitizeFileName(`${Date.now()}_${pdfFile.name}`);
      const pdfUrl = await api.uploadBookPdf(pdfFile, pdfFileName);

      await api.updateBook(id, { pdf_url: pdfUrl });

      setBook({ ...book, pdf_url: pdfUrl });
      setPdfFile(null);
      setIsUploadDialogOpen(false);

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!id) return;

    try {
      await api.deleteBook(id);
      toast({ title: "Success", description: "Book deleted" });
      navigate("/browse");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="w-full aspect-[2/3] bg-muted" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4 bg-muted" />
              <Skeleton className="h-6 w-1/2 bg-muted" />
              <Skeleton className="h-32 w-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Book not found</h2>
          <Button asChild>
            <Link to="/browse">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === book.created_by || profile?.role === "admin");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="sticky top-24">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {book.genre && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {book.genre}
                  </span>
                )}
                {book.creator && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                    <span>Uploaded by <span className="font-medium text-foreground">{book.creator.username || "Anonymous"}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(book.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(avgRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            {book.synopsis && (
              <div>
                <h2 className="text-xl font-display font-bold mb-2">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{book.synopsis}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {user && (
                <>
                  <Select value={readingStatus || ""} onValueChange={(value) => handleReadingStatusChange(value as ReadingStatus)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add to library" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want_to_read">Want to Read</SelectItem>
                      <SelectItem value="currently_reading">Currently Reading</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleToggleBookmark} variant="outline">
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 mr-2" />
                        Bookmark
                      </>
                    )}
                  </Button>
                </>
              )}

              {book.pdf_url && (
                <>
                  <Button onClick={() => setIsPdfViewerOpen(true)} variant="default">
                    <BookOpenCheck className="w-4 h-4 mr-2" />
                    Read Book
                  </Button>
                  <Button asChild variant="outline">
                    <a href={book.pdf_url} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                </>
              )}

              {!book.pdf_url && canEdit && (
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload PDF</DialogTitle>
                      <DialogDescription>
                        Add a PDF file for this book to enable reading functionality
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="pdf-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {pdfFile ? pdfFile.name : "Click to upload PDF (max 50MB)"}
                            </p>
                          </div>
                          <input
                            id="pdf-upload"
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handlePdfFileChange}
                          />
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsUploadDialogOpen(false);
                            setPdfFile(null);
                          }}
                          disabled={uploading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUploadPdf}
                          disabled={!pdfFile || uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {canEdit && (
                <>
                  <Button asChild variant="outline">
                    <Link to={`/book/${book.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBook}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <h2 className="text-2xl font-display font-bold mb-6">Reviews</h2>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">
                {user ? (userReview ? "Edit Your Review" : "Write a Review") : "Write a Review"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!user) {
                            toast({
                              title: "Sign in required",
                              description: "Please sign in to rate this book",
                            });
                            navigate("/login");
                            return;
                          }
                          setNewRating(i + 1);
                        }}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            i < newRating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                  <Textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    onFocus={() => {
                      if (!user) {
                        toast({
                          title: "Sign in required",
                          description: "Please sign in to write a review",
                        });
                        navigate("/login");
                      }
                    }}
                    placeholder="Share your thoughts about this book..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={submitting || !user}>
                  {submitting ? "Submitting..." : user ? (userReview ? "Update Review" : "Submit Review") : "Sign in to Review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review this book!
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={(review as any).user?.avatar_url || undefined} 
                          alt={(review as any).user?.username || "User"} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {((review as any).user?.username?.[0] || "A").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {(review as any).user?.username || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-muted-foreground mt-2">{review.review_text}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <BookRecommendations currentBook={book} />
      </div>

      {book.pdf_url && isPdfViewerOpen && (
        <FlipBookReader
          pdfUrl={book.pdf_url}
          bookTitle={book.title}
          onClose={() => setIsPdfViewerOpen(false)}
        />
      )}
    </div>
  );
}
