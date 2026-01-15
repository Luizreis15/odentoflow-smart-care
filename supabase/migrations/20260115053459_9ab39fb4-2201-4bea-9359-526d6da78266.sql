-- Tabela de categorias de despesas
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#6b7280',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de tipos de despesa (fixa, variavel, comissao)
CREATE TABLE public.expense_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fixa', 'variavel', 'comissao')),
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de contas a pagar
CREATE TABLE public.payable_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  title_number SERIAL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  expense_type_id UUID REFERENCES public.expense_types(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
  payment_method TEXT,
  document_number TEXT,
  notes TEXT,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'weekly', 'yearly')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pagamentos de contas a pagar
CREATE TABLE public.payable_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payable_id UUID NOT NULL REFERENCES public.payable_titles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  cash_account_id UUID REFERENCES public.caixas(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payable_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payable_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_categories
CREATE POLICY "Users can view their clinic expense categories"
ON public.expense_categories FOR SELECT
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert expense categories for their clinic"
ON public.expense_categories FOR INSERT
WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their clinic expense categories"
ON public.expense_categories FOR UPDATE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete their clinic expense categories"
ON public.expense_categories FOR DELETE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- RLS Policies for expense_types
CREATE POLICY "Users can view their clinic expense types"
ON public.expense_types FOR SELECT
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert expense types for their clinic"
ON public.expense_types FOR INSERT
WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their clinic expense types"
ON public.expense_types FOR UPDATE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete their clinic expense types"
ON public.expense_types FOR DELETE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- RLS Policies for payable_titles
CREATE POLICY "Users can view their clinic payable titles"
ON public.payable_titles FOR SELECT
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert payable titles for their clinic"
ON public.payable_titles FOR INSERT
WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their clinic payable titles"
ON public.payable_titles FOR UPDATE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete their clinic payable titles"
ON public.payable_titles FOR DELETE
USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- RLS Policies for payable_payments
CREATE POLICY "Users can view payable payments for their clinic"
ON public.payable_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.payable_titles pt
    WHERE pt.id = payable_payments.payable_id
    AND pt.clinic_id = public.get_user_clinic_id(auth.uid())
  )
);

CREATE POLICY "Users can insert payable payments for their clinic"
ON public.payable_payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.payable_titles pt
    WHERE pt.id = payable_payments.payable_id
    AND pt.clinic_id = public.get_user_clinic_id(auth.uid())
  )
);

CREATE POLICY "Users can update payable payments for their clinic"
ON public.payable_payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.payable_titles pt
    WHERE pt.id = payable_payments.payable_id
    AND pt.clinic_id = public.get_user_clinic_id(auth.uid())
  )
);

CREATE POLICY "Users can delete payable payments for their clinic"
ON public.payable_payments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.payable_titles pt
    WHERE pt.id = payable_payments.payable_id
    AND pt.clinic_id = public.get_user_clinic_id(auth.uid())
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_types_updated_at
BEFORE UPDATE ON public.expense_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payable_titles_updated_at
BEFORE UPDATE ON public.payable_titles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create expense transaction when payment is made
CREATE OR REPLACE FUNCTION public.create_payable_expense_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id UUID;
  v_description TEXT;
BEGIN
  -- Get clinic_id and description from payable_titles
  SELECT pt.clinic_id, pt.description
  INTO v_clinic_id, v_description
  FROM public.payable_titles pt
  WHERE pt.id = NEW.payable_id;

  -- Create expense transaction
  INSERT INTO public.financial_transactions (
    clinic_id,
    date,
    type,
    value,
    category,
    reference
  ) VALUES (
    v_clinic_id,
    NEW.payment_date,
    'saida',
    NEW.amount,
    'despesa',
    v_description
  );

  -- Update payable_titles balance and status
  UPDATE public.payable_titles
  SET 
    balance = balance - NEW.amount,
    status = CASE 
      WHEN balance - NEW.amount <= 0 THEN 'paid'
      WHEN balance - NEW.amount < amount THEN 'partial'
      ELSE status
    END
  WHERE id = NEW.payable_id;

  RETURN NEW;
END;
$$;

-- Trigger to create expense transaction on payment
CREATE TRIGGER after_payable_payment_insert
AFTER INSERT ON public.payable_payments
FOR EACH ROW EXECUTE FUNCTION public.create_payable_expense_transaction();

-- Indexes for performance
CREATE INDEX idx_expense_categories_clinic ON public.expense_categories(clinic_id);
CREATE INDEX idx_expense_types_clinic ON public.expense_types(clinic_id);
CREATE INDEX idx_payable_titles_clinic ON public.payable_titles(clinic_id);
CREATE INDEX idx_payable_titles_due_date ON public.payable_titles(due_date);
CREATE INDEX idx_payable_titles_status ON public.payable_titles(status);
CREATE INDEX idx_payable_payments_payable ON public.payable_payments(payable_id);