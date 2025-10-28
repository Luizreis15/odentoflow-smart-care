-- Criar tabela de documentos do paciente
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('contrato', 'termo_consentimento', 'receituario', 'atestado', 'personalizado')),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  signed_at timestamp with time zone,
  signature_hash text,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado', 'assinado')),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Política para visualizar documentos da clínica
CREATE POLICY "Users can view documents from their clinic"
ON public.patient_documents
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.profiles
      WHERE id = auth.uid()
    )
  )
);

-- Política para criar documentos
CREATE POLICY "Users can create documents for their clinic patients"
ON public.patient_documents
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  AND created_by = auth.uid()
);

-- Política para atualizar documentos
CREATE POLICY "Users can update documents from their clinic"
ON public.patient_documents
FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.profiles
      WHERE id = auth.uid()
    )
  )
);

-- Política para deletar documentos (apenas admins)
CREATE POLICY "Admins can delete documents"
ON public.patient_documents
FOR DELETE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id = get_user_clinic_id(auth.uid())
  )
  AND has_role(auth.uid(), 'admin'::perfil_usuario)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patient_documents_updated_at
BEFORE UPDATE ON public.patient_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_patient_documents_patient_id ON public.patient_documents(patient_id);
CREATE INDEX idx_patient_documents_clinic_id ON public.patient_documents(clinic_id);
CREATE INDEX idx_patient_documents_type ON public.patient_documents(document_type);
CREATE INDEX idx_patient_documents_status ON public.patient_documents(status);