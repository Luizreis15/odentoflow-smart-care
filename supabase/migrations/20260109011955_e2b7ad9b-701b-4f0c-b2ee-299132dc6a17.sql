-- Inserir role super_admin para o usuario leduardoreis@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('9fa2445b-2561-4fe2-bb3a-507427294f32', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;