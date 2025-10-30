-- Criar função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'::perfil_usuario
  )
$$;

-- Tornar clinica_id nullable em anamnese_modelos para permitir modelos globais
ALTER TABLE public.anamnese_modelos 
ALTER COLUMN clinica_id DROP NOT NULL;

-- Atualizar RLS policies para super admin ter acesso total

-- anamnese_modelos: Super admin pode gerenciar modelos globais
CREATE POLICY "Super admins can manage all models" 
ON public.anamnese_modelos 
FOR ALL
USING (is_super_admin(auth.uid()));

-- anamnese_perguntas: Super admin pode gerenciar todas as perguntas
CREATE POLICY "Super admins can manage all questions" 
ON public.anamnese_perguntas 
FOR ALL
USING (is_super_admin(auth.uid()));

-- clinicas: Super admin pode ver e gerenciar todas as clínicas
CREATE POLICY "Super admins can view all clinics" 
ON public.clinicas 
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all clinics" 
ON public.clinicas 
FOR ALL
USING (is_super_admin(auth.uid()));

-- usuarios: Super admin pode ver e gerenciar todos os usuários
CREATE POLICY "Super admins can view all users" 
ON public.usuarios 
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all users" 
ON public.usuarios 
FOR ALL
USING (is_super_admin(auth.uid()));

-- patients: Super admin pode ver todos os pacientes
CREATE POLICY "Super admins can view all patients" 
ON public.patients 
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Atualizar política de modelos de anamnese para permitir acesso a modelos globais
DROP POLICY IF EXISTS "Users can view models from their clinic" ON public.anamnese_modelos;
CREATE POLICY "Users can view global and clinic models" 
ON public.anamnese_modelos 
FOR SELECT
USING (
  clinica_id IS NULL OR 
  clinica_id = get_user_clinic_id(auth.uid())
);