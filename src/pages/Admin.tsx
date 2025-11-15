import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile, Book, ContactSubmission, ContactSubmissionWithReplies } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, BookOpen, Edit, Trash2, Eye, BarChart3, Library, MessageSquare, Reply, Mail, Bot, Play, RefreshCw } from "lucide-react";

export default function Admin() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmissionWithReplies | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [botRunning, setBotRunning] = useState(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (profile?.role === "admin") {
      loadProfiles();
      loadBooks();
      loadStats();
      loadContactSubmissions();
    }
  }, [profile]);

  const loadProfiles = async () => {
    try {
      const data = await api.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      setBooksLoading(true);
      const data = await api.getBooks(100);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setBooksLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [usersData, booksData, reviewsData] = await Promise.all([
        api.getAllProfiles(),
        api.getBooks(1000),
        api.getAllReviews(),
      ]);
      setStats({
        totalUsers: usersData.length,
        totalBooks: booksData.length,
        totalReviews: reviewsData.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadContactSubmissions = async () => {
    try {
      setContactsLoading(true);
      const data = await api.getContactSubmissions();
      setContactSubmissions(data);
    } catch (error) {
      console.error("Error loading contact submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        variant: "destructive",
      });
    } finally {
      setContactsLoading(false);
    }
  };

  const handleContactStatusChange = async (id: string, status: string) => {
    try {
      await api.updateContactSubmissionStatus(id, status);
      setContactSubmissions(
        contactSubmissions.map((c) => (c.id === id ? { ...c, status: status as any } : c))
      );
      toast({
        title: "Success",
        description: "Contact status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      await api.updateProfile(userId, { role: newRole });
      setProfiles(profiles.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await api.deleteBook(bookId);
      setBooks(books.filter((b) => b.id !== bookId));
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteProfile(userId);
      setProfiles(profiles.filter((p) => p.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleViewSubmission = async (submissionId: string) => {
    try {
      const submission = await api.getContactSubmissionWithReplies(submissionId);
      setSelectedSubmission(submission);
      setViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    }
  };

  const handleOpenReplyDialog = async (submissionId: string) => {
    try {
      const submission = await api.getContactSubmissionWithReplies(submissionId);
      setSelectedSubmission(submission);
      setReplyMessage("");
      setReplyDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedSubmission || !profile?.id || !replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    try {
      setReplyLoading(true);
      await api.createContactReply(selectedSubmission.id, profile.id, replyMessage);
      
      await api.updateContactSubmissionStatus(selectedSubmission.id, "reviewed");
      
      setContactSubmissions(
        contactSubmissions.map((c) =>
          c.id === selectedSubmission.id ? { ...c, status: "reviewed" as any } : c
        )
      );

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      setReplyDialogOpen(false);
      setReplyMessage("");
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleRunBot = async () => {
    try {
      setBotRunning(true);
      setBotLogs(["Starting book upload bot..."]);
      
      const { data, error } = await supabase.functions.invoke("book-upload-bot");
      
      if (error) {
        throw error;
      }

      setBotLogs((prev) => [
        ...prev,
        `Bot completed successfully!`,
        `Total fetched: ${data.stats.total_fetched}`,
        `Uploaded: ${data.stats.uploaded}`,
        `Skipped: ${data.stats.skipped}`,
        `Subjects: ${data.stats.subjects_processed.join(", ")}`
      ]);

      toast({
        title: "Success",
        description: `Bot uploaded ${data.stats.uploaded} new books!`,
      });

      // Reload books to show new ones
      loadBooks();
      loadStats();
    } catch (error) {
      console.error("Error running bot:", error);
      setBotLogs((prev) => [...prev, `Error: ${error instanceof Error ? error.message : "Unknown error"}`]);
      toast({
        title: "Error",
        description: "Failed to run book upload bot",
        variant: "destructive",
      });
    } finally {
      setBotRunning(false);
    }
  };

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-bold">Admin Dashboard</h1>
          </div>
          <Button asChild>
            <Link to="/upload">
              <BookOpen className="w-4 h-4 mr-2" />
              Add New Book
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">Books in library</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">User reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="books">Books Management</TabsTrigger>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
            <TabsTrigger value="bot">Upload Bot</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  All Books ({books.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booksLoading ? (
                  <p className="text-muted-foreground">Loading books...</p>
                ) : books.length === 0 ? (
                  <p className="text-muted-foreground">No books found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cover</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell>
                              {book.cover_image_url ? (
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.genre || "N/A"}</TableCell>
                            <TableCell>
                              {new Date(book.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button asChild variant="ghost" size="sm">
                                  <Link to={`/book/${book.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm">
                                  <Link to={`/book/${book.id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Book</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{book.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Users ({profiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading users...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username || "N/A"}</TableCell>
                            <TableCell>{user.email || "N/A"}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value as "user" | "admin")}
                                disabled={user.id === profile.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.id !== profile.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete user "{user.username || user.email}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Submissions ({contactSubmissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <p className="text-muted-foreground">Loading contact submissions...</p>
                ) : contactSubmissions.length === 0 ? (
                  <p className="text-muted-foreground">No contact submissions found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.subject}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {submission.message}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={submission.status}
                                onValueChange={(value) => handleContactStatusChange(submission.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {new Date(submission.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewSubmission(submission.id)}
                                  title="View full message"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenReplyDialog(submission.id)}
                                  title="Reply to message"
                                >
                                  <Reply className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Automated Book Upload Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      About the Bot
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      The book upload bot automatically fetches book data from Open Library API and adds them to your library.
                      It fetches books from various genres including fiction, science fiction, fantasy, mystery, thriller, and more.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Fetches 15 books per run (3 books from 5 random genres)</li>
                      <li>Automatically downloads high-quality book covers (original size)</li>
                      <li>Skips books that already exist in the database</li>
                      <li>Runs without requiring authentication</li>
                      <li>Intelligent image quality with fallback support</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleRunBot} 
                      disabled={botRunning}
                      size="lg"
                      className="gap-2"
                    >
                      {botRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Running Bot...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Bot Now
                        </>
                      )}
                    </Button>
                  </div>

                  {botLogs.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Bot Logs:</h3>
                      <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                        {botLogs.map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                      💡 Pro Tip
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You can run the bot manually anytime using the button above. The bot will automatically skip any books that already exist in your library, so you can run it multiple times without creating duplicates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Submission Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Submission Details
              </DialogTitle>
              <DialogDescription>
                Full message and conversation history
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm mt-1">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm mt-1">{selectedSubmission.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                  <p className="text-sm mt-1">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="text-sm mt-1 capitalize">{selectedSubmission.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                {selectedSubmission.replies && selectedSubmission.replies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Admin Replies ({selectedSubmission.replies.length})
                    </Label>
                    <div className="mt-2 space-y-3">
                      {selectedSubmission.replies.map((reply) => (
                        <div key={reply.id} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary">
                              {reply.admin?.username || reply.admin?.email || "Admin"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.reply_message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setViewDialogOpen(false);
                if (selectedSubmission) {
                  handleOpenReplyDialog(selectedSubmission.id);
                }
              }}>
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Reply className="w-5 h-5" />
                Reply to Contact Submission
              </DialogTitle>
              <DialogDescription>
                Send a reply to {selectedSubmission?.name} ({selectedSubmission?.email})
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Original Message</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedSubmission.subject}</p>
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-3">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reply-message">Your Reply</Label>
                  <Textarea
                    id="reply-message"
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setReplyMessage("");
                }}
                disabled={replyLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSendReply} disabled={replyLoading || !replyMessage.trim()}>
                {replyLoading ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
