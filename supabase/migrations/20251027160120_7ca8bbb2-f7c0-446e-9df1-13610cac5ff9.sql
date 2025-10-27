-- Fix critical security issues: Block public access to sensitive tables
-- This prevents unauthorized access to patient data, employee info, and business data

-- 1. Block public access to profiles table (emails and phone numbers)
CREATE POLICY "Block public access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. Block public access to patients table (medical records and PII)
CREATE POLICY "Block public access to patients"
ON public.patients
FOR SELECT
TO anon
USING (false);

-- 3. Block public access to appointments table (medical scheduling data)
CREATE POLICY "Block public access to appointments"
ON public.appointments
FOR SELECT
TO anon
USING (false);

-- 4. Block public access to usuarios table (employee emails and roles)
CREATE POLICY "Block public access to usuarios"
ON public.usuarios
FOR SELECT
TO anon
USING (false);

-- 5. Block public access to clinics table (business and financial data)
CREATE POLICY "Block public access to clinics"
ON public.clinics
FOR SELECT
TO anon
USING (false);

-- 6. Block public access to professionals table (dentist contact info)
CREATE POLICY "Block public access to professionals"
ON public.professionals
FOR SELECT
TO anon
USING (false);

-- 7. Block public access to reviews table (patient-clinic relationships)
CREATE POLICY "Block public access to reviews"
ON public.reviews
FOR SELECT
TO anon
USING (false);

-- 8. Block public access to payments table (financial transactions)
CREATE POLICY "Block public access to payments"
ON public.payments
FOR SELECT
TO anon
USING (false);

-- 9. Block public access to treatments table (medical treatment data)
CREATE POLICY "Block public access to treatments"
ON public.treatments
FOR SELECT
TO anon
USING (false);

-- 10. Block public access to financial_transactions table (clinic finances)
CREATE POLICY "Block public access to financial_transactions"
ON public.financial_transactions
FOR SELECT
TO anon
USING (false);

-- 11. Block public access to automated_messages table (communication data)
CREATE POLICY "Block public access to automated_messages"
ON public.automated_messages
FOR SELECT
TO anon
USING (false);

-- 12. Block public access to user_roles table (role assignments)
CREATE POLICY "Block public access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);

-- 13. Block public access to role_audit_log table (security audit data)
CREATE POLICY "Block public access to role_audit_log"
ON public.role_audit_log
FOR SELECT
TO anon
USING (false);