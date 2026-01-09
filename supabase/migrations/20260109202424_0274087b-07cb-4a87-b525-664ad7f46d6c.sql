-- 1. Criar função para sincronizar profiles -> usuarios
CREATE OR REPLACE FUNCTION public.sync_profiles_to_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_id IS NOT NULL THEN
    UPDATE public.usuarios 
    SET clinica_id = NEW.clinic_id 
    WHERE id = NEW.id 
    AND (clinica_id IS DISTINCT FROM NEW.clinic_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Criar função para sincronizar usuarios -> profiles
CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinica_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET clinic_id = NEW.clinica_id 
    WHERE id = NEW.id 
    AND (clinic_id IS DISTINCT FROM NEW.clinica_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Remover função antiga se existir
DROP FUNCTION IF EXISTS public.sync_clinic_ids() CASCADE;

-- 4. Criar triggers de sincronização
DROP TRIGGER IF EXISTS sync_profiles_to_usuarios ON public.profiles;
CREATE TRIGGER sync_profiles_to_usuarios
AFTER INSERT OR UPDATE OF clinic_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profiles_to_usuarios();

DROP TRIGGER IF EXISTS sync_usuarios_to_profiles ON public.usuarios;
CREATE TRIGGER sync_usuarios_to_profiles
AFTER INSERT OR UPDATE OF clinica_id ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.sync_usuarios_to_profiles();

-- 5. Sincronizar dados existentes: usuarios.clinica_id -> profiles.clinic_id
UPDATE public.profiles p
SET clinic_id = u.clinica_id
FROM public.usuarios u
WHERE p.id = u.id
AND p.clinic_id IS DISTINCT FROM u.clinica_id
AND u.clinica_id IS NOT NULL;