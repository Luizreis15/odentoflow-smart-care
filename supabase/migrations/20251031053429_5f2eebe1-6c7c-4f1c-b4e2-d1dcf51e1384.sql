-- Função para tornar o owner da clínica automaticamente admin
CREATE OR REPLACE FUNCTION public.set_clinic_owner_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se está criando uma nova clínica e há um owner_user_id
  IF TG_OP = 'INSERT' AND NEW.owner_user_id IS NOT NULL THEN
    -- Insere ou atualiza o registro na tabela usuarios para tornar o owner admin
    INSERT INTO public.usuarios (id, clinica_id, nome, email, perfil)
    SELECT 
      NEW.owner_user_id,
      NEW.id,
      p.full_name,
      p.email,
      'admin'::perfil_usuario
    FROM public.profiles p
    WHERE p.id = NEW.owner_user_id
    ON CONFLICT (id) 
    DO UPDATE SET 
      perfil = 'admin'::perfil_usuario,
      clinica_id = NEW.id,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger que executa após inserir uma clínica
DROP TRIGGER IF EXISTS trigger_set_clinic_owner_as_admin ON public.clinicas;
CREATE TRIGGER trigger_set_clinic_owner_as_admin
  AFTER INSERT ON public.clinicas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_clinic_owner_as_admin();

-- Atualiza o owner da clínica atual do Pedro para admin
UPDATE public.usuarios 
SET perfil = 'admin'::perfil_usuario
WHERE id = 'd402d9a9-0975-47ee-9733-f2e085a1c05c'
AND clinica_id IN (
  SELECT id FROM public.clinicas 
  WHERE owner_user_id = 'd402d9a9-0975-47ee-9733-f2e085a1c05c'
);

COMMENT ON FUNCTION public.set_clinic_owner_as_admin() IS 'Automaticamente define o owner de uma clínica como admin ao criar a clínica';
COMMENT ON TRIGGER trigger_set_clinic_owner_as_admin ON public.clinicas IS 'Define o owner como admin ao criar uma clínica';