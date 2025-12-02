-- Create turma_questoes table for linking questions to classes
CREATE TABLE IF NOT EXISTS turma_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turma_id, questao_id)
);

-- Enable RLS
ALTER TABLE turma_questoes ENABLE ROW LEVEL SECURITY;

-- Policies for turma_questoes
CREATE POLICY "Professors can manage questions in own classes" ON turma_questoes
  FOR ALL
  USING (
    turma_id IN (
      SELECT id FROM turmas WHERE professor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view questions in enrolled classes" ON turma_questoes
  FOR SELECT
  USING (
    turma_id IN (
      SELECT turma_id FROM turma_alunos WHERE aluno_id = auth.uid()
    )
  );
