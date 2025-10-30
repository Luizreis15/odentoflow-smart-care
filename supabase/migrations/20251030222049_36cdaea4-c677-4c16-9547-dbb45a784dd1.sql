-- Tabelas para Planos & Assinaturas
CREATE TABLE IF NOT EXISTS public.system_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2),
  yearly_price NUMERIC(10,2),
  trial_days INTEGER DEFAULT 0,
  limits JSONB DEFAULT '{}'::jsonb,
  included_modules JSONB DEFAULT '[]'::jsonb,
  metered_items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.system_modules(id),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  allowlist_tenants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  feature_flag_id UUID REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, feature_flag_id)
);

CREATE TABLE IF NOT EXISTS public.system_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES public.clinicas(id),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_diff JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_audit_log_actor ON public.system_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_tenant ON public.system_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_created ON public.system_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_resource ON public.system_audit_log(resource);

-- RLS Policies
ALTER TABLE public.system_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_log ENABLE ROW LEVEL SECURITY;

-- Super admins podem fazer tudo
CREATE POLICY "Super admins can manage system plans" ON public.system_plans
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage system modules" ON public.system_modules
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage tenant overrides" ON public.tenant_feature_overrides
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can view audit log" ON public.system_audit_log
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Todos podem ver planos ativos (para página de preços)
CREATE POLICY "Anyone can view active plans" ON public.system_plans
  FOR SELECT USING (is_active = true);

-- Seed de dados iniciais
INSERT INTO public.system_modules (code, name, description, category) VALUES
  ('appointments', 'Agenda', 'Gerenciamento de consultas e agendamentos', 'core'),
  ('patients', 'Pacientes', 'Cadastro e prontuário de pacientes', 'core'),
  ('odontogram', 'Odontograma', 'Odontograma interativo', 'clinical'),
  ('treatments', 'Tratamentos', 'Planos de tratamento e orçamentos', 'clinical'),
  ('prosthesis', 'Próteses', 'Gestão de próteses e laboratórios', 'clinical'),
  ('inventory', 'Estoque', 'Controle de estoque e produtos', 'operational'),
  ('financial', 'Financeiro', 'Gestão financeira e faturamento', 'operational'),
  ('commissions', 'Comissões', 'Cálculo de repasses e comissões', 'operational'),
  ('contracts', 'Contratos', 'Geração de contratos', 'documents'),
  ('consents', 'Consentimentos', 'Termos de consentimento', 'documents'),
  ('anamneses', 'Anamneses', 'Fichas de anamnese', 'documents'),
  ('prescriptions', 'Receituários', 'Prescrições e receituários', 'documents'),
  ('reports', 'Relatórios', 'Relatórios gerenciais', 'analytics'),
  ('crm', 'CRM', 'Relacionamento com pacientes', 'marketing'),
  ('portal', 'Portal do Paciente', 'Acesso para pacientes', 'engagement')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.system_plans (name, slug, description, monthly_price, yearly_price, trial_days, limits, included_modules, display_order) VALUES
  (
    'Starter',
    'starter',
    'Ideal para consultórios pequenos que estão começando',
    97.00,
    970.00,
    14,
    '{"usuarios": 3, "pacientes": 100, "storage_gb": 5, "mensagens_mensais": 500}'::jsonb,
    '["appointments", "patients", "odontogram", "treatments", "contracts", "anamneses"]'::jsonb,
    1
  ),
  (
    'Professional',
    'professional',
    'Para clínicas em crescimento com necessidades avançadas',
    197.00,
    1970.00,
    14,
    '{"usuarios": 10, "pacientes": 500, "storage_gb": 20, "mensagens_mensais": 2000}'::jsonb,
    '["appointments", "patients", "odontogram", "treatments", "prosthesis", "inventory", "financial", "contracts", "consents", "anamneses", "prescriptions", "crm"]'::jsonb,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'Solução completa para redes e clínicas de grande porte',
    397.00,
    3970.00,
    14,
    '{"usuarios": -1, "pacientes": -1, "storage_gb": 100, "mensagens_mensais": 10000}'::jsonb,
    '["appointments", "patients", "odontogram", "treatments", "prosthesis", "inventory", "financial", "commissions", "contracts", "consents", "anamneses", "prescriptions", "reports", "crm", "portal"]'::jsonb,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- Trigger para audit log automático
CREATE OR REPLACE FUNCTION public.log_system_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.system_audit_log (actor_id, resource, action, payload_diff)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      'update',
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.system_audit_log (actor_id, resource, action, payload_diff)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      'delete',
      to_jsonb(OLD)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.system_audit_log (actor_id, resource, action, payload_diff)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      'insert',
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Aplicar triggers nas tabelas principais
CREATE TRIGGER audit_system_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.system_plans
  FOR EACH ROW EXECUTE FUNCTION public.log_system_audit();

CREATE TRIGGER audit_feature_flags
  AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.log_system_audit();

CREATE TRIGGER audit_tenant_overrides
  AFTER INSERT OR UPDATE OR DELETE ON public.tenant_feature_overrides
  FOR EACH ROW EXECUTE FUNCTION public.log_system_audit();