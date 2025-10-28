-- Remover políticas conflitantes de INSERT
DROP POLICY IF EXISTS "Owners and admins can insert profissionais" ON profissionais;
DROP POLICY IF EXISTS "Users can insert professionals for their clinic" ON profissionais;

-- Criar política simples para INSERT durante onboarding
-- Permite inserir se o usuário é owner da clínica OU tem clinic_id no perfil
CREATE POLICY "Allow insert profissionais for clinic owners and members"
ON profissionais
FOR INSERT
TO authenticated
WITH CHECK (
  clinica_id IN (
    SELECT id FROM clinicas WHERE owner_user_id = auth.uid()
  )
  OR
  clinica_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid() AND clinic_id IS NOT NULL
  )
);