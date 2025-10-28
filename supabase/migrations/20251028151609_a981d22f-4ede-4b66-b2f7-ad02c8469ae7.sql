-- Criar bucket de storage para imagens dos pacientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', true);

-- Criar tabela de metadados dos arquivos
CREATE TABLE public.patient_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

-- Policies para patient_files
CREATE POLICY "Users can view files from their clinic"
  ON public.patient_files FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can upload files for patients in their clinic"
  ON public.patient_files FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid()))
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update files from their clinic"
  ON public.patient_files FOR UPDATE
  USING (patient_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Admins can delete files from their clinic"
  ON public.patient_files FOR DELETE
  USING (
    patient_id IN (SELECT id FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid()))
    AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patient_files_updated_at
  BEFORE UPDATE ON public.patient_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies para storage (bucket patient-files)
CREATE POLICY "Users can view files from their clinic patients"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-files'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can upload files for their clinic patients"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-files'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Users can update files from their clinic patients"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'patient-files'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Admins can delete files from their clinic patients"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-files'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM patients WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
    AND has_role(auth.uid(), 'admin'::perfil_usuario)
  );