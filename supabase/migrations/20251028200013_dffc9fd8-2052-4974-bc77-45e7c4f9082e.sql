-- Criar tipo para status da prótese
CREATE TYPE status_protese AS ENUM (
  'moldagem',
  'enviado_lab',
  'em_execucao',
  'pronto_instalacao',
  'instalado'
);

-- Criar tipo para tipo de laboratório
CREATE TYPE tipo_laboratorio AS ENUM (
  'interno',
  'externo'
);

-- Tabela de laboratórios
CREATE TABLE public.laboratorios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL,
  nome TEXT NOT NULL,
  responsavel TEXT,
  telefone TEXT,
  whatsapp TEXT,
  prazo_medio_dias INTEGER DEFAULT 7,
  forma_pagamento TEXT,
  condicoes_comerciais TEXT,
  tabela_procedimentos JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de próteses
CREATE TABLE public.proteses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL,
  paciente_id UUID NOT NULL,
  profissional_id UUID NOT NULL,
  procedimento_nome TEXT NOT NULL,
  procedimento_tipo TEXT NOT NULL,
  tipo_laboratorio tipo_laboratorio NOT NULL DEFAULT 'externo',
  laboratorio_id UUID,
  status status_protese NOT NULL DEFAULT 'moldagem',
  data_envio_prevista DATE,
  data_entrega_prevista DATE,
  data_instalacao_prevista DATE,
  data_envio_real DATE,
  data_entrega_real DATE,
  data_instalacao_real DATE,
  custo_laboratorial NUMERIC(10,2),
  forma_pagamento TEXT,
  despesa_id UUID,
  orcamento_id UUID,
  observacoes TEXT,
  atrasado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de movimentações (histórico)
CREATE TABLE public.protese_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protese_id UUID NOT NULL,
  status_anterior status_protese,
  status_novo status_protese NOT NULL,
  usuario_id UUID NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_proteses_clinica ON public.proteses(clinica_id);
CREATE INDEX idx_proteses_paciente ON public.proteses(paciente_id);
CREATE INDEX idx_proteses_profissional ON public.proteses(profissional_id);
CREATE INDEX idx_proteses_status ON public.proteses(status);
CREATE INDEX idx_laboratorios_clinica ON public.laboratorios(clinica_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_proteses_updated_at
  BEFORE UPDATE ON public.proteses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laboratorios_updated_at
  BEFORE UPDATE ON public.laboratorios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para registrar movimentações
CREATE OR REPLACE FUNCTION public.log_protese_movimentacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.protese_movimentacoes (
      protese_id,
      status_anterior,
      status_novo,
      usuario_id
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_protese_status_change
  AFTER UPDATE ON public.proteses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_protese_movimentacao();

-- RLS Policies para laboratorios
ALTER TABLE public.laboratorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view labs from their clinic"
  ON public.laboratorios FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage labs"
  ON public.laboratorios FOR ALL
  USING (
    clinica_id = get_user_clinic_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- RLS Policies para proteses
ALTER TABLE public.proteses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view proteses from their clinic"
  ON public.proteses FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create proteses"
  ON public.proteses FOR INSERT
  WITH CHECK (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update proteses from their clinic"
  ON public.proteses FOR UPDATE
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can delete proteses"
  ON public.proteses FOR DELETE
  USING (
    clinica_id = get_user_clinic_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- RLS Policies para protese_movimentacoes
ALTER TABLE public.protese_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view movimentacoes from their clinic proteses"
  ON public.protese_movimentacoes FOR SELECT
  USING (
    protese_id IN (
      SELECT id FROM public.proteses 
      WHERE clinica_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can insert movimentacoes"
  ON public.protese_movimentacoes FOR INSERT
  WITH CHECK (
    protese_id IN (
      SELECT id FROM public.proteses 
      WHERE clinica_id = get_user_clinic_id(auth.uid())
    )
  );