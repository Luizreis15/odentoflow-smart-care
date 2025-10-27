-- Drop the existing ALL policy and recreate with proper INSERT handling
DROP POLICY IF EXISTS "Admins can manage users in their clinic" ON usuarios;

-- Policy for SELECT, UPDATE, DELETE
CREATE POLICY "Admins can view, update and delete users in their clinic"
ON usuarios
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::perfil_usuario) 
  AND clinica_id = get_user_clinic_id(auth.uid())
);

-- Specific policy for INSERT with WITH CHECK
CREATE POLICY "Admins can insert users in their clinic"
ON usuarios
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::perfil_usuario) 
  AND clinica_id = get_user_clinic_id(auth.uid())
);