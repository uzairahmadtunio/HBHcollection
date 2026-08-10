CREATE POLICY "review photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'review-photos');
CREATE POLICY "review photos public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-photos');
CREATE POLICY "review photos admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'review-photos' AND public.is_admin());