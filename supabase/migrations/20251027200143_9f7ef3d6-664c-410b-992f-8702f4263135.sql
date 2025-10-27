-- Recriar a função de log para aceitar inserts sem auth
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role)
    VALUES (NEW.user_id, COALESCE(auth.uid(), NEW.user_id), OLD.role, NEW.role);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role)
    VALUES (NEW.user_id, COALESCE(auth.uid(), NEW.user_id), NULL, NEW.role);
  END IF;
  RETURN NEW;
END;
$function$;

-- Inserir roles que faltam
INSERT INTO user_roles (user_id, role)
SELECT id, perfil::perfil_usuario
FROM usuarios
WHERE perfil = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;