-- Remover política restritiva existente
DROP POLICY IF EXISTS "Admins can manage clinic config" ON configuracoes_clinica;

-- Criar política permissiva para administradores gerenciarem config
CREATE POLICY "Admins can manage clinic config"
ON configuracoes_clinica
FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
)
WITH CHECK (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);