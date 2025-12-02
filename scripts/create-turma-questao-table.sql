-- Create table to link turmas with questoes
CREATE TABLE IF NOT EXISTS turma_questao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turma_id, questao_id)
);

-- Add RLS policies
ALTER TABLE turma_questao ENABLE ROW LEVEL SECURITY;

-- Professors can manage their own turma-questao relationships
CREATE POLICY "Professors can insert turma_questao for their turmas"
ON turma_questao FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM turmas
    WHERE turmas.id = turma_questao.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can view turma_questao for their turmas"
ON turma_questao FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM turmas
    WHERE turmas.id = turma_questao.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can delete turma_questao for their turmas"
ON turma_questao FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM turmas
    WHERE turmas.id = turma_questao.turma_id
    AND turmas.professor_id = auth.uid()
  )
);
