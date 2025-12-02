-- Allow students to leave (delete their own enrollment)
CREATE POLICY "Students can leave classes" ON turma_alunos
  FOR DELETE
  USING (aluno_id = auth.uid());
