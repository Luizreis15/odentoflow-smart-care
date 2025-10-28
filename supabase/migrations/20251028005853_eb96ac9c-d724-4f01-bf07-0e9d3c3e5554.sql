-- Adicionar coluna ativo na tabela planos_procedimentos
ALTER TABLE public.planos_procedimentos 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;