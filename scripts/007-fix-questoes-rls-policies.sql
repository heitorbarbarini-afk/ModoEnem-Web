-- Add policy to allow students to view questions table details
-- This is needed for the join in turma_questoes
CREATE POLICY "Students can view questions in their classes" ON questoes
  FOR SELECT
  USING (
    id IN (
      SELECT tq.questao_id 
      FROM turma_questoes tq
      INNER JOIN turma_alunos ta ON tq.turma_id = ta.turma_id
      WHERE ta.aluno_id = auth.uid()
    )
  );
