
-- Add contract versioning columns to patient_documents
ALTER TABLE public.patient_documents
ADD COLUMN IF NOT EXISTS contract_number text,
ADD COLUMN IF NOT EXISTS contract_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_contract_id uuid REFERENCES public.patient_documents(id);

-- Index for looking up contracts by number within a clinic
CREATE INDEX IF NOT EXISTS idx_patient_documents_contract_number 
ON public.patient_documents(contract_number) 
WHERE contract_number IS NOT NULL;

-- Index for finding addendums of a contract
CREATE INDEX IF NOT EXISTS idx_patient_documents_parent_contract 
ON public.patient_documents(parent_contract_id) 
WHERE parent_contract_id IS NOT NULL;
