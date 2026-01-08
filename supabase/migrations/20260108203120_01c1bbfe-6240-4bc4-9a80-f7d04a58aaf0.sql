-- =====================================================
-- EPIC 0.1: Patient Contacts Table
-- Supports multiple contacts per patient: legal_guardian, financial_responsible, emergency
-- =====================================================

-- Create patient_contacts table
CREATE TABLE public.patient_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('legal_guardian', 'financial_responsible', 'emergency')),
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  relation TEXT, -- ex: mae, pai, conjuge, responsavel
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_patient_contacts_patient_id ON public.patient_contacts(patient_id);
CREATE INDEX idx_patient_contacts_type ON public.patient_contacts(contact_type);

-- Enable RLS
ALTER TABLE public.patient_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access contacts of patients in their clinic
CREATE POLICY "patient_contacts_select_policy" ON public.patient_contacts
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "patient_contacts_insert_policy" ON public.patient_contacts
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "patient_contacts_update_policy" ON public.patient_contacts
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "patient_contacts_delete_policy" ON public.patient_contacts
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_patient_contacts_updated_at
  BEFORE UPDATE ON public.patient_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing responsible data from patients table
INSERT INTO public.patient_contacts (patient_id, contact_type, name, cpf, phone, is_primary)
SELECT 
  id,
  'financial_responsible',
  responsible_name,
  responsible_cpf,
  responsible_phone,
  true
FROM public.patients
WHERE responsible_name IS NOT NULL AND responsible_name != '';