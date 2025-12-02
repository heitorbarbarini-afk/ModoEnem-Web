-- Create turmas table for managing classes
CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_turmas_professor_id ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_codigo ON turmas(codigo);

-- Enable Row Level Security
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;

-- Policy: Professors can view their own turmas
CREATE POLICY "Professors can view own turmas" ON turmas
  FOR SELECT
  USING (auth.uid() = professor_id);

-- Policy: Professors can insert their own turmas
CREATE POLICY "Professors can insert own turmas" ON turmas
  FOR INSERT
  WITH CHECK (auth.uid() = professor_id);

-- Policy: Professors can update their own turmas
CREATE POLICY "Professors can update own turmas" ON turmas
  FOR UPDATE
  USING (auth.uid() = professor_id);

-- Policy: Professors can delete their own turmas
CREATE POLICY "Professors can delete own turmas" ON turmas
  FOR DELETE
  USING (auth.uid() = professor_id);
