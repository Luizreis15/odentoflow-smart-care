-- Adicionar campos de dente/região aos budget_items se não existirem
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS tooth_region TEXT;

-- Criar tabela de evoluções de tratamento
CREATE TABLE IF NOT EXISTS treatment_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_item_id UUID NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profissionais(id),
  description TEXT NOT NULL,
  evolution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar campo de status nos budget_items para controle do tratamento
ALTER TABLE budget_items
ADD COLUMN IF NOT EXISTS treatment_status TEXT DEFAULT 'pending' CHECK (treatment_status IN ('pending', 'in_progress', 'completed'));

-- Enable RLS
ALTER TABLE treatment_evolutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies para treatment_evolutions
CREATE POLICY "Users can view evolutions from their clinic"
ON treatment_evolutions
FOR SELECT
USING (
  patient_id IN (
    SELECT patients.id 
    FROM patients 
    WHERE patients.clinic_id IN (
      SELECT profiles.clinic_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  )
);

CREATE POLICY "Dentists can insert evolutions"
ON treatment_evolutions
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT p.id 
    FROM patients p
    WHERE p.clinic_id IN (
      SELECT u.clinica_id 
      FROM usuarios u
      WHERE u.id = auth.uid() 
      AND u.perfil IN ('dentista', 'admin')
    )
  )
);

CREATE POLICY "Dentists can update evolutions"
ON treatment_evolutions
FOR UPDATE
USING (
  patient_id IN (
    SELECT p.id 
    FROM patients p
    WHERE p.clinic_id IN (
      SELECT u.clinica_id 
      FROM usuarios u
      WHERE u.id = auth.uid() 
      AND u.perfil IN ('dentista', 'admin')
    )
  )
);

CREATE POLICY "Admins can delete evolutions"
ON treatment_evolutions
FOR DELETE
USING (
  patient_id IN (
    SELECT p.id 
    FROM patients p
    WHERE p.clinic_id IN (
      SELECT u.clinica_id 
      FROM usuarios u
      WHERE u.id = auth.uid() 
      AND u.perfil = 'admin'
    )
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_treatment_evolutions_updated_at
BEFORE UPDATE ON treatment_evolutions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status do budget_item quando evolução é criada
CREATE OR REPLACE FUNCTION update_budget_item_status_on_evolution()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é a primeira evolução, muda para "in_progress"
  IF NEW.status = 'in_progress' OR NOT EXISTS (
    SELECT 1 FROM treatment_evolutions 
    WHERE budget_item_id = NEW.budget_item_id 
    AND id != NEW.id
  ) THEN
    UPDATE budget_items 
    SET treatment_status = 'in_progress'
    WHERE id = NEW.budget_item_id 
    AND treatment_status = 'pending';
  END IF;
  
  -- Se marca como concluído, atualiza o budget_item
  IF NEW.status = 'completed' THEN
    UPDATE budget_items 
    SET treatment_status = 'completed'
    WHERE id = NEW.budget_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_budget_item_status
AFTER INSERT OR UPDATE ON treatment_evolutions
FOR EACH ROW
EXECUTE FUNCTION update_budget_item_status_on_evolution();