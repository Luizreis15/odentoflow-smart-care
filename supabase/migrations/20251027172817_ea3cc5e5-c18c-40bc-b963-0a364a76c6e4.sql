-- Fix RLS policy for profissionais to allow owners to insert
DROP POLICY IF EXISTS "Admins can manage profissionais" ON public.profissionais;

-- Create separate policies for better granularity
CREATE POLICY "Owners and admins can insert profissionais"
ON public.profissionais
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is owner of the clinic
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE owner_user_id = auth.uid()
  )
  OR
  -- Or if user is admin of the clinic
  (has_role(auth.uid(), 'admin'::perfil_usuario) AND clinica_id = get_user_clinic_id(auth.uid()))
);

CREATE POLICY "Owners and admins can update profissionais"
ON public.profissionais
FOR UPDATE
TO authenticated
USING (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE owner_user_id = auth.uid()
  )
  OR
  (has_role(auth.uid(), 'admin'::perfil_usuario) AND clinica_id = get_user_clinic_id(auth.uid()))
);

CREATE POLICY "Owners and admins can delete profissionais"
ON public.profissionais
FOR DELETE
TO authenticated
USING (
  clinica_id IN (
    SELECT id FROM public.clinicas WHERE owner_user_id = auth.uid()
  )
  OR
  (has_role(auth.uid(), 'admin'::perfil_usuario) AND clinica_id = get_user_clinic_id(auth.uid()))
);