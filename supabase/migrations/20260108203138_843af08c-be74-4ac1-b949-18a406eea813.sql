-- =====================================================
-- EPIC 0.2: Budget Improvements
-- Add professional_id per item, tooth_faces, payment_plan, financial_responsible
-- =====================================================

-- Add new columns to budget_items
ALTER TABLE public.budget_items 
  ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.profissionais(id),
  ADD COLUMN IF NOT EXISTS tooth_faces TEXT, -- ex: "M,D,V,L,O"
  ADD COLUMN IF NOT EXISTS insurance_id UUID; -- for future insurance support

-- Create index for professional lookups
CREATE INDEX IF NOT EXISTS idx_budget_items_professional_id ON public.budget_items(professional_id);

-- Add new columns to budgets
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS financial_responsible_contact_id UUID REFERENCES public.patient_contacts(id),
  ADD COLUMN IF NOT EXISTS payment_plan JSONB, -- {entrada: 0, parcelas: 1, vencimentos: [...], metodo: "pix"}
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update status constraint to include all PRD statuses
-- First, drop the old constraint if exists
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_status_check;

-- Add the new constraint with all valid statuses
ALTER TABLE public.budgets 
  ADD CONSTRAINT budgets_status_check 
  CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled', 'converted', 'pending'));