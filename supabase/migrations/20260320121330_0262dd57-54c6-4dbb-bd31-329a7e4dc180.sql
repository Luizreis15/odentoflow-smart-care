
ALTER TABLE public.whatsapp_configs
ADD COLUMN IF NOT EXISTS instance_id TEXT,
ADD COLUMN IF NOT EXISTS instance_token TEXT;
