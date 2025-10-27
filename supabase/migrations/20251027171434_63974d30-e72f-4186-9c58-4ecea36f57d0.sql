-- Drop and recreate the SELECT policy to allow owners to see their clinic
DROP POLICY IF EXISTS "Usuários podem ver sua clínica" ON public.clinicas;

-- Create new policy that allows both users in the clinic AND owners
CREATE POLICY "Usuários podem ver sua clínica"
  ON public.clinicas
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR id IN (
      SELECT clinica_id FROM usuarios WHERE id = auth.uid()
    )
  );