-- Criar tabela de configurações do WhatsApp com suporte para API Oficial e Web (QR Code)
CREATE TABLE IF NOT EXISTS whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'api_oficial' CHECK (connection_type IN ('api_oficial', 'web_qrcode')),
  
  -- Campos para API Oficial (opcional quando usar web_qrcode)
  access_token TEXT,
  phone_number_id TEXT,
  business_account_id TEXT,
  webhook_verify_token TEXT,
  
  -- Campos para Web QR Code (opcional quando usar api_oficial)
  qr_code TEXT,
  session_data JSONB,
  connected_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(clinica_id)
);

-- Habilitar RLS
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver config de sua clínica"
  ON whatsapp_configs FOR SELECT
  USING (clinica_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir config de sua clínica"
  ON whatsapp_configs FOR INSERT
  WITH CHECK (clinica_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar config de sua clínica"
  ON whatsapp_configs FOR UPDATE
  USING (clinica_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar config de sua clínica"
  ON whatsapp_configs FOR DELETE
  USING (clinica_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

-- Índices
CREATE INDEX idx_whatsapp_configs_clinica ON whatsapp_configs(clinica_id);
CREATE INDEX idx_whatsapp_configs_connection_type ON whatsapp_configs(connection_type);
CREATE INDEX idx_whatsapp_configs_phone_number ON whatsapp_configs(phone_number_id) WHERE phone_number_id IS NOT NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_configs_updated_at
  BEFORE UPDATE ON whatsapp_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();