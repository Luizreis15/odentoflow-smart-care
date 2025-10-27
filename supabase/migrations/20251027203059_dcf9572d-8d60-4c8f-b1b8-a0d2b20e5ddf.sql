-- Criar tabela para configuração de agenda dos profissionais
CREATE TABLE public.profissional_agenda_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 1=segunda, ..., 6=sábado
  ativo boolean NOT NULL DEFAULT true,
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  almoco_inicio time,
  almoco_fim time,
  duracao_consulta_minutos integer NOT NULL DEFAULT 30 CHECK (duracao_consulta_minutos > 0 AND duracao_consulta_minutos % 5 = 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(profissional_id, dia_semana),
  CONSTRAINT valid_horarios CHECK (hora_inicio < hora_fim),
  CONSTRAINT valid_almoco CHECK (
    (almoco_inicio IS NULL AND almoco_fim IS NULL) OR 
    (almoco_inicio IS NOT NULL AND almoco_fim IS NOT NULL AND almoco_inicio < almoco_fim)
  )
);

-- Habilitar RLS
ALTER TABLE public.profissional_agenda_config ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver configurações de agenda dos profissionais da sua clínica
CREATE POLICY "Users can view agenda config from their clinic"
ON public.profissional_agenda_config
FOR SELECT
USING (
  profissional_id IN (
    SELECT p.id 
    FROM profissionais p
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  )
);

-- Policy: Admins podem inserir configurações de agenda
CREATE POLICY "Admins can insert agenda config"
ON public.profissional_agenda_config
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::perfil_usuario) AND
  profissional_id IN (
    SELECT p.id 
    FROM profissionais p
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  )
);

-- Policy: Admins podem atualizar configurações de agenda
CREATE POLICY "Admins can update agenda config"
ON public.profissional_agenda_config
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::perfil_usuario) AND
  profissional_id IN (
    SELECT p.id 
    FROM profissionais p
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  )
);

-- Policy: Admins podem deletar configurações de agenda
CREATE POLICY "Admins can delete agenda config"
ON public.profissional_agenda_config
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::perfil_usuario) AND
  profissional_id IN (
    SELECT p.id 
    FROM profissionais p
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  )
);

-- Criar trigger para updated_at
CREATE TRIGGER update_profissional_agenda_config_updated_at
BEFORE UPDATE ON public.profissional_agenda_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índice para otimizar consultas
CREATE INDEX idx_profissional_agenda_config_profissional_id 
ON public.profissional_agenda_config(profissional_id);

-- Criar tabela de auditoria para mudanças na agenda
CREATE TABLE public.profissional_agenda_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL,
  action text NOT NULL,
  changes jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.profissional_agenda_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem ver logs de auditoria
CREATE POLICY "Admins can view agenda audit logs"
ON public.profissional_agenda_audit
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::perfil_usuario) AND
  profissional_id IN (
    SELECT p.id 
    FROM profissionais p
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  )
);