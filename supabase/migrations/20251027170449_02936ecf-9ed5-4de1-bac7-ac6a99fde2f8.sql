-- Rename columns from English to Portuguese and add missing columns
ALTER TABLE public.clinicas 
  RENAME COLUMN name TO nome;

-- Add missing columns
ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'clinica';

ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started';