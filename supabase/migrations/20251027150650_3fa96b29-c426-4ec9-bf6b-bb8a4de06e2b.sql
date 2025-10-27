-- =====================================================
-- FIX ERROR-LEVEL SECURITY ISSUES
-- =====================================================

-- 1. FIX PATIENTS TABLE - Replace permissive policies with clinic-scoped access
-- Drop dangerous policies that allow cross-clinic access
DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON patients;

-- Create secure clinic-scoped policies for patients
CREATE POLICY "Users can view patients from their clinic"
  ON patients FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert patients to their clinic"
  ON patients FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update patients from their clinic"
  ON patients FOR UPDATE
  USING (clinic_id IN (
    SELECT clinic_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete patients from their clinic"
  ON patients FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinica_id FROM usuarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- 2. FIX APPOINTMENTS TABLE - Replace permissive policies with clinic-scoped access via patients
-- Drop dangerous policies
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- Create secure clinic-scoped policies for appointments
CREATE POLICY "Users can view appointments from their clinic"
  ON appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      INNER JOIN profiles prof ON p.clinic_id = prof.clinic_id
      WHERE prof.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert appointments for their clinic"
  ON appointments FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT p.id FROM patients p
      INNER JOIN profiles prof ON p.clinic_id = prof.clinic_id
      WHERE prof.id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments from their clinic"
  ON appointments FOR UPDATE
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      INNER JOIN profiles prof ON p.clinic_id = prof.clinic_id
      WHERE prof.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete appointments from their clinic"
  ON appointments FOR DELETE
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      INNER JOIN usuarios u ON p.clinic_id = u.clinica_id
      WHERE u.id = auth.uid() AND u.perfil = 'admin'
    )
  );

-- 3. FIX CLINICS TABLE - Allow new clinic creation
CREATE POLICY "Users can create their own clinic"
  ON clinics FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- Optional: Allow owners to delete their own clinic (be careful with this!)
CREATE POLICY "Owners can delete their clinic"
  ON clinics FOR DELETE
  USING (owner_user_id = auth.uid());