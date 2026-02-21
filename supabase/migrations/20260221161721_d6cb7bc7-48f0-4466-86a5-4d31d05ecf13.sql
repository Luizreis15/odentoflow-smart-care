
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create whatsapp_message_log table
CREATE TABLE public.whatsapp_message_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id),
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID REFERENCES public.patients(id),
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'reminder',
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;

-- RLS: clinic users can view their own logs
CREATE POLICY "Clinic users can view their message logs"
  ON public.whatsapp_message_log
  FOR SELECT
  TO authenticated
  USING (
    clinic_id IN (
      SELECT COALESCE(p.clinic_id, u.clinica_id)
      FROM public.profiles p
      LEFT JOIN public.usuarios u ON u.id = p.id
      WHERE p.id = auth.uid()
    )
    OR public.is_super_admin(auth.uid())
  );

-- RLS: service role inserts (edge functions use service role key)
CREATE POLICY "Service role can insert message logs"
  ON public.whatsapp_message_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Index for dedup check
CREATE INDEX idx_whatsapp_log_appointment_type 
  ON public.whatsapp_message_log(appointment_id, message_type, created_at);

-- Index for clinic filtering
CREATE INDEX idx_whatsapp_log_clinic 
  ON public.whatsapp_message_log(clinic_id, created_at);
