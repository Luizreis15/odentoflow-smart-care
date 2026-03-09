
-- =============================================
-- FASE 1: ESTRUTURA FINANCEIRA DO PACIENTE
-- =============================================

-- 1. Tabela payment_plans (Plano financeiro do orçamento aprovado)
CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  immediate_amount NUMERIC NOT NULL DEFAULT 0,
  financed_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela payment_plan_allocations (Blocos de pagamento planejados)
CREATE TABLE public.payment_plan_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL DEFAULT 1,
  payment_method_planned TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  installments_count INTEGER NOT NULL DEFAULT 1,
  first_due_date DATE,
  recurrence_type TEXT DEFAULT 'monthly',
  card_brand TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Adaptar receivable_titles - adicionar colunas para vincular ao plano
ALTER TABLE public.receivable_titles 
  ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS allocation_id UUID REFERENCES public.payment_plan_allocations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS installment_label TEXT,
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS financial_responsible_id UUID REFERENCES public.patient_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 4. Adaptar payments - adicionar campos de comprovante e referência
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS proof_file_url TEXT,
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT;

-- 5. Tabela receipt_documents (Recibos formais emitidos)
CREATE TABLE public.receipt_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  receipt_number SERIAL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  description TEXT,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'issued',
  voided_at TIMESTAMPTZ,
  voided_reason TEXT,
  generated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela patient_financial_audit_logs (Auditoria financeira do paciente)
CREATE TABLE public.patient_financial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_plans_clinic ON public.payment_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_patient ON public.payment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_budget ON public.payment_plans(budget_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_allocations_plan ON public.payment_plan_allocations(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_receivable_titles_plan ON public.receivable_titles(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_receivable_titles_allocation ON public.receivable_titles(allocation_id);
CREATE INDEX IF NOT EXISTS idx_receipt_documents_clinic ON public.receipt_documents(clinic_id);
CREATE INDEX IF NOT EXISTS idx_receipt_documents_patient ON public.receipt_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_receipt_documents_payment ON public.receipt_documents(payment_id);
CREATE INDEX IF NOT EXISTS idx_patient_fin_audit_clinic ON public.patient_financial_audit_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_fin_audit_patient ON public.patient_financial_audit_logs(patient_id);

-- 8. RLS - payment_plans
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment plans from their clinic"
  ON public.payment_plans FOR SELECT
  TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert payment plans in their clinic"
  ON public.payment_plans FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update payment plans in their clinic"
  ON public.payment_plans FOR UPDATE
  TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- 9. RLS - payment_plan_allocations
ALTER TABLE public.payment_plan_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view allocations from their clinic plans"
  ON public.payment_plan_allocations FOR SELECT
  TO authenticated
  USING (payment_plan_id IN (
    SELECT id FROM public.payment_plans WHERE clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert allocations to their clinic plans"
  ON public.payment_plan_allocations FOR INSERT
  TO authenticated
  WITH CHECK (payment_plan_id IN (
    SELECT id FROM public.payment_plans WHERE clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update allocations in their clinic plans"
  ON public.payment_plan_allocations FOR UPDATE
  TO authenticated
  USING (payment_plan_id IN (
    SELECT id FROM public.payment_plans WHERE clinic_id = public.get_user_clinic_id(auth.uid())
  ));

-- 10. RLS - receipt_documents
ALTER TABLE public.receipt_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view receipts from their clinic"
  ON public.receipt_documents FOR SELECT
  TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert receipts in their clinic"
  ON public.receipt_documents FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update receipts in their clinic"
  ON public.receipt_documents FOR UPDATE
  TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- 11. RLS - patient_financial_audit_logs
ALTER TABLE public.patient_financial_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial audit logs from their clinic"
  ON public.patient_financial_audit_logs FOR SELECT
  TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert financial audit logs in their clinic"
  ON public.patient_financial_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

-- 12. Updated_at triggers
CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
