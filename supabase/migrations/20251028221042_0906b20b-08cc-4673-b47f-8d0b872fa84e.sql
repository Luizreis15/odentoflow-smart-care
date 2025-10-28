-- Remover política de INSERT antiga
DROP POLICY IF EXISTS "Users can insert professionals for their clinic" ON profissionais;

-- Nova política mais permissiva para onboarding
CREATE POLICY "Users can insert professionals for their clinic"
ON profissionais
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM clinicas 
    WHERE id = clinica_id 
    AND (owner_user_id = auth.uid() OR id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ))
  )
);