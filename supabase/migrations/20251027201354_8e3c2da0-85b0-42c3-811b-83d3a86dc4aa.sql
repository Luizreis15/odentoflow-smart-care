-- Remover constraint antiga que pode estar conflitando
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_dentist_id_fkey;

-- Garantir que a constraint correta existe
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS fk_appointments_dentist;

-- Criar a constraint correta apontando para profissionais
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_dentist_id_fkey 
FOREIGN KEY (dentist_id) 
REFERENCES public.profissionais(id) 
ON DELETE SET NULL;