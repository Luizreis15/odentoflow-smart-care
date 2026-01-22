-- Add duracao_minutos column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duracao_minutos INTEGER DEFAULT 30;

-- Add comment explaining the column
COMMENT ON COLUMN appointments.duracao_minutos IS 'Duration of the appointment in minutes. Default is 30 minutes.';