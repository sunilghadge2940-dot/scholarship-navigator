
-- No automatic role grants on signup. Roles are only granted by an existing super admin or by the project owner via controlled backend initialization.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, display_name) values (new.id, new.email, left(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 80));
  return new;
end $$;

-- prevent profile email tampering
create or replace function public.protect_profile_email() returns trigger language plpgsql set search_path = public as $$
begin new.email := old.email; new.id := old.id; return new; end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile_email();

-- audit role changes
create or replace function public.log_role_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity, entity_id, details)
  values (auth.uid(), case when tg_op='INSERT' then 'role:grant' else 'role:revoke' end, 'user_role',
          coalesce(new.user_id, old.user_id), jsonb_build_object('role', coalesce(new.role, old.role)));
  return coalesce(new, old);
end $$;
create trigger user_roles_audit after insert or delete on public.user_roles for each row execute function public.log_role_change();

-- system expiry job (scheduled, no user context). Rows are never deleted: history preserved.
create or replace function public.system_deadline_check() returns int language plpgsql security definer set search_path = public as $$
declare n int; r record; s record;
begin
  update public.scholarships set status = 'expired' where status = 'published' and closes_on < current_date;
  get diagnostics n = row_count;
  insert into public.audit_logs(actor_id, action, entity, details) values (null, 'system:deadline_check', 'scholarship', jsonb_build_object('expired', n));
  for s in select id, name, closes_on from public.scholarships where status = 'published' and closes_on between current_date and current_date + 7 loop
    for r in select distinct user_id from public.user_roles loop
      insert into public.notifications(user_id, kind, title, body, link, dedupe_key)
      values (r.user_id, 'deadline', 'Deadline approaching: ' || s.name, 'Closes ' || to_char(s.closes_on,'DD Mon YYYY') || '. Re-check the official source.', '/admin/scholarships/' || s.id, 'staff-deadline-' || s.id || '-' || s.closes_on)
      on conflict do nothing;
    end loop;
  end loop;
  -- pending reviews older than 3 days
  for s in select id, name from public.scholarships where status = 'pending_verification' and updated_at < now() - interval '3 days' loop
    for r in select distinct user_id from public.user_roles where role in ('verifier','super_admin') loop
      insert into public.notifications(user_id, kind, title, body, link, dedupe_key)
      values (r.user_id, 'review', 'Review overdue: ' || s.name, 'Waiting for verification for more than 3 days.', '/admin/scholarships/' || s.id, 'overdue-' || s.id || '-' || current_date)
      on conflict do nothing;
    end loop;
  end loop;
  return n;
end $$;
revoke execute on function public.system_deadline_check() from public, anon, authenticated;

create extension if not exists pg_cron;
