-- Adicionar foreign key entre appointments e profissionais
ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_dentist 
FOREIGN KEY (dentist_id) 
REFERENCES public.profissionais(id) 
ON DELETE SET NULL;