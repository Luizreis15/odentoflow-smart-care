-- Rename professionals table to profissionais
ALTER TABLE IF EXISTS public.professionals RENAME TO profissionais;

-- Rename columns from English to Portuguese
ALTER TABLE public.profissionais 
  RENAME COLUMN full_name TO nome;

ALTER TABLE public.profissionais 
  RENAME COLUMN clinic_id TO clinica_id;

ALTER TABLE public.profissionais 
  RENAME COLUMN phone TO telefone;

ALTER TABLE public.profissionais 
  RENAME COLUMN specialty TO especialidade;

-- Add missing columns
ALTER TABLE public.profissionais
  ADD COLUMN IF NOT EXISTS perfil TEXT DEFAULT 'dentista';

ALTER TABLE public.profissionais
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Update foreign key constraint
ALTER TABLE public.profissionais
  DROP CONSTRAINT IF EXISTS professionals_clinic_id_fkey;

ALTER TABLE public.profissionais
  ADD CONSTRAINT profissionais_clinica_id_fkey 
  FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);

-- Update RLS policies names
DROP POLICY IF EXISTS "Admins can manage professionals" ON public.profissionais;
DROP POLICY IF EXISTS "Users can view professionals from their clinic" ON public.profissionais;
DROP POLICY IF EXISTS "Block public access to professionals" ON public.profissionais;

-- Recreate RLS policies with security definer function
CREATE POLICY "Block public access to profissionais"
  ON public.profissionais
  FOR SELECT
  USING (false);

CREATE POLICY "Admins can manage profissionais"
  ON public.profissionais
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario) 
    AND clinica_id = public.get_user_clinic_id(auth.uid())
  );

CREATE POLICY "Users can view profissionais from their clinic"
  ON public.profissionais
  FOR SELECT
  USING (
    clinica_id = public.get_user_clinic_id(auth.uid())
  );