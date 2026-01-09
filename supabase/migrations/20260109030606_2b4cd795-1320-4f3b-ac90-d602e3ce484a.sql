-- Política que permite usuários autenticados com clínica vinculada inserirem procedimentos
CREATE POLICY "Usuarios com clinica podem inserir procedimentos"
ON procedimentos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.clinic_id IS NOT NULL
  )
);

-- Política para permitir atualização por usuários com clínica
CREATE POLICY "Usuarios com clinica podem atualizar procedimentos"
ON procedimentos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.clinic_id IS NOT NULL
  )
);