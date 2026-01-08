-- =====================================================
-- EPIC 0.3: Receivable Titles and Payment Improvements
-- Create receivable_titles table and improve payments structure
-- =====================================================

-- Create receivable_titles table (Contas a Receber / Títulos)
CREATE TABLE public.receivable_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  budget_id UUID REFERENCES public.budgets(id),
  title_number SERIAL,
  installment_number INTEGER DEFAULT 1,
  total_installments INTEGER DEFAULT 1,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled', 'overdue')),
  origin TEXT DEFAULT 'budget' CHECK (origin IN ('budget', 'manual', 'insurance', 'addendum')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for receivable_titles
CREATE INDEX idx_receivable_titles_clinic_id ON public.receivable_titles(clinic_id);
CREATE INDEX idx_receivable_titles_patient_id ON public.receivable_titles(patient_id);
CREATE INDEX idx_receivable_titles_budget_id ON public.receivable_titles(budget_id);
CREATE INDEX idx_receivable_titles_status ON public.receivable_titles(status);
CREATE INDEX idx_receivable_titles_due_date ON public.receivable_titles(due_date);

-- Enable RLS
ALTER TABLE public.receivable_titles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for receivable_titles
CREATE POLICY "receivable_titles_select_policy" ON public.receivable_titles
  FOR SELECT USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "receivable_titles_insert_policy" ON public.receivable_titles
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "receivable_titles_update_policy" ON public.receivable_titles
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "receivable_titles_delete_policy" ON public.receivable_titles
  FOR DELETE USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_receivable_titles_updated_at
  BEFORE UPDATE ON public.receivable_titles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to payments table
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS title_id UUID REFERENCES public.receivable_titles(id),
  ADD COLUMN IF NOT EXISTS cash_account_id UUID REFERENCES public.caixas(id),
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Create index for payments
CREATE INDEX IF NOT EXISTS idx_payments_title_id ON public.payments(title_id);
CREATE INDEX IF NOT EXISTS idx_payments_cash_account_id ON public.payments(cash_account_id);

-- Add clinic_id to treatments table first
ALTER TABLE public.treatments 
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinicas(id),
  ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES public.budgets(id);

-- Update existing treatments with clinic_id from patient
UPDATE public.treatments t
SET clinic_id = p.clinic_id
FROM public.patients p
WHERE t.patient_id = p.id AND t.clinic_id IS NULL;

-- Create index for treatments
CREATE INDEX IF NOT EXISTS idx_treatments_clinic_id ON public.treatments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatments_budget_id ON public.treatments(budget_id);

-- Create treatment_items table
CREATE TABLE public.treatment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES public.budget_items(id),
  procedure_id UUID,
  professional_id UUID REFERENCES public.profissionais(id),
  tooth_number INTEGER,
  tooth_region TEXT,
  tooth_faces TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES public.profiles(id),
  price NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for treatment_items
CREATE INDEX idx_treatment_items_treatment_id ON public.treatment_items(treatment_id);
CREATE INDEX idx_treatment_items_budget_item_id ON public.treatment_items(budget_item_id);
CREATE INDEX idx_treatment_items_status ON public.treatment_items(status);

-- Enable RLS on treatment_items via patient relationship
ALTER TABLE public.treatment_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for treatment_items (via treatment -> patient -> clinic)
CREATE POLICY "treatment_items_select_policy" ON public.treatment_items
  FOR SELECT USING (
    treatment_id IN (
      SELECT t.id FROM public.treatments t
      JOIN public.patients p ON t.patient_id = p.id
      WHERE p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "treatment_items_insert_policy" ON public.treatment_items
  FOR INSERT WITH CHECK (
    treatment_id IN (
      SELECT t.id FROM public.treatments t
      JOIN public.patients p ON t.patient_id = p.id
      WHERE p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "treatment_items_update_policy" ON public.treatment_items
  FOR UPDATE USING (
    treatment_id IN (
      SELECT t.id FROM public.treatments t
      JOIN public.patients p ON t.patient_id = p.id
      WHERE p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "treatment_items_delete_policy" ON public.treatment_items
  FOR DELETE USING (
    treatment_id IN (
      SELECT t.id FROM public.treatments t
      JOIN public.patients p ON t.patient_id = p.id
      WHERE p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_treatment_items_updated_at
  BEFORE UPDATE ON public.treatment_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();