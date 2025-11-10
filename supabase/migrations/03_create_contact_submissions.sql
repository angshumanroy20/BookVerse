/*
# Create Contact Submissions Table

## 1. New Tables

### contact_submissions
- `id` (uuid, primary key, default: gen_random_uuid())
- `name` (text, not null) - Name of the person submitting feedback
- `email` (text, not null) - Email address for follow-up
- `subject` (text, not null) - Subject of the message
- `message` (text, not null) - Detailed message/feedback
- `status` (text, default: 'pending') - Status: pending, reviewed, resolved
- `created_at` (timestamptz, default: now())

## 2. Security

- Enable RLS on `contact_submissions` table
- Allow anyone to insert contact submissions (public form)
- Only admins can view and update submissions
- Users can view their own submissions if authenticated

## 3. Notes

This table stores user feedback and contact form submissions for admin review.
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public contact form)
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Policy: Admins can view all submissions
CREATE POLICY "Admins can view all submissions" ON contact_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update submissions
CREATE POLICY "Admins can update submissions" ON contact_submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
