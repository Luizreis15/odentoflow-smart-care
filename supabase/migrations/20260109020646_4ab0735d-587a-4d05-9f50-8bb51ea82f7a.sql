-- Add super admin RLS policies for tables used in dashboard

-- Appointments - Super admins can view all
CREATE POLICY "Super admins can view all appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Payments - Super admins can view all
CREATE POLICY "Super admins can view all payments"
ON public.payments FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Budgets - Super admins can view all
CREATE POLICY "Super admins can view all budgets"
ON public.budgets FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Budget Items - Super admins can view all
CREATE POLICY "Super admins can view all budget_items"
ON public.budget_items FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Profissionais - Super admins can view all
CREATE POLICY "Super admins can view all profissionais"
ON public.profissionais FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Financial transactions - Super admins can view all
CREATE POLICY "Super admins can view all financial_transactions"
ON public.financial_transactions FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Cadeiras - Super admins can view all
CREATE POLICY "Super admins can view all cadeiras"
ON public.cadeiras FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Caixas - Super admins can view all
CREATE POLICY "Super admins can view all caixas"
ON public.caixas FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Categorias procedimentos - Super admins can view all
CREATE POLICY "Super admins can view all categorias_procedimentos"
ON public.categorias_procedimentos FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Patient documents - Super admins can view all
CREATE POLICY "Super admins can view all patient_documents"
ON public.patient_documents FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Patient files - Super admins can view all
CREATE POLICY "Super admins can view all patient_files"
ON public.patient_files FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Anamneses - Super admins can view all
CREATE POLICY "Super admins can view all anamneses"
ON public.anamneses FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Anamnese modelos - Super admins can view all
CREATE POLICY "Super admins can view all anamnese_modelos"
ON public.anamnese_modelos FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));