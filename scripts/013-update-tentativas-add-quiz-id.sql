-- Add quiz_id to tentativas table
ALTER TABLE public.tentativas ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tentativas_quiz_id ON public.tentativas(quiz_id);
