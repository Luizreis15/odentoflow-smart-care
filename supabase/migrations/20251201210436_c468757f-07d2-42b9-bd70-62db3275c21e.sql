-- Remover política atual que usa has_role incorretamente
DROP POLICY IF EXISTS "Admins can manage clinic config" ON configuracoes_clinica;

-- Criar nova política que verifica diretamente usuarios.perfil
CREATE POLICY "Admins can manage clinic config"
ON configuracoes_clinica
FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'::perfil_usuario
  )
)
WITH CHECK (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'::perfil_usuario
  )
);