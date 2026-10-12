
create policy "staff read scholarship docs" on storage.objects for select to authenticated using (bucket_id = 'scholarship-docs' and public.is_staff(auth.uid()));
create policy "staff upload scholarship docs" on storage.objects for insert to authenticated with check (bucket_id = 'scholarship-docs' and public.is_staff(auth.uid()) and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner delete scholarship docs" on storage.objects for delete to authenticated using (bucket_id = 'scholarship-docs' and (storage.foldername(name))[1] = auth.uid()::text);
