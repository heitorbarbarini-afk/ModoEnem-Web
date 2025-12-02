-- Add foto_url column to turmas table
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS foto_url TEXT;
