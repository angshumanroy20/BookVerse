/*
# Create Biblios Database Schema

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `username` (text, unique)
- `role` (user_role enum: 'user', 'admin')
- `created_at` (timestamptz, default: now())

### books
- `id` (uuid, primary key, default: gen_random_uuid())
- `title` (text, not null)
- `author` (text, not null)
- `genre` (text)
- `synopsis` (text)
- `cover_image_url` (text)
- `pdf_url` (text)
- `created_by` (uuid, references profiles.id)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### reviews
- `id` (uuid, primary key, default: gen_random_uuid())
- `book_id` (uuid, references books.id, on delete cascade)
- `user_id` (uuid, references profiles.id, on delete cascade)
- `rating` (integer, 1-5)
- `review_text` (text)
- `created_at` (timestamptz, default: now())

### reading_lists
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles.id, on delete cascade)
- `book_id` (uuid, references books.id, on delete cascade)
- `status` (reading_status enum: 'want_to_read', 'currently_reading', 'read')
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### bookmarks
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles.id, on delete cascade)
- `book_id` (uuid, references books.id, on delete cascade)
- `page_number` (integer, not null)
- `note` (text)
- `created_at` (timestamptz, default: now())

## 2. Storage Buckets

- `app-7flusvzm3281_book_covers` - for book cover images (max 1MB)
- `app-7flusvzm3281_book_pdfs` - for PDF files (max 10MB)

## 3. Security

- Enable RLS on all tables
- Public read access for books and reviews
- Users can manage their own reading lists and bookmarks
- Only book creators and admins can edit/delete books
- Admin helper function for role checking
- First registered user becomes admin via trigger

## 4. Notes

- All users can view books and reviews
- Users must be logged in to add books, reviews, reading lists, and bookmarks
- Admins have full access to all data
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE reading_status AS ENUM ('want_to_read', 'currently_reading', 'read');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  username text UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text,
  synopsis text,
  cover_image_url text,
  pdf_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, user_id)
);

-- Create reading_lists table
CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  status reading_status DEFAULT 'want_to_read'::reading_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('app-7flusvzm3281_book_covers', 'app-7flusvzm3281_book_covers', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('app-7flusvzm3281_book_pdfs', 'app-7flusvzm3281_book_pdfs', true, 10485760, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()));

-- Books policies (public read, authenticated write)
CREATE POLICY "Books are viewable by everyone" ON books
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create books" ON books
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Book creators can update their books" ON books
  FOR UPDATE USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Book creators can delete their books" ON books
  FOR DELETE USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Reviews policies (public read, authenticated write)
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Reading lists policies (private to user)
CREATE POLICY "Users can view their own reading lists" ON reading_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading lists" ON reading_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading lists" ON reading_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading lists" ON reading_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies (private to user)
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for book covers
CREATE POLICY "Book covers are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_book_covers');

CREATE POLICY "Authenticated users can upload book covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_book_covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their uploaded book covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'app-7flusvzm3281_book_covers' AND auth.uid() = owner);

CREATE POLICY "Users can delete their uploaded book covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_book_covers' AND (auth.uid() = owner OR is_admin(auth.uid())));

-- Storage policies for book PDFs
CREATE POLICY "Book PDFs are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_book_pdfs');

CREATE POLICY "Authenticated users can upload book PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_book_pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their uploaded book PDFs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'app-7flusvzm3281_book_pdfs' AND auth.uid() = owner);

CREATE POLICY "Users can delete their uploaded book PDFs" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_book_pdfs' AND (auth.uid() = owner OR is_admin(auth.uid())));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_book_id ON reading_lists(book_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON bookmarks(book_id);
