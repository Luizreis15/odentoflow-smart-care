-- Adicionar campo de cor para identificação visual dos profissionais na agenda
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS cor VARCHAR(7) DEFAULT '#3b82f6';

-- Comentário para documentação
COMMENT ON COLUMN public.profissionais.cor IS 'Cor hexadecimal para identificação visual do profissional na agenda';