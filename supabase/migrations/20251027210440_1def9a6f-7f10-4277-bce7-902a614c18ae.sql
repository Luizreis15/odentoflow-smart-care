-- Create budgets/quotes table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'partially_approved', 'rejected', 'converted')),
  title text NOT NULL,
  description text,
  total_value numeric(10,2) DEFAULT 0,
  discount_value numeric(10,2) DEFAULT 0,
  final_value numeric(10,2) DEFAULT 0,
  valid_until date,
  approved_at timestamp with time zone,
  converted_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create budget items table
CREATE TABLE IF NOT EXISTS public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  procedure_name text NOT NULL,
  procedure_code text,
  tooth_number text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  discount numeric(10,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budgets
CREATE POLICY "Users can view budgets from their clinic"
  ON public.budgets
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert budgets to their clinic"
  ON public.budgets
  FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update budgets from their clinic"
  ON public.budgets
  FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete budgets from their clinic"
  ON public.budgets
  FOR DELETE
  USING (
    clinic_id IN (
      SELECT u.clinica_id FROM public.usuarios u
      WHERE u.id = auth.uid() AND u.perfil = 'admin'::perfil_usuario
    )
  );

-- RLS Policies for budget_items
CREATE POLICY "Users can view budget items from their clinic"
  ON public.budget_items
  FOR SELECT
  USING (
    budget_id IN (
      SELECT b.id FROM public.budgets b
      JOIN public.profiles p ON b.clinic_id = p.clinic_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert budget items to their clinic budgets"
  ON public.budget_items
  FOR INSERT
  WITH CHECK (
    budget_id IN (
      SELECT b.id FROM public.budgets b
      JOIN public.profiles p ON b.clinic_id = p.clinic_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update budget items from their clinic"
  ON public.budget_items
  FOR UPDATE
  USING (
    budget_id IN (
      SELECT b.id FROM public.budgets b
      JOIN public.profiles p ON b.clinic_id = p.clinic_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete budget items from their clinic"
  ON public.budget_items
  FOR DELETE
  USING (
    budget_id IN (
      SELECT b.id FROM public.budgets b
      JOIN public.profiles p ON b.clinic_id = p.clinic_id
      WHERE p.id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_budgets_patient_id ON public.budgets(patient_id);
CREATE INDEX idx_budgets_clinic_id ON public.budgets(clinic_id);
CREATE INDEX idx_budgets_status ON public.budgets(status);
CREATE INDEX idx_budget_items_budget_id ON public.budget_items(budget_id);

-- Add comments
COMMENT ON TABLE public.budgets IS 'Treatment budgets/quotes for patients';
COMMENT ON TABLE public.budget_items IS 'Individual items/procedures in a budget';
COMMENT ON COLUMN public.budgets.status IS 'Budget status: draft, pending, approved, partially_approved, rejected, or converted';
COMMENT ON COLUMN public.budget_items.status IS 'Item status: pending, approved, or rejected';