-- Criar tabela de modelos de anamnese
CREATE TABLE public.anamnese_modelos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perguntas dos modelos
CREATE TABLE public.anamnese_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo_id UUID NOT NULL REFERENCES public.anamnese_modelos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo_resposta TEXT NOT NULL DEFAULT 'sim_nao_na',
  obrigatoria BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL,
  pergunta_pai_id UUID REFERENCES public.anamnese_perguntas(id) ON DELETE CASCADE,
  condicao_resposta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de anamneses dos pacientes
CREATE TABLE public.anamneses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  modelo_id UUID NOT NULL REFERENCES public.anamnese_modelos(id),
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'rascunho',
  alerta_clinico BOOLEAN NOT NULL DEFAULT false,
  alerta_descricao TEXT,
  assinatura_data TIMESTAMP WITH TIME ZONE,
  assinatura_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finalizada_em TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de respostas das anamneses
CREATE TABLE public.anamnese_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anamnese_id UUID NOT NULL REFERENCES public.anamneses(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES public.anamnese_perguntas(id) ON DELETE CASCADE,
  resposta TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(anamnese_id, pergunta_id)
);

-- Habilitar RLS
ALTER TABLE public.anamnese_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnese_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnese_respostas ENABLE ROW LEVEL SECURITY;

-- Policies para anamnese_modelos
CREATE POLICY "Users can view models from their clinic"
  ON public.anamnese_modelos FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage models"
  ON public.anamnese_modelos FOR ALL
  USING (has_role(auth.uid(), 'admin'::perfil_usuario) AND clinica_id = get_user_clinic_id(auth.uid()));

-- Policies para anamnese_perguntas
CREATE POLICY "Users can view questions from their clinic models"
  ON public.anamnese_perguntas FOR SELECT
  USING (modelo_id IN (SELECT id FROM anamnese_modelos WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Admins can manage questions"
  ON public.anamnese_perguntas FOR ALL
  USING (modelo_id IN (SELECT id FROM anamnese_modelos WHERE clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario)));

-- Policies para anamneses
CREATE POLICY "Users can view anamneses from their clinic"
  ON public.anamneses FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Dentists can create anamneses"
  ON public.anamneses FOR INSERT
  WITH CHECK (
    paciente_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid()))
    AND (get_user_perfil(auth.uid()) IN ('dentista'::perfil_usuario, 'admin'::perfil_usuario))
  );

CREATE POLICY "Dentists can update their anamneses"
  ON public.anamneses FOR UPDATE
  USING (
    paciente_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid()))
    AND (get_user_perfil(auth.uid()) IN ('dentista'::perfil_usuario, 'admin'::perfil_usuario))
  );

CREATE POLICY "Admins can delete anamneses"
  ON public.anamneses FOR DELETE
  USING (
    paciente_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid()))
    AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Policies para anamnese_respostas
CREATE POLICY "Users can view responses from their clinic"
  ON public.anamnese_respostas FOR SELECT
  USING (anamnese_id IN (
    SELECT id FROM anamneses WHERE paciente_id IN (
      SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  ));

CREATE POLICY "Dentists can manage responses"
  ON public.anamnese_respostas FOR ALL
  USING (
    anamnese_id IN (
      SELECT id FROM anamneses WHERE paciente_id IN (
        SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
      )
    )
    AND (get_user_perfil(auth.uid()) IN ('dentista'::perfil_usuario, 'admin'::perfil_usuario))
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_anamnese_modelos_updated_at
  BEFORE UPDATE ON public.anamnese_modelos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anamnese_perguntas_updated_at
  BEFORE UPDATE ON public.anamnese_perguntas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anamneses_updated_at
  BEFORE UPDATE ON public.anamneses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anamnese_respostas_updated_at
  BEFORE UPDATE ON public.anamnese_respostas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir modelos padrão
INSERT INTO public.anamnese_modelos (clinica_id, nome, descricao) 
SELECT id, 'Anamnese Adulta', 'Modelo completo de anamnese para pacientes adultos' FROM public.clinicas LIMIT 1;

INSERT INTO public.anamnese_modelos (clinica_id, nome, descricao) 
SELECT id, 'Anamnese Adulta (Resumida)', 'Versão resumida para consultas rápidas' FROM public.clinicas LIMIT 1;

INSERT INTO public.anamnese_modelos (clinica_id, nome, descricao) 
SELECT id, 'Anamnese Infantil', 'Modelo específico para pacientes pediátricos' FROM public.clinicas LIMIT 1;

INSERT INTO public.anamnese_modelos (clinica_id, nome, descricao) 
SELECT id, 'Anamnese Ortodôntica', 'Avaliação específica para tratamentos ortodônticos' FROM public.clinicas LIMIT 1;

INSERT INTO public.anamnese_modelos (clinica_id, nome, descricao) 
SELECT id, 'Anamnese HOF', 'Hábitos Orais e Funções' FROM public.clinicas LIMIT 1;