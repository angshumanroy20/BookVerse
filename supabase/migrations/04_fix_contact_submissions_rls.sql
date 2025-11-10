/*
# Fix Contact Submissions RLS Policy

## Changes
- Drop existing insert policy
- Create new simplified policy that allows all inserts without authentication check
- This ensures anonymous users can submit contact forms

## Security Note
This is safe because:
- Only INSERT is allowed publicly
- SELECT/UPDATE/DELETE are restricted to admins only
- No sensitive data is exposed through this policy
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

-- Create a simpler policy that definitely works for anonymous users
CREATE POLICY "Public can insert contact submissions" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);
