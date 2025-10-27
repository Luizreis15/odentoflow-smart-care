-- Rename clinics table to clinicas
ALTER TABLE IF EXISTS public.clinics RENAME TO clinicas;

-- If clinics doesn't exist, create clinicas from scratch
CREATE TABLE IF NOT EXISTS public.clinicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'clinica',
  owner_user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plano plano_tipo DEFAULT 'starter',
  status_assinatura status_assinatura DEFAULT 'trialing',
  current_period_end TIMESTAMP WITH TIME ZONE,
  onboarding_status TEXT DEFAULT 'not_started',
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Block public access to clinics" ON public.clinicas;
DROP POLICY IF EXISTS "Owners can delete their clinic" ON public.clinicas;
DROP POLICY IF EXISTS "Owners e admins podem atualizar sua clínica" ON public.clinicas;
DROP POLICY IF EXISTS "Users can create their own clinic" ON public.clinicas;
DROP POLICY IF EXISTS "Usuários podem ver sua clínica" ON public.clinicas;

-- Create RLS policies
CREATE POLICY "Block public access to clinicas"
  ON public.clinicas FOR SELECT
  USING (false);

CREATE POLICY "Users can create their own clinic"
  ON public.clinicas FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Usuários podem ver sua clínica"
  ON public.clinicas FOR SELECT
  USING (
    id IN (
      SELECT clinica_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners e admins podem atualizar sua clínica"
  ON public.clinicas FOR UPDATE
  USING (
    owner_user_id = auth.uid() 
    OR id IN (
      SELECT clinica_id FROM usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Owners can delete their clinic"
  ON public.clinicas FOR DELETE
  USING (owner_user_id = auth.uid());

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_clinicas_updated_at ON public.clinicas;
CREATE TRIGGER update_clinicas_updated_at
  BEFORE UPDATE ON public.clinicas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update foreign key references in other tables
ALTER TABLE IF EXISTS public.usuarios 
  DROP CONSTRAINT IF EXISTS usuarios_clinica_id_fkey;

ALTER TABLE IF EXISTS public.usuarios
  ADD CONSTRAINT usuarios_clinica_id_fkey 
  FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);

ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_clinic_id_fkey;

ALTER TABLE IF EXISTS public.profiles
  ADD CONSTRAINT profiles_clinic_id_fkey
  FOREIGN KEY (clinic_id) REFERENCES public.clinicas(id);