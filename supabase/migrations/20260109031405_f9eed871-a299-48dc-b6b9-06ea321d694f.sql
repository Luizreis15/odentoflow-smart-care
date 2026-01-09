-- Atualizar função get_user_clinic_id para buscar clinic_id de ambas tabelas
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT clinica_id FROM public.usuarios WHERE id = _user_id LIMIT 1),
    (SELECT clinic_id FROM public.profiles WHERE id = _user_id LIMIT 1)
  );
$function$;