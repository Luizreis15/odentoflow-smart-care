-- Remove políticas antigas
DROP POLICY IF EXISTS "Admins can view, update and delete users in their clinic" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can insert users in their clinic" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users in their clinic" ON public.usuarios;
DROP POLICY IF EXISTS ins_usuarios_admin ON public.usuarios;
DROP POLICY IF EXISTS sel_usuarios_admin ON public.usuarios;

-- Política correta para INSERT com WITH CHECK
CREATE POLICY ins_usuarios_admin
ON public.usuarios
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id = auth.uid()
      AND u.clinica_id = clinica_id
      AND u.perfil = 'admin'::perfil_usuario
  )
);

-- Política SELECT para visualizar usuários da clínica
CREATE POLICY sel_usuarios_admin
ON public.usuarios 
FOR SELECT
USING (
  id = auth.uid()
  OR clinica_id IN (
    SELECT clinica_id 
    FROM public.usuarios 
    WHERE id = auth.uid() 
      AND perfil = 'admin'::perfil_usuario
  )
);

-- Política para UPDATE (admins podem atualizar usuários da sua clínica)
CREATE POLICY upd_usuarios_admin
ON public.usuarios
FOR UPDATE
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuarios 
    WHERE id = auth.uid() 
      AND perfil = 'admin'::perfil_usuario
  )
);

-- Política para DELETE (admins podem deletar usuários da sua clínica)
CREATE POLICY del_usuarios_admin
ON public.usuarios
FOR DELETE
USING (
  clinica_id IN (
    SELECT clinica_id 
    FROM public.usuarios 
    WHERE id = auth.uid() 
      AND perfil = 'admin'::perfil_usuario
  )
);