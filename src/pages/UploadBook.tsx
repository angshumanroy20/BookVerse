import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { compressImage, sanitizeFileName } from "@/utils/imageCompression";

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  synopsis: string;
}

export default function UploadBook() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const form = useForm<BookFormData>({
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      synopsis: "",
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setCoverFile(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "PDF file must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload books",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!coverFile) {
      toast({
        title: "Cover Image Required",
        description: "Please select a cover image",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress("Compressing cover image...");

      const compressedCover = await compressImage(coverFile, 1);
      const coverFileName = sanitizeFileName(`${Date.now()}_${compressedCover.name}`);

      if (compressedCover.size < coverFile.size) {
        toast({
          title: "Image Compressed",
          description: `Cover image compressed to ${(compressedCover.size / 1024).toFixed(0)}KB`,
        });
      }

      setUploadProgress("Uploading cover image...");
      const coverUrl = await api.uploadBookCover(compressedCover, coverFileName);

      let pdfUrl = null;
      if (pdfFile) {
        setUploadProgress("Uploading PDF...");
        const pdfFileName = sanitizeFileName(`${Date.now()}_${pdfFile.name}`);
        pdfUrl = await api.uploadBookPdf(pdfFile, pdfFileName);
      }

      setUploadProgress("Creating book entry...");
      const book = await api.createBook({
        title: data.title,
        author: data.author,
        genre: data.genre || null,
        synopsis: data.synopsis || null,
        cover_image_url: coverUrl,
        pdf_url: pdfUrl,
        created_by: user.id,
      });

      toast({
        title: "Success",
        description: "Book uploaded successfully",
      });

      navigate(`/book/${book?.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-display">Upload Book</CardTitle>
            <CardDescription>
              Share your favorite books with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  rules={{ required: "Author is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fiction, Mystery, Romance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="synopsis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synopsis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a brief description of the book"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Cover Image * (Max 1MB)</FormLabel>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {coverFile ? coverFile.name : "Click to upload cover image"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <FormLabel>PDF File (Optional, Max 10MB)</FormLabel>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {pdfFile ? pdfFile.name : "Click to upload PDF"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {uploadProgress && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress}
                  </div>
                )}

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Book"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
