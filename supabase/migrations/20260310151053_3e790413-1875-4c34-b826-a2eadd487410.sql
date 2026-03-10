
-- Table: clinic_permissions
CREATE TABLE public.clinic_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  perfil perfil_usuario NOT NULL,
  recurso text NOT NULL,
  acao text NOT NULL,
  permitido boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, perfil, recurso, acao)
);

-- RLS
ALTER TABLE public.clinic_permissions ENABLE ROW LEVEL SECURITY;

-- Admins of the clinic can read
CREATE POLICY "clinic_permissions_select" ON public.clinic_permissions
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND clinica_id = clinic_permissions.clinic_id AND perfil = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND clinica_id = clinic_permissions.clinic_id
    )
  );

-- Only admins can update
CREATE POLICY "clinic_permissions_update" ON public.clinic_permissions
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND clinica_id = clinic_permissions.clinic_id AND perfil = 'admin'
    )
  );

-- Only admins can insert
CREATE POLICY "clinic_permissions_insert" ON public.clinic_permissions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND clinica_id = clinic_permissions.clinic_id AND perfil = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "clinic_permissions_delete" ON public.clinic_permissions
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND clinica_id = clinic_permissions.clinic_id AND perfil = 'admin'
    )
  );

-- Function to seed default permissions for a clinic
CREATE OR REPLACE FUNCTION public.seed_default_permissions(_clinic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- DENTISTA permissions
  INSERT INTO public.clinic_permissions (clinic_id, perfil, recurso, acao, permitido) VALUES
    (_clinic_id, 'dentista', 'agenda', 'visualizar', true),
    (_clinic_id, 'dentista', 'agenda', 'criar', false),
    (_clinic_id, 'dentista', 'agenda', 'editar', false),
    (_clinic_id, 'dentista', 'agenda', 'finalizar_atendimento', true),
    (_clinic_id, 'dentista', 'prontuario', 'visualizar', true),
    (_clinic_id, 'dentista', 'prontuario', 'editar', true),
    (_clinic_id, 'dentista', 'odontograma', 'visualizar', true),
    (_clinic_id, 'dentista', 'odontograma', 'editar', true),
    (_clinic_id, 'dentista', 'orcamentos', 'visualizar', true),
    (_clinic_id, 'dentista', 'orcamentos', 'criar', true),
    (_clinic_id, 'dentista', 'pacientes', 'visualizar', true),
    (_clinic_id, 'dentista', 'pacientes', 'cadastrar', false),
    (_clinic_id, 'dentista', 'comissoes', 'visualizar', true),
    (_clinic_id, 'dentista', 'financeiro', 'visualizar', false),
    (_clinic_id, 'dentista', 'financeiro', 'estorno', false),
    (_clinic_id, 'dentista', 'financeiro', 'reabrir_pagamento', false),
    (_clinic_id, 'dentista', 'relatorios', 'visualizar', false),
    (_clinic_id, 'dentista', 'configuracoes', 'visualizar', false),
    (_clinic_id, 'dentista', 'crm', 'visualizar', false),
    (_clinic_id, 'dentista', 'usuarios', 'gerenciar', false),
    (_clinic_id, 'dentista', 'estoque', 'visualizar', false),
    (_clinic_id, 'dentista', 'ortodontia', 'visualizar', true),
    (_clinic_id, 'dentista', 'ortodontia', 'editar', true),
    (_clinic_id, 'dentista', 'proteses', 'visualizar', true),
    (_clinic_id, 'dentista', 'proteses', 'editar', true),
    (_clinic_id, 'dentista', 'portal_paciente', 'visualizar', false),
    (_clinic_id, 'dentista', 'ia_assistente', 'visualizar', true),
    -- RECEPCAO permissions
    (_clinic_id, 'recepcao', 'agenda', 'visualizar', true),
    (_clinic_id, 'recepcao', 'agenda', 'criar', true),
    (_clinic_id, 'recepcao', 'agenda', 'editar', true),
    (_clinic_id, 'recepcao', 'agenda', 'finalizar_atendimento', false),
    (_clinic_id, 'recepcao', 'prontuario', 'visualizar', true),
    (_clinic_id, 'recepcao', 'prontuario', 'editar', false),
    (_clinic_id, 'recepcao', 'odontograma', 'visualizar', true),
    (_clinic_id, 'recepcao', 'odontograma', 'editar', false),
    (_clinic_id, 'recepcao', 'orcamentos', 'visualizar', true),
    (_clinic_id, 'recepcao', 'orcamentos', 'criar', false),
    (_clinic_id, 'recepcao', 'pacientes', 'visualizar', true),
    (_clinic_id, 'recepcao', 'pacientes', 'cadastrar', true),
    (_clinic_id, 'recepcao', 'comissoes', 'visualizar', false),
    (_clinic_id, 'recepcao', 'financeiro', 'visualizar', true),
    (_clinic_id, 'recepcao', 'financeiro', 'estorno', false),
    (_clinic_id, 'recepcao', 'financeiro', 'reabrir_pagamento', false),
    (_clinic_id, 'recepcao', 'relatorios', 'visualizar', false),
    (_clinic_id, 'recepcao', 'configuracoes', 'visualizar', false),
    (_clinic_id, 'recepcao', 'crm', 'visualizar', false),
    (_clinic_id, 'recepcao', 'usuarios', 'gerenciar', false),
    (_clinic_id, 'recepcao', 'estoque', 'visualizar', true),
    (_clinic_id, 'recepcao', 'ortodontia', 'visualizar', true),
    (_clinic_id, 'recepcao', 'ortodontia', 'editar', false),
    (_clinic_id, 'recepcao', 'proteses', 'visualizar', true),
    (_clinic_id, 'recepcao', 'proteses', 'editar', false),
    (_clinic_id, 'recepcao', 'portal_paciente', 'visualizar', false),
    (_clinic_id, 'recepcao', 'ia_assistente', 'visualizar', true),
    -- ASSISTENTE permissions
    (_clinic_id, 'assistente', 'agenda', 'visualizar', true),
    (_clinic_id, 'assistente', 'agenda', 'criar', false),
    (_clinic_id, 'assistente', 'agenda', 'editar', false),
    (_clinic_id, 'assistente', 'agenda', 'finalizar_atendimento', false),
    (_clinic_id, 'assistente', 'prontuario', 'visualizar', true),
    (_clinic_id, 'assistente', 'prontuario', 'editar', false),
    (_clinic_id, 'assistente', 'odontograma', 'visualizar', true),
    (_clinic_id, 'assistente', 'odontograma', 'editar', false),
    (_clinic_id, 'assistente', 'orcamentos', 'visualizar', true),
    (_clinic_id, 'assistente', 'orcamentos', 'criar', false),
    (_clinic_id, 'assistente', 'pacientes', 'visualizar', true),
    (_clinic_id, 'assistente', 'pacientes', 'cadastrar', false),
    (_clinic_id, 'assistente', 'comissoes', 'visualizar', false),
    (_clinic_id, 'assistente', 'financeiro', 'visualizar', false),
    (_clinic_id, 'assistente', 'financeiro', 'estorno', false),
    (_clinic_id, 'assistente', 'financeiro', 'reabrir_pagamento', false),
    (_clinic_id, 'assistente', 'relatorios', 'visualizar', false),
    (_clinic_id, 'assistente', 'configuracoes', 'visualizar', false),
    (_clinic_id, 'assistente', 'crm', 'visualizar', false),
    (_clinic_id, 'assistente', 'usuarios', 'gerenciar', false),
    (_clinic_id, 'assistente', 'estoque', 'visualizar', false),
    (_clinic_id, 'assistente', 'ortodontia', 'visualizar', true),
    (_clinic_id, 'assistente', 'ortodontia', 'editar', false),
    (_clinic_id, 'assistente', 'proteses', 'visualizar', true),
    (_clinic_id, 'assistente', 'proteses', 'editar', false),
    (_clinic_id, 'assistente', 'portal_paciente', 'visualizar', false),
    (_clinic_id, 'assistente', 'ia_assistente', 'visualizar', true)
  ON CONFLICT (clinic_id, perfil, recurso, acao) DO NOTHING;
END;
$$;

-- Trigger: auto-seed permissions when a new clinic is created
CREATE OR REPLACE FUNCTION public.trigger_seed_clinic_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_default_permissions(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_clinic_created_seed_permissions
  AFTER INSERT ON public.clinicas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_seed_clinic_permissions();

-- Seed permissions for all existing clinics
DO $$
DECLARE
  _cid uuid;
BEGIN
  FOR _cid IN SELECT id FROM public.clinicas LOOP
    PERFORM public.seed_default_permissions(_cid);
  END LOOP;
END;
$$;
