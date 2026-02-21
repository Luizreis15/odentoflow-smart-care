
-- =============================================
-- MÓDULO DE ORTODONTIA - 4 TABELAS + RLS
-- =============================================

-- 1. ortho_cases (Casos Ortodônticos)
CREATE TABLE public.ortho_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profissionais(id),
  responsible_contact_id uuid REFERENCES public.patient_contacts(id),
  tipo_tratamento text NOT NULL DEFAULT 'aparelho_fixo',
  classificacao_angle text,
  tipo_mordida text,
  apinhamento text,
  arcada text NOT NULL DEFAULT 'ambas',
  marca_aparelho text,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  previsao_termino date,
  data_termino date,
  status text NOT NULL DEFAULT 'planejamento',
  valor_total numeric NOT NULL DEFAULT 0,
  valor_entrada numeric,
  valor_mensalidade numeric,
  dia_vencimento int,
  total_meses int,
  observacoes_clinicas text,
  budget_id uuid REFERENCES public.budgets(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ortho_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ortho_cases from their clinic"
  ON public.ortho_cases FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert ortho_cases in their clinic"
  ON public.ortho_cases FOR INSERT
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update ortho_cases in their clinic"
  ON public.ortho_cases FOR UPDATE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete ortho_cases in their clinic"
  ON public.ortho_cases FOR DELETE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE INDEX idx_ortho_cases_clinic_status ON public.ortho_cases(clinic_id, status);
CREATE INDEX idx_ortho_cases_patient ON public.ortho_cases(patient_id);

CREATE TRIGGER update_ortho_cases_updated_at
  BEFORE UPDATE ON public.ortho_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ortho_appointments (Consultas de Manutenção)
CREATE TABLE public.ortho_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.ortho_cases(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  data_consulta date NOT NULL DEFAULT CURRENT_DATE,
  tipo_consulta text NOT NULL DEFAULT 'ativacao',
  numero_alinhador int,
  fio_utilizado text,
  elasticos text,
  procedimentos_realizados text,
  observacoes text,
  proxima_consulta_prevista date,
  professional_id uuid NOT NULL REFERENCES public.profissionais(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ortho_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ortho_appointments from their clinic"
  ON public.ortho_appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_appointments.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert ortho_appointments in their clinic"
  ON public.ortho_appointments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_appointments.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update ortho_appointments in their clinic"
  ON public.ortho_appointments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_appointments.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can delete ortho_appointments in their clinic"
  ON public.ortho_appointments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_appointments.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE INDEX idx_ortho_appointments_case ON public.ortho_appointments(case_id, data_consulta);

-- 3. ortho_images (Banco de Imagens Clínicas)
CREATE TABLE public.ortho_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.ortho_cases(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  tipo_imagem text NOT NULL DEFAULT 'outro',
  fase text NOT NULL DEFAULT 'inicial',
  data_registro date NOT NULL DEFAULT CURRENT_DATE,
  descricao text,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ortho_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ortho_images from their clinic"
  ON public.ortho_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_images.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert ortho_images in their clinic"
  ON public.ortho_images FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_images.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can delete ortho_images in their clinic"
  ON public.ortho_images FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_images.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE INDEX idx_ortho_images_case_fase ON public.ortho_images(case_id, fase);

-- 4. ortho_aligner_tracking (Controle de Alinhadores)
CREATE TABLE public.ortho_aligner_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.ortho_cases(id) ON DELETE CASCADE,
  numero_alinhador int NOT NULL,
  total_alinhadores int NOT NULL,
  data_entrega date,
  data_troca_prevista date,
  data_troca_real date,
  dias_uso int NOT NULL DEFAULT 14,
  refinamento boolean NOT NULL DEFAULT false,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ortho_aligner_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ortho_aligner_tracking from their clinic"
  ON public.ortho_aligner_tracking FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_aligner_tracking.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert ortho_aligner_tracking in their clinic"
  ON public.ortho_aligner_tracking FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_aligner_tracking.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update ortho_aligner_tracking in their clinic"
  ON public.ortho_aligner_tracking FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_aligner_tracking.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can delete ortho_aligner_tracking in their clinic"
  ON public.ortho_aligner_tracking FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ortho_cases oc
    WHERE oc.id = ortho_aligner_tracking.case_id
    AND oc.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE INDEX idx_ortho_aligner_tracking_case ON public.ortho_aligner_tracking(case_id, numero_alinhador);
