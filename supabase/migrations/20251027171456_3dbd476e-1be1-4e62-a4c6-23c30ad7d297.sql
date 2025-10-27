-- Drop and recreate the SELECT policy using security definer function
DROP POLICY IF EXISTS "Usuários podem ver sua clínica" ON public.clinicas;

-- Create new policy that allows both owners and users in the clinic
CREATE POLICY "Usuários podem ver sua clínica"
  ON public.clinicas
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR id = public.get_user_clinic_id(auth.uid())
  );