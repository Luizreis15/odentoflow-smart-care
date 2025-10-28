-- Adicionar foreign keys para proteses
ALTER TABLE public.proteses
ADD CONSTRAINT proteses_paciente_id_fkey 
FOREIGN KEY (paciente_id) REFERENCES public.patients(id);

ALTER TABLE public.proteses
ADD CONSTRAINT proteses_profissional_id_fkey 
FOREIGN KEY (profissional_id) REFERENCES public.profissionais(id);

ALTER TABLE public.proteses
ADD CONSTRAINT proteses_laboratorio_id_fkey 
FOREIGN KEY (laboratorio_id) REFERENCES public.laboratorios(id);

ALTER TABLE public.proteses
ADD CONSTRAINT proteses_clinica_id_fkey 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);

-- Adicionar foreign key para laboratorios
ALTER TABLE public.laboratorios
ADD CONSTRAINT laboratorios_clinica_id_fkey 
FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);

-- Adicionar foreign key para movimentacoes
ALTER TABLE public.protese_movimentacoes
ADD CONSTRAINT protese_movimentacoes_protese_id_fkey 
FOREIGN KEY (protese_id) REFERENCES public.proteses(id) ON DELETE CASCADE;

ALTER TABLE public.protese_movimentacoes
ADD CONSTRAINT protese_movimentacoes_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);