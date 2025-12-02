-- Allow students to search for turmas by code
-- This enables students to find and enroll in classes using the enrollment code

CREATE POLICY "Anyone can view turmas by code" ON turmas
  FOR SELECT
  USING (true);

-- Drop the old restrictive policy that only allowed professors
DROP POLICY IF EXISTS "Professors can view own turmas" ON turmas;

-- Re-create a policy that allows professors to view all turmas (for management)
-- and students to view turmas (for enrollment)
CREATE POLICY "Anyone authenticated can view turmas" ON turmas
  FOR SELECT
  USING (auth.role() = 'authenticated');
