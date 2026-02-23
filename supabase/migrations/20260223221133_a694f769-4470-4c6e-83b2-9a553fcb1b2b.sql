
-- Add branding fields to configuracoes_clinica
ALTER TABLE public.configuracoes_clinica
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS cor_primaria TEXT DEFAULT '#22577A',
  ADD COLUMN IF NOT EXISTS layout_cabecalho TEXT DEFAULT 'logo_esquerda',
  ADD COLUMN IF NOT EXISTS marca_dagua_ativa BOOLEAN DEFAULT false;
