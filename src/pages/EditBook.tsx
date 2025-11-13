import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Book } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { compressImage } from "@/utils/imageCompression";

export default function EditBook() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    if (!id) return;

    try {
      const bookData = await api.getBookById(id);
      if (!bookData) {
        toast({
          title: "Error",
          description: "Book not found",
          variant: "destructive",
        });
        navigate("/browse");
        return;
      }

      // Check if user has permission to edit (creator or admin)
      const canEdit = bookData.created_by === user?.id || profile?.role === "admin";
      if (!canEdit) {
        toast({
          title: "Error",
          description: "You don't have permission to edit this book",
          variant: "destructive",
        });
        navigate(`/book/${id}`);
        return;
      }

      setBook(bookData);
      setTitle(bookData.title);
      setAuthor(bookData.author);
      setGenre(bookData.genre || "");
      setSynopsis(bookData.synopsis || "");
      setCoverImagePreview(bookData.cover_image_url || "");
    } catch (error) {
      console.error("Error loading book:", error);
      toast({
        title: "Error",
        description: "Failed to load book",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setCoverImage(compressedFile);
      setCoverImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "PDF file size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      toast({
        title: "Error",
        description: "Title and author are required",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setSubmitting(true);

    try {
      let coverImageUrl = book?.cover_image_url;
      let pdfUrl = book?.pdf_url;

      if (coverImage) {
        const fileName = `cover-${Date.now()}-${coverImage.name}`;
        coverImageUrl = await api.uploadBookCover(coverImage, fileName);
      }

      if (pdfFile) {
        const fileName = `pdf-${Date.now()}-${pdfFile.name}`;
        pdfUrl = await api.uploadBookPdf(pdfFile, fileName);
      }

      await api.updateBook(id, {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim() || null,
        synopsis: synopsis.trim() || null,
        cover_image_url: coverImageUrl,
        pdf_url: pdfUrl,
      });

      toast({
        title: "Success",
        description: "Book updated successfully",
      });

      navigate(`/book/${id}`);
    } catch (error) {
      console.error("Error updating book:", error);
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/book/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Book
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-display">Edit Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Fiction, Mystery, Romance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Enter book synopsis"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image</Label>
                {coverImagePreview && (
                  <div className="mb-4">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-48 h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to keep current cover image
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">PDF File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {pdfFile
                    ? `Selected: ${pdfFile.name}`
                    : "Leave empty to keep current PDF file (Max 50MB)"}
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Update Book
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/book/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
