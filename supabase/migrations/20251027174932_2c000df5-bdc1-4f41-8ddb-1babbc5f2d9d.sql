-- Corrigir foreign key da tabela patients
-- A clinic_id deve referenciar clinicas.id, não profiles.id

-- Remover a foreign key incorreta
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;

-- Adicionar a foreign key correta
ALTER TABLE public.patients 
ADD CONSTRAINT patients_clinic_id_fkey 
FOREIGN KEY (clinic_id) 
REFERENCES public.clinicas(id) 
ON DELETE CASCADE;