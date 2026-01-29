-- Migration: Add profile fields to alumni table
-- This adds graduation year and other profile details

ALTER TABLE alumni 
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS previous_companies TEXT,
  ADD COLUMN IF NOT EXISTS willing_to_help TEXT;
