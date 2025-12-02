-- Create turma_alunos table for students enrollment in classes
CREATE TABLE IF NOT EXISTS turma_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turma_id, aluno_id)
);

-- Enable RLS
ALTER TABLE turma_alunos ENABLE ROW LEVEL SECURITY;

-- Policies for turma_alunos
CREATE POLICY "Students can view own enrollments" ON turma_alunos
  FOR SELECT
  USING (aluno_id = auth.uid());

CREATE POLICY "Students can enroll themselves" ON turma_alunos
  FOR INSERT
  WITH CHECK (aluno_id = auth.uid());

CREATE POLICY "Professors can view enrollments in their classes" ON turma_alunos
  FOR SELECT
  USING (
    turma_id IN (
      SELECT id FROM turmas WHERE professor_id = auth.uid()
    )
  );
