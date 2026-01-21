-- =====================================================
-- CORREÇÕES DE SEGURANÇA RLS - PRODUÇÃO (v2)
-- =====================================================

-- 1. RESTRINGIR TABELA PROCEDIMENTOS A USUÁRIOS AUTENTICADOS
-- (tabela global sem clinic_id - apenas restringir a authenticated)
DROP POLICY IF EXISTS "Usuarios com clinica podem atualizar procedimentos" ON procedimentos;
DROP POLICY IF EXISTS "Usuarios podem atualizar procedimentos" ON procedimentos;
DROP POLICY IF EXISTS "Procedimentos são visíveis para todos" ON procedimentos;
DROP POLICY IF EXISTS "Allow public read access" ON procedimentos;

-- Apenas usuários autenticados podem ler procedimentos
CREATE POLICY "Authenticated users can read procedimentos"
ON procedimentos FOR SELECT TO authenticated
USING (true);

-- Apenas admins podem modificar procedimentos (através de super_admin ou edge functions)
-- Usuários normais não podem INSERT/UPDATE/DELETE

-- 2. RESTRINGIR TABELA SYSTEM_PLANS A USUÁRIOS AUTENTICADOS
DROP POLICY IF EXISTS "Allow public read access" ON system_plans;
DROP POLICY IF EXISTS "Planos são visíveis publicamente" ON system_plans;

CREATE POLICY "Authenticated users can read system_plans"
ON system_plans FOR SELECT TO authenticated
USING (true);

-- 3. RESTRINGIR TABELA PLANOS A USUÁRIOS AUTENTICADOS  
DROP POLICY IF EXISTS "Allow public read access" ON planos;
DROP POLICY IF EXISTS "Planos são visíveis publicamente" ON planos;

CREATE POLICY "Authenticated users can read planos"
ON planos FOR SELECT TO authenticated
USING (true);

-- 4. CORRIGIR POLICIES CONFLITANTES NA TABELA PROFILES
DROP POLICY IF EXISTS "Block all access to profiles" ON profiles;

-- 5. CORRIGIR POLICIES DA TABELA USUARIOS
DROP POLICY IF EXISTS "Block all access to usuarios" ON usuarios;

-- 6. CONFIGURAR TRIAL DA CLÍNICA DR EDUARDO REIS (14 dias)
UPDATE clinicas 
SET current_period_end = NOW() + INTERVAL '14 days'
WHERE id = '6da1f2ed-3051-4c74-ac5b-2846839e3e4f'
AND current_period_end IS NULL;