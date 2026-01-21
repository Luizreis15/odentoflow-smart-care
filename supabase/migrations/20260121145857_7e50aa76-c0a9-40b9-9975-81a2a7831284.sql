-- Corrigir funcao has_role para verificar em ambas as tabelas (user_roles e usuarios.perfil)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role perfil_usuario)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Verifica na tabela user_roles (roles globais do sistema)
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
  OR EXISTS (
    -- Verifica na tabela usuarios.perfil (roles de clinica)
    SELECT 1
    FROM public.usuarios
    WHERE id = _user_id
      AND perfil = _role
  )
$$;