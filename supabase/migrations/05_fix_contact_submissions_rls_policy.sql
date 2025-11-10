/*
# Fix Contact Submissions RLS Policy

This migration fixes the Row Level Security policy for the contact_submissions table
to allow anonymous users to submit contact forms.

## Changes
1. Drop the existing "Public can insert contact submissions" policy
2. Create a new policy that explicitly allows INSERT for anon and authenticated roles
3. Ensure the policy uses WITH CHECK (true) to allow all inserts

## Security
- Anonymous users can INSERT new contact submissions
- Only admins can SELECT and UPDATE submissions (existing policies)
- This is safe because contact forms should be publicly accessible
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;

-- Create a new policy that explicitly allows anon and authenticated users
CREATE POLICY "Anyone can submit contact form" 
ON contact_submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
