-- Remove unused security infrastructure to eliminate confusion and clean up codebase
-- This keeps only the perfil_usuario system that is actively used

-- 1. Drop the unused has_role() overload that uses app_role
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- 2. Drop the unused app_role enum entirely
DROP TYPE IF EXISTS public.app_role CASCADE;

-- The perfil_usuario enum and has_role(_user_id uuid, _role perfil_usuario) remain active
-- All RLS policies continue using the perfil_usuario system without any changes