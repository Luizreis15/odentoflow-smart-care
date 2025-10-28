-- ====================================
-- FASE 1: PORTAL DO PACIENTE - AUTENTICAÇÃO
-- ====================================

-- Tabela de convites para pacientes
CREATE TABLE IF NOT EXISTS public.patient_portal_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de acesso ao portal (liga auth.users com patients)
CREATE TABLE IF NOT EXISTS public.patient_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_portal_invites_patient ON public.patient_portal_invites(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_invites_token ON public.patient_portal_invites(token);
CREATE INDEX IF NOT EXISTS idx_portal_invites_email ON public.patient_portal_invites(email);
CREATE INDEX IF NOT EXISTS idx_portal_access_patient ON public.patient_portal_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_user ON public.patient_portal_access(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patient_portal_access_updated_at
  BEFORE UPDATE ON public.patient_portal_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- RLS POLICIES - PORTAL DO PACIENTE
-- ====================================

-- Enable RLS
ALTER TABLE public.patient_portal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_access ENABLE ROW LEVEL SECURITY;

-- Policies para patient_portal_invites
-- Apenas admins e usuários da clínica podem gerenciar convites
CREATE POLICY "Clinic staff can manage invites"
  ON public.patient_portal_invites
  FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Policies para patient_portal_access
-- Admins podem gerenciar acessos
CREATE POLICY "Admins can manage portal access"
  ON public.patient_portal_access
  FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = get_user_clinic_id(auth.uid())
    ) AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Pacientes podem ver seu próprio acesso
CREATE POLICY "Patients can view their own access"
  ON public.patient_portal_access
  FOR SELECT
  USING (user_id = auth.uid());

-- ====================================
-- ATUALIZAR RLS POLICIES EXISTENTES PARA PORTAL
-- ====================================

-- Function helper para verificar se é paciente do portal
CREATE OR REPLACE FUNCTION public.is_portal_patient()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT patient_id 
  FROM public.patient_portal_access 
  WHERE user_id = auth.uid() 
  AND active = true
  LIMIT 1;
$$;

-- Patients: Pacientes do portal podem ver apenas seus próprios dados
CREATE POLICY "Portal patients can view their own data"
  ON public.patients
  FOR SELECT
  USING (id = is_portal_patient());

-- Appointments: Pacientes podem ver seus agendamentos
CREATE POLICY "Portal patients can view their appointments"
  ON public.appointments
  FOR SELECT
  USING (patient_id = is_portal_patient());

-- Budgets: Pacientes podem ver seus orçamentos
CREATE POLICY "Portal patients can view their budgets"
  ON public.budgets
  FOR SELECT
  USING (patient_id = is_portal_patient());

-- Budget Items: Pacientes podem ver itens de seus orçamentos
CREATE POLICY "Portal patients can view their budget items"
  ON public.budget_items
  FOR SELECT
  USING (
    budget_id IN (
      SELECT id FROM public.budgets 
      WHERE patient_id = is_portal_patient()
    )
  );

-- Patient Documents: Pacientes podem ver seus documentos
CREATE POLICY "Portal patients can view their documents"
  ON public.patient_documents
  FOR SELECT
  USING (patient_id = is_portal_patient());

-- Payments: Pacientes podem ver seus pagamentos
CREATE POLICY "Portal patients can view their payments"
  ON public.payments
  FOR SELECT
  USING (patient_id = is_portal_patient());

-- Patient Files: Pacientes podem ver seus arquivos
CREATE POLICY "Portal patients can view their files"
  ON public.patient_files
  FOR SELECT
  USING (patient_id = is_portal_patient());

-- Anamneses: Pacientes podem ver suas anamneses
CREATE POLICY "Portal patients can view their anamneses"
  ON public.anamneses
  FOR SELECT
  USING (paciente_id = is_portal_patient());