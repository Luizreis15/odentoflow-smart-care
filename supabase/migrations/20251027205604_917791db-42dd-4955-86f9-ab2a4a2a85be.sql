-- Add new fields to patients table to match Simples Dental standard
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('masculino', 'feminino')),
ADD COLUMN IF NOT EXISTS is_foreign boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS how_found text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS responsible_name text,
ADD COLUMN IF NOT EXISTS responsible_birth_date date,
ADD COLUMN IF NOT EXISTS responsible_cpf text,
ADD COLUMN IF NOT EXISTS responsible_phone text;

-- Add comment to document the fields
COMMENT ON COLUMN public.patients.gender IS 'Patient gender: masculino or feminino';
COMMENT ON COLUMN public.patients.is_foreign IS 'Whether the patient is foreign';
COMMENT ON COLUMN public.patients.rg IS 'Patient RG (identity document)';
COMMENT ON COLUMN public.patients.how_found IS 'How the patient found the clinic';
COMMENT ON COLUMN public.patients.tags IS 'Patient tags/labels for categorization';
COMMENT ON COLUMN public.patients.responsible_name IS 'Name of the responsible person (for minors)';
COMMENT ON COLUMN public.patients.responsible_birth_date IS 'Birth date of the responsible person';
COMMENT ON COLUMN public.patients.responsible_cpf IS 'CPF of the responsible person';
COMMENT ON COLUMN public.patients.responsible_phone IS 'Phone of the responsible person';