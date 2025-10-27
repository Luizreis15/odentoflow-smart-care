-- Add clinic_id to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;

-- Create treatments table if not exists
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  value DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create financial_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  value DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  reference TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automated_messages table if not exists
CREATE TABLE IF NOT EXISTS public.automated_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL,
  content TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
DO $$
BEGIN
  ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.automated_messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- RLS Policies for treatments
DO $$
BEGIN
  CREATE POLICY "Users can view treatments from their clinic"
    ON public.treatments FOR SELECT
    USING (patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Dentists can manage treatments"
    ON public.treatments FOR ALL
    USING (
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'dentist')
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- RLS Policies for financial_transactions
DO $$
BEGIN
  CREATE POLICY "Users can view financial transactions from their clinic"
    ON public.financial_transactions FOR SELECT
    USING (clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage financial transactions"
    ON public.financial_transactions FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- RLS Policies for automated_messages
DO $$
BEGIN
  CREATE POLICY "Users can view automated messages from their clinic"
    ON public.automated_messages FOR SELECT
    USING (clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can manage automated messages"
    ON public.automated_messages FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- RLS Policies for payments
DO $$
BEGIN
  CREATE POLICY "Users can view payments from their clinic"
    ON public.payments FOR SELECT
    USING (patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
      )
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins and receptionists can manage payments"
    ON public.payments FOR ALL
    USING (
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'receptionist')
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- RLS Policies for reviews
DO $$
BEGIN
  CREATE POLICY "Users can view reviews from their clinic"
    ON public.reviews FOR SELECT
    USING (clinic_id IN (
      SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Add triggers for updated_at (only if they don't exist)
DO $$
BEGIN
  CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_automated_messages_updated_at
    BEFORE UPDATE ON public.automated_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;