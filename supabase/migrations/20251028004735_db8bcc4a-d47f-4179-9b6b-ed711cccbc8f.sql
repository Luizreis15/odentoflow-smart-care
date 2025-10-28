-- Tabela base de procedimentos (referência do sistema)
CREATE TABLE public.procedimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_sistema TEXT NOT NULL UNIQUE,
  especialidade TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos personalizados
CREATE TABLE public.planos_procedimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  is_padrao BOOLEAN DEFAULT FALSE,
  percentual_ajuste NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinica_id, nome)
);

-- Tabela de itens dos planos personalizados
CREATE TABLE public.planos_procedimentos_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.planos_procedimentos(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES public.procedimentos(id) ON DELETE CASCADE,
  valor_customizado NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plano_id, procedimento_id)
);

-- Trigger para updated_at em procedimentos
CREATE TRIGGER update_procedimentos_updated_at
  BEFORE UPDATE ON public.procedimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em planos_procedimentos
CREATE TRIGGER update_planos_procedimentos_updated_at
  BEFORE UPDATE ON public.planos_procedimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em planos_procedimentos_itens
CREATE TRIGGER update_planos_procedimentos_itens_updated_at
  BEFORE UPDATE ON public.planos_procedimentos_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para procedimentos (todos podem ver a tabela base)
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver procedimentos base"
  ON public.procedimentos
  FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar procedimentos base"
  ON public.procedimentos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::perfil_usuario));

-- RLS Policies para planos_procedimentos
ALTER TABLE public.planos_procedimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver planos da sua clínica"
  ON public.planos_procedimentos
  FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins podem gerenciar planos da clínica"
  ON public.planos_procedimentos
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario) 
    AND clinica_id = get_user_clinic_id(auth.uid())
  );

-- RLS Policies para planos_procedimentos_itens
ALTER TABLE public.planos_procedimentos_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de planos da sua clínica"
  ON public.planos_procedimentos_itens
  FOR SELECT
  USING (
    plano_id IN (
      SELECT id FROM public.planos_procedimentos
      WHERE clinica_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Admins podem gerenciar itens de planos da clínica"
  ON public.planos_procedimentos_itens
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario)
    AND plano_id IN (
      SELECT id FROM public.planos_procedimentos
      WHERE clinica_id = get_user_clinic_id(auth.uid())
    )
  );

-- Função para garantir que apenas um plano seja padrão por clínica
CREATE OR REPLACE FUNCTION public.set_plano_padrao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_padrao = TRUE THEN
    UPDATE public.planos_procedimentos
    SET is_padrao = FALSE
    WHERE clinica_id = NEW.clinica_id
      AND id != NEW.id
      AND is_padrao = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_single_plano_padrao
  BEFORE INSERT OR UPDATE ON public.planos_procedimentos
  FOR EACH ROW
  WHEN (NEW.is_padrao = TRUE)
  EXECUTE FUNCTION public.set_plano_padrao();