-- Add procedure_id column to budget_items to reference the original procedure
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS procedure_id UUID REFERENCES procedimentos(id);