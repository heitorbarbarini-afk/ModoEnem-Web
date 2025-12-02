-- Add image_url column to questoes table
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS image_url TEXT;
