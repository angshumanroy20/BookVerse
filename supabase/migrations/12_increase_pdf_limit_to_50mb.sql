/*
# Increase PDF Upload Limit to 50MB

## Purpose
Update the book PDF storage bucket to allow files up to 50MB instead of 10MB.

## Changes
- Update file_size_limit from 10485760 bytes (10MB) to 52428800 bytes (50MB)
- Keep all other settings the same (public access, PDF-only, RLS policies)

## Bucket Configuration
- **Name**: app-7flusvzm3281_book_pdfs
- **Public**: Yes (for public read access)
- **File Size Limit**: 50MB (52428800 bytes) ← UPDATED
- **Allowed MIME Types**: application/pdf only
*/

-- Update the bucket file size limit to 50MB
UPDATE storage.buckets 
SET file_size_limit = 52428800
WHERE id = 'app-7flusvzm3281_book_pdfs';
