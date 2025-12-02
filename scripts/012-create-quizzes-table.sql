-- Create quizzes table for organizing questions into quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_quizzes_turma_id ON public.quizzes(turma_id);
CREATE INDEX idx_quizzes_professor_id ON public.quizzes(professor_id);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes
-- Professors can manage their own quizzes
CREATE POLICY "Professors can manage own quizzes"
  ON public.quizzes FOR ALL
  USING (professor_id = auth.uid());

-- Students can view quizzes from enrolled classes
CREATE POLICY "Students can view quizzes from enrolled classes"
  ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.turma_alunos
      WHERE turma_alunos.turma_id = quizzes.turma_id
      AND turma_alunos.aluno_id = auth.uid()
    )
  );

-- Create quiz_questoes table for linking questions to quizzes
CREATE TABLE IF NOT EXISTS public.quiz_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, questao_id)
);

-- Create index for faster queries
CREATE INDEX idx_quiz_questoes_quiz_id ON public.quiz_questoes(quiz_id);
CREATE INDEX idx_quiz_questoes_questao_id ON public.quiz_questoes(questao_id);

-- Enable RLS
ALTER TABLE public.quiz_questoes ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_questoes
-- Professors can manage questions in their quizzes
CREATE POLICY "Professors can manage questions in own quizzes"
  ON public.quiz_questoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questoes.quiz_id
      AND quizzes.professor_id = auth.uid()
    )
  );

-- Students can view questions in quizzes from enrolled classes
CREATE POLICY "Students can view questions in enrolled quizzes"
  ON public.quiz_questoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.turma_alunos ta ON ta.turma_id = q.turma_id
      WHERE q.id = quiz_questoes.quiz_id
      AND ta.aluno_id = auth.uid()
    )
  );
