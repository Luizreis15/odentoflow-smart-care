-- Fix critical security issue: Move roles from usuarios table to user_roles table
-- This prevents privilege escalation and fixes infinite recursion in RLS policies

-- Step 1: Clean up and prepare user_roles table
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS role;

ALTER TABLE public.user_roles
ADD COLUMN role perfil_usuario NOT NULL DEFAULT 'assistente'::perfil_usuario;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- Step 2: Migrate existing roles from usuarios.perfil to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, perfil
FROM public.usuarios
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Update the has_role() function to work with perfil_usuario enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role perfil_usuario)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: Drop ALL old policies on usuarios
DROP POLICY IF EXISTS "Admins podem gerenciar usuários da sua clínica" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver usuários da mesma clínica" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can manage users in their clinic" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users in their clinic" ON public.usuarios;

-- Step 5: Create new RLS policies using the has_role() security definer function
CREATE POLICY "Admins can manage users in their clinic"
ON public.usuarios
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::perfil_usuario)
  AND clinica_id IN (
    SELECT clinica_id 
    FROM public.usuarios 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view users in their clinic"
ON public.usuarios
FOR SELECT
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuarios 
    WHERE id = auth.uid()
  )
);

-- Step 6: Set up RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their clinic" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles in their clinic"
ON public.user_roles
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::perfil_usuario)
  AND user_id IN (
    SELECT id 
    FROM public.usuarios 
    WHERE clinica_id IN (
      SELECT clinica_id 
      FROM public.usuarios 
      WHERE id = auth.uid()
    )
  )
);

-- Step 7: Update complete_user_onboarding function
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(_clinic_name text, _clinic_cnpj text DEFAULT NULL::text, _clinic_phone text DEFAULT NULL::text)
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
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT clinic_id INTO _clinic_id
  FROM public.profiles
  WHERE id = _user_id;
  
  IF _clinic_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a clinic';
  END IF;

  INSERT INTO public.clinics (name, owner_user_id, cnpj, phone)
  VALUES (_clinic_name, _user_id, _clinic_cnpj, _clinic_phone)
  RETURNING id INTO _clinic_id;

  UPDATE public.profiles
  SET clinic_id = _clinic_id
  WHERE id = _user_id;

  INSERT INTO public.usuarios (id, clinica_id, email, nome, perfil)
  SELECT 
    _user_id,
    _clinic_id,
    email,
    full_name,
    'admin'::perfil_usuario
  FROM public.profiles
  WHERE id = _user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::perfil_usuario)
  ON CONFLICT (user_id, role) DO NOTHING;

  _result := jsonb_build_object(
    'success', true,
    'clinic_id', _clinic_id
  );

  RETURN _result;
END;
$$;

-- Step 8: Create audit logging infrastructure
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  changed_by uuid NOT NULL,
  old_role perfil_usuario,
  new_role perfil_usuario NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs for their clinic" ON public.role_audit_log;

CREATE POLICY "Admins can view audit logs for their clinic"
ON public.role_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::perfil_usuario));

-- Step 9: Create audit trigger
DROP TRIGGER IF EXISTS audit_role_changes ON public.user_roles;

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role)
    VALUES (NEW.user_id, auth.uid(), OLD.role, NEW.role);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role)
    VALUES (NEW.user_id, auth.uid(), NULL, NEW.role);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();