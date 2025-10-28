-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can insert professionals for their clinic" ON profissionais;
DROP POLICY IF EXISTS "Users can view professionals from their clinic" ON profissionais;
DROP POLICY IF EXISTS "Admins can manage professionals" ON profissionais;

-- Permitir que usuários da clínica criem profissionais
CREATE POLICY "Users can insert professionals for their clinic"
ON profissionais
FOR INSERT
TO authenticated
WITH CHECK (
  clinica_id IN (
    SELECT clinic_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir que usuários vejam profissionais da sua clínica
CREATE POLICY "Users can view professionals from their clinic"
ON profissionais
FOR SELECT
TO authenticated
USING (
  clinica_id = get_user_clinic_id(auth.uid())
);

-- Permitir que admins gerenciem profissionais
CREATE POLICY "Admins can manage professionals"
ON profissionais
FOR ALL
TO authenticated
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
)
WITH CHECK (
  clinica_id = get_user_clinic_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);