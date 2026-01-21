-- Tabela de regras de comissão
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES public.procedimentos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  tipo_calculo TEXT NOT NULL DEFAULT 'percentual',
  percentual NUMERIC(5,2),
  valor_fixo NUMERIC(12,2),
  base_calculo TEXT NOT NULL DEFAULT 'bruto',
  gatilho TEXT NOT NULL DEFAULT 'recebimento',
  minimo_garantido NUMERIC(12,2),
  teto NUMERIC(12,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_commission_rules_clinic ON public.commission_rules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_profissional ON public.commission_rules(profissional_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_procedure ON public.commission_rules(procedure_id);

-- RLS
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver regras da clínica"
  ON public.commission_rules FOR SELECT
  USING (clinic_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar regras na clínica"
  ON public.commission_rules FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar regras da clínica"
  ON public.commission_rules FOR UPDATE
  USING (clinic_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar regras da clínica"
  ON public.commission_rules FOR DELETE
  USING (clinic_id IN (
    SELECT clinica_id FROM public.usuarios WHERE id = auth.uid()
  ));