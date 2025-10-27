-- Rename remaining columns from English to Portuguese
ALTER TABLE public.clinicas 
  RENAME COLUMN phone TO telefone;

-- Also check if we need to rename address (though it might stay as address or become endereco)
-- Keeping address as is for now since it's a jsonb field and commonly used in English