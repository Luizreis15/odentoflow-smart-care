-- Drop the old incorrect policy that checks user_roles
DROP POLICY IF EXISTS "Admins podem gerenciar itens de planos da clínica" ON planos_procedimentos_itens;

-- Create new policy that checks usuarios.perfil (correct for clinic admins)
CREATE POLICY "Admins podem gerenciar itens de planos da clínica" ON planos_procedimentos_itens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'
    AND usuarios.clinica_id IN (
      SELECT clinica_id FROM planos_procedimentos 
      WHERE id = planos_procedimentos_itens.plano_id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.perfil = 'admin'
    AND usuarios.clinica_id IN (
      SELECT clinica_id FROM planos_procedimentos 
      WHERE id = planos_procedimentos_itens.plano_id
    )
  )
);