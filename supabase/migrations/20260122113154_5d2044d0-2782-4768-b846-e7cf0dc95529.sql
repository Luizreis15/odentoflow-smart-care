-- Tabela de etapas de prótese
CREATE TABLE public.protese_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protese_id UUID NOT NULL REFERENCES public.proteses(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 1,
  nome_etapa TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'em_execucao', 'concluida', 'cancelada')),
  laboratorio_id UUID REFERENCES public.laboratorios(id),
  cor TEXT,
  data_envio DATE,
  data_retorno_prevista DATE,
  data_retorno_real DATE,
  custo NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos à tabela proteses
ALTER TABLE public.proteses 
  ADD COLUMN IF NOT EXISTS cor_final TEXT,
  ADD COLUMN IF NOT EXISTS dente_elemento TEXT,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS etapa_atual_id UUID REFERENCES public.protese_etapas(id);

-- Índices para performance
CREATE INDEX idx_protese_etapas_protese_id ON public.protese_etapas(protese_id);
CREATE INDEX idx_protese_etapas_status ON public.protese_etapas(status);

-- Enable RLS
ALTER TABLE public.protese_etapas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para protese_etapas (usando id ao invés de user_id)
CREATE POLICY "Users can view etapas from their clinic proteses"
  ON public.protese_etapas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proteses p
      JOIN public.clinicas c ON p.clinica_id = c.id
      JOIN public.usuarios u ON c.id = u.clinica_id
      WHERE p.id = protese_etapas.protese_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert etapas for their clinic proteses"
  ON public.protese_etapas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proteses p
      JOIN public.clinicas c ON p.clinica_id = c.id
      JOIN public.usuarios u ON c.id = u.clinica_id
      WHERE p.id = protese_etapas.protese_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Users can update etapas from their clinic proteses"
  ON public.protese_etapas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.proteses p
      JOIN public.clinicas c ON p.clinica_id = c.id
      JOIN public.usuarios u ON c.id = u.clinica_id
      WHERE p.id = protese_etapas.protese_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete etapas from their clinic proteses"
  ON public.protese_etapas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.proteses p
      JOIN public.clinicas c ON p.clinica_id = c.id
      JOIN public.usuarios u ON c.id = u.clinica_id
      WHERE p.id = protese_etapas.protese_id
      AND u.id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_protese_etapas_updated_at
  BEFORE UPDATE ON public.protese_etapas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();