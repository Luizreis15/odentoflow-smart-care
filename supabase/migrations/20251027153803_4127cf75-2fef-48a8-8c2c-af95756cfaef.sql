-- Fix 1: Standardize RLS policies to use usuarios.perfil instead of has_role()

-- Update automated_messages policies
DROP POLICY IF EXISTS "Admins can manage automated messages" ON public.automated_messages;
CREATE POLICY "Admins can manage automated messages" 
ON public.automated_messages 
FOR ALL 
USING (
  clinic_id IN (
    SELECT clinica_id FROM public.usuarios 
    WHERE id = auth.uid() AND perfil = 'admin'
  )
);

-- Update financial_transactions policies
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins can manage financial transactions" 
ON public.financial_transactions 
FOR ALL 
USING (
  clinic_id IN (
    SELECT clinica_id FROM public.usuarios 
    WHERE id = auth.uid() AND perfil = 'admin'
  )
);

-- Update payments policies
DROP POLICY IF EXISTS "Admins and receptionists can manage payments" ON public.payments;
CREATE POLICY "Admins and receptionists can manage payments" 
ON public.payments 
FOR ALL 
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    WHERE p.clinic_id IN (
      SELECT clinica_id FROM public.usuarios 
      WHERE id = auth.uid() AND perfil IN ('admin', 'recepcao')
    )
  )
);

-- Update professionals policies
DROP POLICY IF EXISTS "Admins can manage professionals" ON public.professionals;
CREATE POLICY "Admins can manage professionals" 
ON public.professionals 
FOR ALL 
USING (
  clinic_id IN (
    SELECT clinica_id FROM public.usuarios 
    WHERE id = auth.uid() AND perfil = 'admin'
  )
);

-- Update treatments policies
DROP POLICY IF EXISTS "Dentists can manage treatments" ON public.treatments;
CREATE POLICY "Dentists can manage treatments" 
ON public.treatments 
FOR ALL 
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    WHERE p.clinic_id IN (
      SELECT clinica_id FROM public.usuarios 
      WHERE id = auth.uid() AND perfil IN ('admin', 'dentista')
    )
  )
);

-- Fix 2: Create onboarding function to properly initialize new users
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  _clinic_name text,
  _clinic_cnpj text DEFAULT NULL,
  _clinic_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _clinic_id uuid;
  _result jsonb;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already has a clinic
  SELECT clinic_id INTO _clinic_id
  FROM public.profiles
  WHERE id = _user_id;
  
  IF _clinic_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a clinic';
  END IF;

  -- Create clinic
  INSERT INTO public.clinics (name, owner_user_id, cnpj, phone)
  VALUES (_clinic_name, _user_id, _clinic_cnpj, _clinic_phone)
  RETURNING id INTO _clinic_id;

  -- Update profile with clinic_id
  UPDATE public.profiles
  SET clinic_id = _clinic_id
  WHERE id = _user_id;

  -- Add user to usuarios table as admin
  INSERT INTO public.usuarios (id, clinica_id, email, nome, perfil)
  SELECT 
    _user_id,
    _clinic_id,
    email,
    full_name,
    'admin'::perfil_usuario
  FROM public.profiles
  WHERE id = _user_id;

  _result := jsonb_build_object(
    'success', true,
    'clinic_id', _clinic_id
  );

  RETURN _result;
END;
$$;