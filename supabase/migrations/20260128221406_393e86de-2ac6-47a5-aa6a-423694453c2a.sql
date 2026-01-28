-- =============================================
-- 1. Adicionar campos para papel timbrado na configuracoes_clinica
-- =============================================
ALTER TABLE public.configuracoes_clinica 
ADD COLUMN IF NOT EXISTS cabecalho_personalizado JSONB DEFAULT '{"exibir_logo": true, "altura_logo": 60, "posicao_logo": "esquerda"}'::JSONB,
ADD COLUMN IF NOT EXISTS rodape_personalizado JSONB DEFAULT '{"exibir_endereco": true, "exibir_telefone": true, "exibir_email": true, "texto_adicional": null}'::JSONB;

-- =============================================
-- 2. Criar tabela para tipos de fornecedor (laboratório protético)
-- =============================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_fornecedor') THEN
        CREATE TYPE tipo_fornecedor AS ENUM ('geral', 'laboratorio_protetico', 'material_consumo', 'equipamentos');
    END IF;
END $$;

-- Adicionar tipo de fornecedor à tabela suppliers
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS tipo tipo_fornecedor DEFAULT 'geral';

-- =============================================
-- 3. Criar tabela para tabela de preços do laboratório protético
-- =============================================
CREATE TABLE IF NOT EXISTS public.lab_price_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    nome_servico TEXT NOT NULL,
    codigo_servico TEXT,
    material TEXT,
    cor TEXT,
    valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
    prazo_dias INTEGER DEFAULT 7,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para lab_price_table
ALTER TABLE public.lab_price_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic users can view lab prices"
ON public.lab_price_table FOR SELECT
USING (
    clinic_id IN (
        SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
    )
);

CREATE POLICY "Clinic admins can manage lab prices"
ON public.lab_price_table FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
        AND clinica_id = lab_price_table.clinic_id
        AND perfil = 'admin'
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lab_price_table_clinic ON public.lab_price_table(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lab_price_table_supplier ON public.lab_price_table(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tipo ON public.suppliers(tipo);

-- Trigger para updated_at
CREATE TRIGGER update_lab_price_table_updated_at
BEFORE UPDATE ON public.lab_price_table
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. Criar tabela para configurações do WhatsApp (Z-API)
-- =============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE UNIQUE,
    provider TEXT DEFAULT 'zapi',
    instance_id TEXT,
    instance_token TEXT,
    connected BOOLEAN DEFAULT FALSE,
    phone_connected TEXT,
    confirmacao_automatica BOOLEAN DEFAULT FALSE,
    lembrete_24h BOOLEAN DEFAULT FALSE,
    lembrete_1h BOOLEAN DEFAULT FALSE,
    mensagem_confirmacao TEXT DEFAULT 'Olá {paciente}! Confirmando sua consulta em {data} às {hora} na {clinica}. Responda SIM para confirmar ou NÃO para reagendar.',
    mensagem_lembrete TEXT DEFAULT 'Olá {paciente}! Lembrando que você tem uma consulta amanhã, {data} às {hora}, na {clinica}.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para whatsapp_config
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic admins can manage whatsapp config"
ON public.whatsapp_config FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
        AND clinica_id = whatsapp_config.clinic_id
        AND perfil = 'admin'
    )
);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_config_updated_at
BEFORE UPDATE ON public.whatsapp_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();