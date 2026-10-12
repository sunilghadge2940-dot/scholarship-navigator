
create policy "staff read staff profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()) and public.is_staff(id));
