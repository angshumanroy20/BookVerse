/*
# Add Profile Picture and Bio Fields

## 1. Schema Changes

### profiles table updates
- Add `avatar_url` (text) - URL to user's profile picture
- Add `bio` (text) - Short biography/description of the user

## 2. Storage Bucket

- `app-7flusvzm3281_avatars` - for user profile pictures (max 1MB)

## 3. Security

- Users can update their own profile fields
- Profile avatars are publicly viewable
- Users can upload/update/delete their own avatars

## 4. Notes

- Avatar URL will be stored in the profiles table
- Bio is optional and can be null
- Existing profiles will have null values for new fields
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('app-7flusvzm3281_avatars', 'app-7flusvzm3281_avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'app-7flusvzm3281_avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_avatars' AND auth.uid() = owner);
