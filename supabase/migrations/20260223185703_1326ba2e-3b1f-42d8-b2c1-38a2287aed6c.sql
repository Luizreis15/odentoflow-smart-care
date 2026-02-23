ALTER TABLE public.ortho_appointments
  DROP CONSTRAINT ortho_appointments_appointment_id_fkey,
  ADD CONSTRAINT ortho_appointments_appointment_id_fkey
    FOREIGN KEY (appointment_id)
    REFERENCES public.appointments(id)
    ON DELETE CASCADE;