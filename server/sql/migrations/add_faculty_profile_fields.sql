-- Add missing fields to faculty table
ALTER TABLE faculty
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS phone_extension TEXT,
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Also update alumni table to add these fields if missing
ALTER TABLE alumni
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT;
