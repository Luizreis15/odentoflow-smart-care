-- Remover TODAS as políticas conflitantes de INSERT para profissionais
DROP POLICY IF EXISTS "Allow insert profissionais for clinic owners and members" ON profissionais;
DROP POLICY IF EXISTS "Admins can manage professionals" ON profissionais;

-- Política SIMPLES e DIRETA para INSERT durante onboarding
-- Permite inserir se: usuário é owner da clínica OU tem clinic_id correspondente no profile
CREATE POLICY "Enable insert for authenticated users with clinic"
ON profissionais
FOR INSERT
TO authenticated
WITH CHECK (
  -- Usuário é owner da clínica
  EXISTS (
    SELECT 1 FROM clinicas 
    WHERE clinicas.id = profissionais.clinica_id 
    AND clinicas.owner_user_id = auth.uid()
  )
  OR
  -- Usuário tem clinic_id no perfil que corresponde
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.clinic_id = profissionais.clinica_id
  )
);

-- Recriar política de admin para outras operações (não INSERT)
CREATE POLICY "Admins can manage professionals"
ON profissionais
FOR ALL
USING (
  clinica_id IN (
    SELECT id FROM clinicas WHERE owner_user_id = auth.uid()
  )
);