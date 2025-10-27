-- Fix infinite recursion in professionals RLS policies
-- The issue is that the policies are joining usuarios table which itself has RLS,
-- causing infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage professionals" ON public.professionals;
DROP POLICY IF EXISTS "Users can view professionals from their clinic" ON public.professionals;

-- Recreate policies using profiles table instead of usuarios to avoid recursion
CREATE POLICY "Users can view professionals from their clinic"
ON public.professionals
FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage professionals"
ON public.professionals
FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id
    FROM public.profiles
    WHERE id = auth.uid()
      AND id IN (
        SELECT user_id
        FROM public.user_roles
        WHERE role = 'admin'::perfil_usuario
      )
  )
);