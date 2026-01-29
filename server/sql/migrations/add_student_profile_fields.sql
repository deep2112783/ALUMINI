-- Migration: Add profile fields to students table
-- Run this migration to add new columns for profile management

-- Add new columns if they don't exist
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS profile_image TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT,
  ADD COLUMN IF NOT EXISTS portfolio TEXT;

-- Update existing records to extract name from email
UPDATE students s
SET name = SPLIT_PART(u.email, '@', 1)
FROM users u
WHERE s.user_id = u.id AND s.name IS NULL;
