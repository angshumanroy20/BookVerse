/*
# Create Contact Replies Table

This migration creates a table to store admin replies to contact submissions,
enabling two-way communication between admins and users.

## 1. New Tables

### contact_replies
- `id` (uuid, primary key, default: gen_random_uuid())
- `contact_submission_id` (uuid, foreign key to contact_submissions)
- `admin_id` (uuid, foreign key to profiles)
- `reply_message` (text, not null) - Admin's reply message
- `created_at` (timestamptz, default: now())

## 2. Security

- No RLS needed (table access controlled by application logic)
- Admins can create replies through application
- Users can view replies associated with their submissions

## 3. Indexes

- Index on contact_submission_id for fast lookups
- Index on created_at for chronological ordering
*/

-- Create contact_replies table
CREATE TABLE IF NOT EXISTS contact_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_submission_id uuid NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reply_message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_contact_replies_submission_id ON contact_replies(contact_submission_id);
CREATE INDEX idx_contact_replies_created_at ON contact_replies(created_at DESC);

-- Add a comment to track reply count
COMMENT ON TABLE contact_replies IS 'Stores admin replies to contact form submissions';
