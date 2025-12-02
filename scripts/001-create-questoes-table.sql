-- Create questoes table for storing questions
CREATE TABLE IF NOT EXISTS questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  level TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;

-- Policies for questoes
CREATE POLICY "Professors can view own questoes" ON questoes
  FOR SELECT
  USING (professor_id = auth.uid());

CREATE POLICY "Professors can insert own questoes" ON questoes
  FOR INSERT
  WITH CHECK (professor_id = auth.uid());

CREATE POLICY "Professors can update own questoes" ON questoes
  FOR UPDATE
  USING (professor_id = auth.uid());

CREATE POLICY "Professors can delete own questoes" ON questoes
  FOR DELETE
  USING (professor_id = auth.uid());
