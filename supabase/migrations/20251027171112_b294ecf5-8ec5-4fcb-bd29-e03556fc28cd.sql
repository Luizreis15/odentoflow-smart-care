-- Create security definer function to get user's clinic_id
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinica_id FROM public.usuarios WHERE id = _user_id LIMIT 1;
$$;

-- Drop existing problematic policies on usuarios table
DROP POLICY IF EXISTS "Admins can manage users in their clinic" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users in their clinic" ON public.usuarios;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can manage users in their clinic"
  ON public.usuarios
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario) 
    AND clinica_id = public.get_user_clinic_id(auth.uid())
  );

CREATE POLICY "Users can view users in their clinic"
  ON public.usuarios
  FOR SELECT
  USING (
    clinica_id = public.get_user_clinic_id(auth.uid())
  );