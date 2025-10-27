-- Criar função SECURITY DEFINER para obter perfil do usuário sem recursão RLS
CREATE OR REPLACE FUNCTION public.get_user_perfil(_user_id uuid)
RETURNS perfil_usuario
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil FROM public.usuarios WHERE id = _user_id LIMIT 1;
$$;

-- Recriar políticas RLS para usuarios usando a função SECURITY DEFINER
DROP POLICY IF EXISTS "sel_usuarios_admin" ON public.usuarios;
DROP POLICY IF EXISTS "ins_usuarios_admin" ON public.usuarios;
DROP POLICY IF EXISTS "upd_usuarios_admin" ON public.usuarios;
DROP POLICY IF EXISTS "del_usuarios_admin" ON public.usuarios;

-- SELECT: Usuário vê seu próprio registro OU admins veem todos da clínica
CREATE POLICY "sel_usuarios_admin" ON public.usuarios
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR 
  (
    get_user_perfil(auth.uid()) = 'admin'::perfil_usuario
    AND clinica_id = get_user_clinic_id(auth.uid())
  )
);

-- INSERT: Apenas admins podem inserir novos usuários na sua clínica
CREATE POLICY "ins_usuarios_admin" ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_perfil(auth.uid()) = 'admin'::perfil_usuario
  AND clinica_id = get_user_clinic_id(auth.uid())
);

-- UPDATE: Apenas admins podem atualizar usuários da sua clínica
CREATE POLICY "upd_usuarios_admin" ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  get_user_perfil(auth.uid()) = 'admin'::perfil_usuario
  AND clinica_id = get_user_clinic_id(auth.uid())
);

-- DELETE: Apenas admins podem deletar usuários da sua clínica
CREATE POLICY "del_usuarios_admin" ON public.usuarios
FOR DELETE
TO authenticated
USING (
  get_user_perfil(auth.uid()) = 'admin'::perfil_usuario
  AND clinica_id = get_user_clinic_id(auth.uid())
);