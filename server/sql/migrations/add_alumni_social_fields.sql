-- Migration: Add additional profile fields to alumni table
-- Adds: name, profile_image, cover_image, linkedin, github, portfolio

ALTER TABLE alumni 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS profile_image TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT,
  ADD COLUMN IF NOT EXISTS portfolio TEXT;
