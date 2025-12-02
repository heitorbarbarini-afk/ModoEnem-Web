-- Add foreign key constraint to turma_alunos referencing profiles
ALTER TABLE turma_alunos
ADD CONSTRAINT turma_alunos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add policy to allow professors to view profiles of students in their classes
CREATE POLICY "Professors can view student profiles in their classes" ON profiles
  FOR SELECT
  USING (
    id IN (
      SELECT ta.aluno_id 
      FROM turma_alunos ta
      INNER JOIN turmas t ON ta.turma_id = t.id
      WHERE t.professor_id = auth.uid()
    )
  );

-- Add policy to allow students to view profiles of other students in same classes
CREATE POLICY "Students can view profiles of classmates" ON profiles
  FOR SELECT
  USING (
    id IN (
      SELECT ta2.aluno_id
      FROM turma_alunos ta1
      INNER JOIN turma_alunos ta2 ON ta1.turma_id = ta2.turma_id
      WHERE ta1.aluno_id = auth.uid()
    )
  );
