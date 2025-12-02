-- Allow students to view professor profiles (names) from their enrolled classes
CREATE POLICY "Students can view professor profiles from enrolled classes"
  ON public.profiles FOR SELECT
  USING (
    tipo = 'professor' AND
    EXISTS (
      SELECT 1 FROM public.turmas t
      JOIN public.turma_alunos ta ON ta.turma_id = t.id
      WHERE t.professor_id = profiles.id
      AND ta.aluno_id = auth.uid()
    )
  );
