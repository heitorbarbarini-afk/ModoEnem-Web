-- Create tentativas (attempts) table to store student answers
CREATE TABLE IF NOT EXISTS public.tentativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  resposta_escolhida INTEGER NOT NULL,
  correta BOOLEAN NOT NULL,
  tempo_gasto INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tentativas_aluno_id ON public.tentativas(aluno_id);
CREATE INDEX idx_tentativas_questao_id ON public.tentativas(questao_id);
CREATE INDEX idx_tentativas_turma_id ON public.tentativas(turma_id);

-- Enable RLS
ALTER TABLE public.tentativas ENABLE ROW LEVEL SECURITY;

-- Policies for tentativas
-- Students can view their own attempts
CREATE POLICY "Students can view own attempts"
  ON public.tentativas FOR SELECT
  USING (auth.uid() = aluno_id);

-- Students can insert their own attempts
CREATE POLICY "Students can insert own attempts"
  ON public.tentativas FOR INSERT
  WITH CHECK (auth.uid() = aluno_id);

-- Professors can view attempts from their students in their classes
CREATE POLICY "Professors can view attempts in their classes"
  ON public.tentativas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = tentativas.turma_id
      AND turmas.professor_id = auth.uid()
    )
  );
