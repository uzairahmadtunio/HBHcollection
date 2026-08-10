CREATE POLICY "anyone upload payment proof" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "admin read payment proof" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND public.is_admin());

CREATE POLICY "admin delete payment proof" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'payment-proofs' AND public.is_admin());