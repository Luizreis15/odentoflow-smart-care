
-- Contatos do CRM (sincronizados com pacientes + contatos avulsos)
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinica_id, phone)
);

-- Conversas
CREATE TABLE public.crm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_to UUID,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INT DEFAULT 0,
  kanban_stage TEXT DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mensagens
CREATE TABLE public.crm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.crm_conversations(id) ON DELETE CASCADE NOT NULL,
  whatsapp_message_id TEXT,
  content TEXT,
  is_from_me BOOLEAN DEFAULT false,
  sender_id UUID,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas rápidas
CREATE TABLE public.crm_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT,
  category TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_contacts
CREATE POLICY "Users can view their clinic contacts" ON public.crm_contacts
  FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert their clinic contacts" ON public.crm_contacts
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their clinic contacts" ON public.crm_contacts
  FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can delete their clinic contacts" ON public.crm_contacts
  FOR DELETE TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

-- RLS policies for crm_conversations
CREATE POLICY "Users can view their clinic conversations" ON public.crm_conversations
  FOR SELECT TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert their clinic conversations" ON public.crm_conversations
  FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can update their clinic conversations" ON public.crm_conversations
  FOR UPDATE TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

-- RLS policies for crm_messages
CREATE POLICY "Users can view messages from their clinic conversations" ON public.crm_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.crm_conversations c
    WHERE c.id = conversation_id
    AND c.clinica_id = public.get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Users can insert messages to their clinic conversations" ON public.crm_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crm_conversations c
    WHERE c.id = conversation_id
    AND c.clinica_id = public.get_user_clinic_id(auth.uid())
  ));

-- RLS policies for crm_quick_replies
CREATE POLICY "Users can manage their clinic quick replies" ON public.crm_quick_replies
  FOR ALL TO authenticated
  USING (clinica_id = public.get_user_clinic_id(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_conversations;
