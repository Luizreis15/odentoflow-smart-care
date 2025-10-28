-- Adicionar campos específicos para contratos na tabela patient_documents
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS patient_birth_date date,
ADD COLUMN IF NOT EXISTS patient_cpf text,
ADD COLUMN IF NOT EXISTS patient_address text,
ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES profissionais(id),
ADD COLUMN IF NOT EXISTS professional_cpf text,
ADD COLUMN IF NOT EXISTS contract_value numeric,
ADD COLUMN IF NOT EXISTS procedures_list text,
ADD COLUMN IF NOT EXISTS budget_id uuid REFERENCES budgets(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_patient_documents_professional ON patient_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_budget ON patient_documents(budget_id);