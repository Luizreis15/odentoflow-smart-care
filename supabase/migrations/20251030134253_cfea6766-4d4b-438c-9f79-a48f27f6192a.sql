-- Adicionar super_admin ao enum de perfis
ALTER TYPE perfil_usuario ADD VALUE IF NOT EXISTS 'super_admin';