import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile, Book } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, BookOpen, Edit, Trash2, Eye, BarChart3, Library } from "lucide-react";

export default function Admin() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="books">Books Management</TabsTrigger>
            <TabsTrigger value="users">Users Management</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
