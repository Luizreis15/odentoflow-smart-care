
-- Renegotiation tracking table
CREATE TABLE IF NOT EXISTS public.renegotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT,
  original_total NUMERIC NOT NULL DEFAULT 0,
  new_total NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  new_installments INTEGER NOT NULL DEFAULT 1,
  new_entry_amount NUMERIC NOT NULL DEFAULT 0,
  new_entry_method TEXT,
  new_installment_method TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link original titles to renegotiation
CREATE TABLE IF NOT EXISTS public.renegotiation_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renegotiation_id UUID NOT NULL REFERENCES public.renegotiations(id) ON DELETE CASCADE,
  original_title_id UUID NOT NULL REFERENCES public.receivable_titles(id),
  original_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add renegotiation reference to receivable_titles
ALTER TABLE public.receivable_titles
  ADD COLUMN IF NOT EXISTS renegotiation_id UUID REFERENCES public.renegotiations(id);

-- RLS
ALTER TABLE public.renegotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renegotiation_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage renegotiations for their clinic" ON public.renegotiations
  FOR ALL TO authenticated
  USING (clinic_id = public.get_user_clinic_id(auth.uid()))
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can manage renegotiation_titles for their clinic" ON public.renegotiation_titles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.renegotiations r
      WHERE r.id = renegotiation_titles.renegotiation_id
      AND r.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.renegotiations r
      WHERE r.id = renegotiation_titles.renegotiation_id
      AND r.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_renegotiations_clinic ON public.renegotiations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_renegotiations_patient ON public.renegotiations(patient_id);
CREATE INDEX IF NOT EXISTS idx_renegotiation_titles_renego ON public.renegotiation_titles(renegotiation_id);
CREATE INDEX IF NOT EXISTS idx_receivable_titles_renego ON public.receivable_titles(renegotiation_id);

-- updated_at trigger
CREATE TRIGGER update_renegotiations_updated_at
  BEFORE UPDATE ON public.renegotiations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
