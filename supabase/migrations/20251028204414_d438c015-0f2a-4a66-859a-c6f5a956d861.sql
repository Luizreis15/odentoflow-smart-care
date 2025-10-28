-- Create tables for Ajustes module

-- Configurações da clínica
CREATE TABLE IF NOT EXISTS public.configuracoes_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  horario_funcionamento JSONB DEFAULT '{"seg": {"inicio": "08:00", "fim": "18:00"}, "ter": {"inicio": "08:00", "fim": "18:00"}, "qua": {"inicio": "08:00", "fim": "18:00"}, "qui": {"inicio": "08:00", "fim": "18:00"}, "sex": {"inicio": "08:00", "fim": "18:00"}, "sab": {"inicio": "08:00", "fim": "12:00"}, "dom": {"fechado": true}}'::jsonb,
  logotipo_url TEXT,
  email_contato TEXT,
  whatsapp TEXT,
  imprimir_papel_timbrado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinica_id)
);

-- Configurações de Nota Fiscal
CREATE TABLE IF NOT EXISTS public.configuracoes_nf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  regime_tributario TEXT,
  serie_nf TEXT,
  csc TEXT,
  inscricao_municipal TEXT,
  inscricao_estadual TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinica_id)
);

-- Categorias de procedimentos
CREATE TABLE IF NOT EXISTS public.categorias_procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Templates de contratos
CREATE TABLE IF NOT EXISTS public.templates_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('consentimento', 'prestacao_servico', 'orcamento', 'outro')),
  conteudo TEXT NOT NULL,
  variaveis_disponiveis TEXT[] DEFAULT ARRAY['paciente', 'cpf', 'data', 'procedimentos', 'profissional', 'cro', 'clinica', 'valor']::TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Caixas financeiros
CREATE TABLE IF NOT EXISTS public.caixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT DEFAULT 'geral' CHECK (tipo IN ('geral', 'recepcao', 'principal')),
  saldo_inicial NUMERIC(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cadeiras clínicas
CREATE TABLE IF NOT EXISTS public.cadeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  localizacao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add updated_at triggers
CREATE TRIGGER update_configuracoes_clinica_updated_at
BEFORE UPDATE ON public.configuracoes_clinica
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_nf_updated_at
BEFORE UPDATE ON public.configuracoes_nf
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categorias_procedimentos_updated_at
BEFORE UPDATE ON public.categorias_procedimentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_contratos_updated_at
BEFORE UPDATE ON public.templates_contratos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_caixas_updated_at
BEFORE UPDATE ON public.caixas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cadeiras_updated_at
BEFORE UPDATE ON public.cadeiras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.configuracoes_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_nf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadeiras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for configuracoes_clinica
CREATE POLICY "Users can view their clinic config"
ON public.configuracoes_clinica FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage clinic config"
ON public.configuracoes_clinica FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- RLS Policies for configuracoes_nf
CREATE POLICY "Users can view their clinic NF config"
ON public.configuracoes_nf FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage NF config"
ON public.configuracoes_nf FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- RLS Policies for categorias_procedimentos
CREATE POLICY "Users can view categories"
ON public.categorias_procedimentos FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage categories"
ON public.categorias_procedimentos FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- RLS Policies for templates_contratos
CREATE POLICY "Users can view templates"
ON public.templates_contratos FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage templates"
ON public.templates_contratos FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- RLS Policies for caixas
CREATE POLICY "Users can view caixas"
ON public.caixas FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage caixas"
ON public.caixas FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- RLS Policies for cadeiras
CREATE POLICY "Users can view cadeiras"
ON public.cadeiras FOR SELECT
USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage cadeiras"
ON public.cadeiras FOR ALL
USING (
  clinica_id = get_user_clinic_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);