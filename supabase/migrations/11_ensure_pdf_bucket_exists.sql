/*
# Ensure PDF Storage Bucket Exists

## Purpose
This migration ensures the book PDF storage bucket exists with proper configuration and policies.

## Changes
1. Create or update the book_pdfs storage bucket
2. Set file size limit to 10MB
3. Restrict to PDF files only
4. Configure public read access
5. Set up RLS policies for upload/delete

## Bucket Configuration
- **Name**: app-7flusvzm3281_book_pdfs
- **Public**: Yes (for public read access)
- **File Size Limit**: 10MB (10485760 bytes)
- **Allowed MIME Types**: application/pdf only

## Security Policies
- **SELECT**: Public read access (anyone can download PDFs)
- **INSERT**: Authenticated users only (must be logged in to upload)
- **UPDATE**: Owner only (can update their own uploads)
- **DELETE**: Owner or admin only (can delete their own uploads or admin can delete any)
*/

-- Ensure the bucket exists with correct configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('app-7flusvzm3281_book_pdfs', 'app-7flusvzm3281_book_pdfs', true, 10485760, ARRAY['application/pdf']::text[])
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Book PDFs are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploaded book PDFs" ON storage.objects;

-- Recreate policies with correct configuration
CREATE POLICY "Book PDFs are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_book_pdfs');

CREATE POLICY "Authenticated users can upload book PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_book_pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their uploaded book PDFs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'app-7flusvzm3281_book_pdfs' AND auth.uid() = owner);

CREATE POLICY "Users can delete their uploaded book PDFs" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_book_pdfs' AND (auth.uid() = owner OR is_admin(auth.uid())));
