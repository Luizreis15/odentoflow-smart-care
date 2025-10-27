-- Criar enums necessários
CREATE TYPE public.perfil_usuario AS ENUM ('admin', 'dentista', 'assistente', 'recepcao');
CREATE TYPE public.plano_tipo AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE public.status_assinatura AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

-- Atualizar tabela clinics para o novo modelo
ALTER TABLE public.clinics DROP COLUMN IF EXISTS plan;
ALTER TABLE public.clinics DROP COLUMN IF EXISTS status;
ALTER TABLE public.clinics ADD COLUMN owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clinics ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE public.clinics ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE public.clinics ADD COLUMN plano plano_tipo DEFAULT 'starter';
ALTER TABLE public.clinics ADD COLUMN status_assinatura status_assinatura DEFAULT 'trialing';
ALTER TABLE public.clinics ADD COLUMN current_period_end TIMESTAMPTZ;

-- Alterar address para jsonb se não for
ALTER TABLE public.clinics ALTER COLUMN address TYPE JSONB USING 
  CASE 
    WHEN address IS NULL THEN NULL 
    ELSE jsonb_build_object('endereco', address)
  END;

-- Criar tabela usuarios (complementa profiles com perfil por clínica)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil perfil_usuario NOT NULL DEFAULT 'assistente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id, clinica_id)
);

-- Criar tabela planos (catálogo para mapear Stripe)
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  stripe_price_id TEXT UNIQUE,
  recursos JSONB DEFAULT '{}',
  limites JSONB DEFAULT '{"usuarios": 5, "pacientes": 100, "mensagens_mensais": 1000}',
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela limites_uso
CREATE TABLE IF NOT EXISTS public.limites_uso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  mensagens_enviadas INTEGER DEFAULT 0,
  pacientes_totais INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinica_id, mes_referencia)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_clinica_id ON public.usuarios(clinica_id);
CREATE INDEX IF NOT EXISTS idx_limites_uso_clinica_mes ON public.limites_uso(clinica_id, mes_referencia);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limites_uso ENABLE ROW LEVEL SECURITY;

-- RLS Policies para usuarios
CREATE POLICY "Usuários podem ver usuários da mesma clínica"
  ON public.usuarios FOR SELECT
  USING (clinica_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Admins podem gerenciar usuários da sua clínica"
  ON public.usuarios FOR ALL
  USING (
    clinica_id IN (
      SELECT clinica_id FROM public.usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- RLS Policies para planos (público para leitura)
CREATE POLICY "Todos podem ver planos"
  ON public.planos FOR SELECT
  USING (true);

-- RLS Policies para limites_uso
CREATE POLICY "Usuários podem ver limites da sua clínica"
  ON public.limites_uso FOR SELECT
  USING (clinica_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Admins podem gerenciar limites da sua clínica"
  ON public.limites_uso FOR ALL
  USING (
    clinica_id IN (
      SELECT clinica_id FROM public.usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Atualizar RLS da tabela clinics
DROP POLICY IF EXISTS "Users can view their clinic" ON public.clinics;
DROP POLICY IF EXISTS "Admins can manage clinics" ON public.clinics;

CREATE POLICY "Usuários podem ver sua clínica"
  ON public.clinics FOR SELECT
  USING (id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Owners e admins podem atualizar sua clínica"
  ON public.clinics FOR UPDATE
  USING (
    owner_user_id = auth.uid() OR 
    id IN (
      SELECT clinica_id FROM public.usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_updated_at
  BEFORE UPDATE ON public.planos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_limites_uso_updated_at
  BEFORE UPDATE ON public.limites_uso
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir planos padrão
INSERT INTO public.planos (nome, ordem, limites) VALUES
  ('Starter', 1, '{"usuarios": 3, "pacientes": 50, "mensagens_mensais": 500}'),
  ('Pro', 2, '{"usuarios": 10, "pacientes": 500, "mensagens_mensais": 5000}'),
  ('Enterprise', 3, '{"usuarios": 999, "pacientes": 9999, "mensagens_mensais": 99999}')
ON CONFLICT DO NOTHING;