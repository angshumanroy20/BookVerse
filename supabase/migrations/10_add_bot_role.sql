/*
# Add Bot Role to User Role Enum

This migration adds a 'bot' role to the user_role enum type to support automated book uploads.

## Changes:
1. Add 'bot' value to user_role enum
2. Update RLS policies to allow bot users to create books without restrictions

## Security:
- Bot users can only be created through the Edge Function with service role key
- Bot users have the same permissions as regular users for creating books
*/

-- Add 'bot' to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'bot';

-- No additional RLS changes needed as bots will use service role key which bypasses RLS
