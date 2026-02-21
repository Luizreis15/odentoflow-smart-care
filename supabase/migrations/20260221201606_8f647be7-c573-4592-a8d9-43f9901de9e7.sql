
-- ============================================================
-- 1. Tabela whatsapp_campaigns
-- ============================================================
CREATE TABLE public.whatsapp_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  message_template TEXT NOT NULL,
  target_segment JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_count INT NOT NULL DEFAULT 0,
  response_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns of their clinic"
  ON public.whatsapp_campaigns FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert campaigns for their clinic"
  ON public.whatsapp_campaigns FOR INSERT
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update campaigns of their clinic"
  ON public.whatsapp_campaigns FOR UPDATE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete campaigns of their clinic"
  ON public.whatsapp_campaigns FOR DELETE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE TRIGGER update_whatsapp_campaigns_updated_at
  BEFORE UPDATE ON public.whatsapp_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. Tabela whatsapp_campaign_recipients
-- ============================================================
CREATE TABLE public.whatsapp_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients via campaign clinic"
  ON public.whatsapp_campaign_recipients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_campaigns c
    WHERE c.id = campaign_id
    AND c.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert recipients via campaign clinic"
  ON public.whatsapp_campaign_recipients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.whatsapp_campaigns c
    WHERE c.id = campaign_id
    AND c.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can update recipients via campaign clinic"
  ON public.whatsapp_campaign_recipients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_campaigns c
    WHERE c.id = campaign_id
    AND c.clinic_id = public.get_user_clinic_id(auth.uid())
  ));

-- ============================================================
-- 3. Tabela whatsapp_automations
-- ============================================================
CREATE TABLE public.whatsapp_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  message_template TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automations of their clinic"
  ON public.whatsapp_automations FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert automations for their clinic"
  ON public.whatsapp_automations FOR INSERT
  WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update automations of their clinic"
  ON public.whatsapp_automations FOR UPDATE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete automations of their clinic"
  ON public.whatsapp_automations FOR DELETE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE TRIGGER update_whatsapp_automations_updated_at
  BEFORE UPDATE ON public.whatsapp_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. Coluna google_review_link na tabela clinicas
-- ============================================================
ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS google_review_link TEXT;

-- ============================================================
-- 5. Indexes para performance
-- ============================================================
CREATE INDEX idx_whatsapp_campaigns_clinic_id ON public.whatsapp_campaigns(clinic_id);
CREATE INDEX idx_whatsapp_campaigns_status ON public.whatsapp_campaigns(status);
CREATE INDEX idx_whatsapp_campaign_recipients_campaign_id ON public.whatsapp_campaign_recipients(campaign_id);
CREATE INDEX idx_whatsapp_campaign_recipients_status ON public.whatsapp_campaign_recipients(status);
CREATE INDEX idx_whatsapp_automations_clinic_id ON public.whatsapp_automations(clinic_id);
CREATE INDEX idx_whatsapp_automations_trigger_type ON public.whatsapp_automations(trigger_type);
