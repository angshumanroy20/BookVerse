import { supabase } from "./supabase";
import type { Book, Review, ReadingList, Bookmark, Profile, ReadingStatus } from "@/types/types";

export const api = {
  // Books
  async getBooks(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBookById(id: string) {
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        creator:profiles!created_by(id, username, email)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async searchBooks(query: string, limit = 20) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,genre.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBooksByGenre(genre: string, limit = 20) {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("genre", genre)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllGenres() {
    const { data, error } = await supabase
      .from("books")
      .select("genre")
      .not("genre", "is", null)
      .order("genre", { ascending: true });

    if (error) throw error;
    
    const genres = Array.isArray(data) 
      ? [...new Set(data.map(item => item.genre).filter(Boolean))]
      : [];
    
    return genres;
  },

  async createBook(book: Omit<Book, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("books")
      .insert(book)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateBook(id: string, updates: Partial<Book>) {
    const { data, error } = await supabase
      .from("books")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteBook(id: string) {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw error;
  },

  // Reviews
  async getReviewsByBookId(bookId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:profiles(id, username, email)
      `)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUserReviewForBook(bookId: string, userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("book_id", bookId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        book:books(id, title, author, cover_image_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createReview(review: Omit<Review, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("reviews")
      .insert(review)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateReview(id: string, updates: Partial<Review>) {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteReview(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  },

  async getAllReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBookAverageRating(bookId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("book_id", bookId);

    if (error) throw error;
    if (!data || data.length === 0) return { avg: 0, count: 0 };

    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    return { avg: Math.round(avg * 10) / 10, count: data.length };
  },

  // Reading Lists
  async getUserReadingLists(userId: string) {
    const { data, error } = await supabase
      .from("reading_lists")
      .select(`
        *,
        book:books(*)
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUserReadingStatus(userId: string, bookId: string) {
    const { data, error } = await supabase
      .from("reading_lists")
      .select("status")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error) throw error;
    return data?.status || null;
  },

  async addToReadingList(userId: string, bookId: string, status: ReadingStatus) {
    const { data, error } = await supabase
      .from("reading_lists")
      .upsert(
        { user_id: userId, book_id: bookId, status, updated_at: new Date().toISOString() },
        { onConflict: "user_id,book_id" }
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateReadingStatus(userId: string, bookId: string, status: ReadingStatus) {
    const { data, error } = await supabase
      .from("reading_lists")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async removeFromReadingList(userId: string, bookId: string) {
    const { error } = await supabase
      .from("reading_lists")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) throw error;
  },

  // Bookmarks
  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*, book:books(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBookmarksByBook(userId: string, bookId: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("page_number", { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async checkBookmark(userId: string, bookId: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createBookmark(bookmark: Omit<Bookmark, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert(bookmark)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteBookmarkByBook(userId: string, bookId: string) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) throw error;
  },

  async updateBookmark(id: string, updates: Partial<Bookmark>) {
    const { data, error } = await supabase
      .from("bookmarks")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) throw error;
  },

  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;
  },

  // Storage
  async uploadBookCover(file: File, fileName: string) {
    const { data, error } = await supabase.storage
      .from("app-7flusvzm3281_book_covers")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("app-7flusvzm3281_book_covers")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async uploadBookPdf(file: File, fileName: string) {
    const { data, error } = await supabase.storage
      .from("app-7flusvzm3281_book_pdfs")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("app-7flusvzm3281_book_pdfs")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async deleteFile(bucket: string, fileName: string) {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);
    if (error) throw error;
  },
};
