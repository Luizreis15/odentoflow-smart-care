-- Adicionar novos campos à tabela profiles para dados da conta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foto_perfil_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone_fixo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fuso_horario TEXT DEFAULT 'America/Sao_Paulo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rua TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS atualizado_por UUID REFERENCES auth.users(id);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  idioma TEXT DEFAULT 'pt-BR',
  formato_data TEXT DEFAULT 'DD/MM/YYYY',
  formato_hora TEXT DEFAULT '24h',
  moeda TEXT DEFAULT 'BRL',
  tema TEXT DEFAULT 'light',
  densidade_tabela TEXT DEFAULT 'padrao',
  tamanho_maximo_anexo INTEGER DEFAULT 10485760,
  tipos_arquivo_permitidos TEXT[] DEFAULT ARRAY['pdf','jpg','png','doc','docx'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de notificações
CREATE TABLE IF NOT EXISTS public.user_notifications_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  financeiro_faturas BOOLEAN DEFAULT TRUE,
  financeiro_falha_pagamento BOOLEAN DEFAULT TRUE,
  financeiro_repasses BOOLEAN DEFAULT TRUE,
  agenda_novas_marcacoes BOOLEAN DEFAULT TRUE,
  agenda_alteracoes BOOLEAN DEFAULT TRUE,
  agenda_lembretes BOOLEAN DEFAULT TRUE,
  pacientes_novos_documentos BOOLEAN DEFAULT TRUE,
  pacientes_consentimentos BOOLEAN DEFAULT TRUE,
  operacao_estoque_baixo BOOLEAN DEFAULT TRUE,
  operacao_protese_pronta BOOLEAN DEFAULT TRUE,
  operacao_integracoes_erro BOOLEAN DEFAULT TRUE,
  canal_email BOOLEAN DEFAULT TRUE,
  canal_whatsapp BOOLEAN DEFAULT FALSE,
  canal_in_app BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões ativas
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispositivo TEXT,
  navegador TEXT,
  ip_address TEXT,
  localizacao TEXT,
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  modulo TEXT,
  detalhes JSONB,
  ip_address TEXT,
  dispositivo TEXT,
  resultado TEXT DEFAULT 'ok',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de consentimentos LGPD
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_consentimento TEXT NOT NULL,
  consentido BOOLEAN DEFAULT FALSE,
  data_consentimento TIMESTAMP WITH TIME ZONE,
  revogado BOOLEAN DEFAULT FALSE,
  data_revogacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de integrações
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  tipo_integracao TEXT NOT NULL,
  status TEXT DEFAULT 'inativo',
  configuracoes JSONB DEFAULT '{}'::jsonb,
  ultimo_teste TIMESTAMP WITH TIME ZONE,
  resultado_ultimo_teste TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_notifications_settings
CREATE POLICY "Users can view their own notification settings"
  ON public.user_notifications_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON public.user_notifications_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON public.user_notifications_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas RLS para user_consents
CREATE POLICY "Users can manage their own consents"
  ON public.user_consents FOR ALL
  USING (auth.uid() = user_id);

-- Políticas RLS para user_integrations
CREATE POLICY "Admins can manage integrations"
  ON public.user_integrations FOR ALL
  USING (
    clinic_id IN (
      SELECT clinica_id FROM usuarios
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Users can view integrations from their clinic"
  ON public.user_integrations FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notifications_settings_updated_at
  BEFORE UPDATE ON public.user_notifications_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar ultima_atualizacao no profiles
CREATE TRIGGER update_profiles_ultima_atualizacao
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();