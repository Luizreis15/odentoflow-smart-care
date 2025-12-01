-- Drop the old incorrect policy that checks user_roles
DROP POLICY IF EXISTS "Admins podem gerenciar planos da clínica" ON planos_procedimentos;

-- Create new policy that checks usuarios.perfil (correct for clinic admins)
CREATE POLICY "Admins podem gerenciar planos da clínica" ON planos_procedimentos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'
    AND usuarios.clinica_id = planos_procedimentos.clinica_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'
    AND usuarios.clinica_id = planos_procedimentos.clinica_id
  )
);