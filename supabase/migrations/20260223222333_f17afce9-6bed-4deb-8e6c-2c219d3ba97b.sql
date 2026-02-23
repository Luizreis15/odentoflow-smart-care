-- Allow clinic admins to upload/view/update logo in clinicas/ folder
CREATE POLICY "Clinic admins can upload clinic logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patient-files'
  AND (storage.foldername(name))[1] = 'clinicas'
  AND (storage.foldername(name))[2] = (get_user_clinic_id(auth.uid()))::text
);

CREATE POLICY "Clinic admins can update clinic logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'patient-files'
  AND (storage.foldername(name))[1] = 'clinicas'
  AND (storage.foldername(name))[2] = (get_user_clinic_id(auth.uid()))::text
);

CREATE POLICY "Anyone can view clinic logos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-files'
  AND (storage.foldername(name))[1] = 'clinicas'
);