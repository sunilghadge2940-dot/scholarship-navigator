
-- ========== ENUMS ==========
create type public.app_role as enum ('super_admin','editor','verifier','publisher');
create type public.scholarship_status as enum ('draft','pending_verification','changes_requested','rejected','approved','published','expired','archived');
create type public.provider_type as enum ('government','private');
create type public.tracking_status as enum ('interested','applied','completed');

-- ========== utility ==========
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ========== COUNTRIES / LEVELS ==========
create table public.countries (
  code text primary key check (code ~ '^[a-z]{2}$'),
  name text not null,
  flag text not null default '',
  currency text not null default '',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.countries to anon, authenticated;
grant all on public.countries to service_role;
grant insert, update, delete on public.countries to authenticated;
alter table public.countries enable row level security;

create table public.education_levels (
  code text primary key check (code ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null default '',
  sort_order int not null default 0
);
grant select on public.education_levels to anon, authenticated;
grant insert, update, delete on public.education_levels to authenticated;
grant all on public.education_levels to service_role;
alter table public.education_levels enable row level security;

insert into public.countries(code,name,flag,currency,sort_order) values
 ('in','India','🇮🇳','INR',1),('us','United States','🇺🇸','USD',2),('ca','Canada','🇨🇦','CAD',3);
insert into public.education_levels(code,name,description,sort_order) values
 ('class-8-10','Class 8–10','Middle and secondary school students',1),
 ('class-11-12','Class 11–12','Higher secondary / high school students',2),
 ('diploma','Diploma','Diploma, polytechnic and vocational students',3),
 ('undergraduate','Undergraduate','Bachelor''s degree and college students',4),
 ('postgraduate','Postgraduate','Master''s, PhD and professional degree students',5);

-- ========== PROFILES & ROLES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text check (char_length(display_name) <= 80),
  country_code text references public.countries(code),
  education_level text references public.education_levels(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  granted_by uuid,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'super_admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "read own roles or super admin" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "super admin grants roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'super_admin'));
create policy "super admin revokes roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'super_admin') and user_id <> auth.uid());

create policy "public read countries" on public.countries for select to anon, authenticated using (true);
create policy "super admin manage countries" on public.countries for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));
create policy "public read levels" on public.education_levels for select to anon, authenticated using (true);
create policy "super admin manage levels" on public.education_levels for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- new user: profile + first user becomes super admin
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, display_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles where role = 'super_admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'super_admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ========== SCHOLARSHIPS ==========
create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name text not null check (char_length(name) between 3 and 200),
  provider text not null check (char_length(provider) between 2 and 200),
  provider_type public.provider_type not null,
  country_code text not null references public.countries(code),
  education_levels text[] not null default '{}',
  category text not null default 'merit',
  summary text not null default '' check (char_length(summary) <= 600),
  benefits text not null default '',
  award_amount text not null default '',
  eligibility text not null default '',
  eligibility_tags text[] not null default '{}',
  required_documents text[] not null default '{}',
  application_steps text[] not null default '{}',
  opens_on date,
  closes_on date,
  official_url text check (official_url is null or official_url ~ '^https?://'),
  source_url text check (source_url is null or source_url ~ '^https?://'),
  contact_email text,
  contact_phone text,
  contact_info text not null default '',
  status public.scholarship_status not null default 'draft',
  entry_method text not null default 'manual' check (entry_method in ('manual','ai','csv','lovable_ai')),
  ai_confidence jsonb not null default '{}'::jsonb,
  ai_flags jsonb not null default '[]'::jsonb,
  reviewer_notes text not null default '',
  sensitive_pending boolean not null default false,
  first_approver_id uuid,
  verified_by uuid,
  verified_at timestamptz,
  published_at timestamptz,
  created_by uuid not null,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index scholarships_status_idx on public.scholarships(status);
create index scholarships_country_idx on public.scholarships(country_code);
create index scholarships_closes_idx on public.scholarships(closes_on);
create index scholarships_levels_idx on public.scholarships using gin(education_levels);
create index scholarships_name_lower_idx on public.scholarships(lower(name));
grant select on public.scholarships to anon;
grant select, insert, update on public.scholarships to authenticated;
grant all on public.scholarships to service_role;
alter table public.scholarships enable row level security;

create policy "public reads published" on public.scholarships for select to anon, authenticated using (status in ('published','expired'));
create policy "staff read all" on public.scholarships for select to authenticated using (public.is_staff(auth.uid()));
create policy "editors create" on public.scholarships for insert to authenticated
  with check ((public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'super_admin')) and created_by = auth.uid() and status in ('draft','pending_verification'));
create policy "staff update" on public.scholarships for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- workflow enforcement
create or replace function public.enforce_scholarship_workflow() returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  sensitive_changed boolean := false;
  content_changed boolean := false;
begin
  if uid is null then return new; end if; -- service / system jobs
  new.updated_by := uid;
  new.created_by := old.created_by;
  new.verified_by := case when new.status = old.status then old.verified_by else new.verified_by end;

  sensitive_changed := (new.award_amount is distinct from old.award_amount) or (new.eligibility is distinct from old.eligibility)
     or (new.opens_on is distinct from old.opens_on) or (new.closes_on is distinct from old.closes_on) or (new.official_url is distinct from old.official_url)
     or (new.benefits is distinct from old.benefits);
  content_changed := sensitive_changed or (new.name, new.provider, new.provider_type, new.country_code, new.education_levels, new.summary, new.required_documents, new.application_steps, new.source_url, new.contact_email, new.contact_phone, new.contact_info, new.category, new.eligibility_tags)
     is distinct from (old.name, old.provider, old.provider_type, old.country_code, old.education_levels, old.summary, old.required_documents, old.application_steps, old.source_url, old.contact_email, old.contact_phone, old.contact_info, old.category, old.eligibility_tags);

  if content_changed then
    if not (public.has_role(uid,'editor') or public.has_role(uid,'super_admin')) then
      raise exception 'Only editors can change scholarship content';
    end if;
    if old.status in ('approved','published','expired','pending_verification') and new.status = old.status then
      -- any content edit to a reviewed listing sends it back for verification
      new.status := 'pending_verification';
    end if;
    if sensitive_changed and old.status <> 'draft' then
      new.sensitive_pending := true;
      new.first_approver_id := null;
    end if;
    new.verified_at := null; new.verified_by := null; new.published_at := null;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'pending_verification' then
      if old.status not in ('draft','changes_requested','rejected','approved','published','expired','pending_verification') then raise exception 'Invalid transition'; end if;
      if not (public.has_role(uid,'editor') or public.has_role(uid,'super_admin')) then raise exception 'Only editors can submit for verification'; end if;
      new.first_approver_id := null;
    elsif new.status in ('approved','changes_requested','rejected') then
      if old.status <> 'pending_verification' then raise exception 'Only pending submissions can be reviewed'; end if;
      if not (public.has_role(uid,'verifier') or public.has_role(uid,'super_admin')) then raise exception 'Only verifiers can review'; end if;
      if uid = old.created_by then raise exception 'You cannot review your own submission'; end if;
      if new.status = 'approved' then
        if old.sensitive_pending and (old.first_approver_id is null or old.first_approver_id = uid) then
          raise exception 'Sensitive changes need a second, independent verifier approval';
        end if;
        new.verified_by := uid; new.verified_at := now(); new.sensitive_pending := false;
      end if;
    elsif new.status = 'published' then
      if old.status <> 'approved' then raise exception 'Only approved scholarships can be published'; end if;
      if not (public.has_role(uid,'publisher') or public.has_role(uid,'super_admin')) then raise exception 'Only publishers can publish'; end if;
      if old.verified_at is null then raise exception 'Scholarship has not been verified'; end if;
      new.published_at := now();
    elsif new.status = 'expired' then
      if old.status <> 'published' then raise exception 'Only published scholarships can expire'; end if;
    elsif new.status = 'archived' then
      if not (public.has_role(uid,'super_admin') or public.has_role(uid,'publisher') or public.has_role(uid,'editor')) then raise exception 'Not allowed to archive'; end if;
    elsif new.status = 'draft' then
      if old.status not in ('archived','changes_requested','rejected') then raise exception 'Invalid transition to draft'; end if;
    end if;
  elsif not content_changed and new.first_approver_id is distinct from old.first_approver_id then
    -- first of two sensitive approvals
    if not (public.has_role(uid,'verifier') or public.has_role(uid,'super_admin')) or uid = old.created_by or new.first_approver_id <> uid or old.status <> 'pending_verification' then
      raise exception 'Invalid first approval';
    end if;
  end if;
  return new;
end $$;
create trigger scholarships_workflow before update on public.scholarships for each row execute function public.enforce_scholarship_workflow();
create trigger scholarships_touch before update on public.scholarships for each row execute function public.touch_updated_at();

create or replace function public.enforce_scholarship_insert() returns trigger language plpgsql set search_path = public as $$
begin
  new.verified_at := null; new.verified_by := null; new.published_at := null; new.first_approver_id := null;
  if new.status not in ('draft','pending_verification') then new.status := 'draft'; end if;
  return new;
end $$;
create trigger scholarships_insert_guard before insert on public.scholarships for each row execute function public.enforce_scholarship_insert();

-- ========== VERIFICATION / REVISIONS / AUDIT ==========
create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  reviewer_id uuid not null,
  decision text not null check (decision in ('submitted','first_approval','approved','changes_requested','rejected','published','archived','expired','resubmitted','note')),
  notes text not null default '' check (char_length(notes) <= 4000),
  source_urls text[] not null default '{}',
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index verification_records_sch_idx on public.verification_records(scholarship_id, created_at desc);
grant select, insert on public.verification_records to authenticated;
grant all on public.verification_records to service_role;
alter table public.verification_records enable row level security;
create policy "staff read verification" on public.verification_records for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff add verification" on public.verification_records for insert to authenticated with check (public.is_staff(auth.uid()) and reviewer_id = auth.uid());

create table public.scholarship_revisions (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  changed_by uuid,
  old_status public.scholarship_status,
  new_status public.scholarship_status,
  changed_fields text[] not null default '{}',
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index revisions_sch_idx on public.scholarship_revisions(scholarship_id, created_at desc);
grant select on public.scholarship_revisions to authenticated;
grant all on public.scholarship_revisions to service_role;
alter table public.scholarship_revisions enable row level security;
create policy "staff read revisions" on public.scholarship_revisions for select to authenticated using (public.is_staff(auth.uid()));

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "super admin reads audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'super_admin'));
create policy "staff write audit" on public.audit_logs for insert to authenticated with check (public.is_staff(auth.uid()) and actor_id = auth.uid());

-- ========== NOTIFICATIONS ==========
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null default 'info',
  title text not null,
  body text not null default '',
  link text,
  dedupe_key text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, dedupe_key)
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- revision + audit + notifications trigger
create or replace function public.log_scholarship_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  fields text[] := '{}';
  k text;
  o jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  n jsonb := to_jsonb(new);
  r record;
begin
  for k in select jsonb_object_keys(n) loop
    if k not in ('updated_at','updated_by') and (o->k) is distinct from (n->k) then fields := fields || k; end if;
  end loop;
  insert into public.scholarship_revisions(scholarship_id, changed_by, old_status, new_status, changed_fields, snapshot)
    values (new.id, auth.uid(), case when tg_op='UPDATE' then old.status end, new.status, fields, n);
  insert into public.audit_logs(actor_id, action, entity, entity_id, details)
    values (auth.uid(), lower(tg_op) || case when tg_op='UPDATE' and old.status is distinct from new.status then ':' || new.status::text else '' end,
            'scholarship', new.id, jsonb_build_object('fields', fields, 'name', new.name));

  if tg_op = 'INSERT' or old.status is distinct from new.status then
    if new.status = 'pending_verification' then
      for r in select distinct user_id from public.user_roles where role in ('verifier','super_admin') and user_id <> new.created_by loop
        insert into public.notifications(user_id, kind, title, body, link, dedupe_key)
        values (r.user_id, 'review', 'Review needed: ' || new.name, 'A scholarship is waiting for verification.', '/admin/scholarships/' || new.id, 'review-' || new.id || '-' || extract(epoch from now())::bigint)
        on conflict do nothing;
      end loop;
    elsif new.status = 'approved' then
      for r in select distinct user_id from public.user_roles where role in ('publisher','super_admin') loop
        insert into public.notifications(user_id, kind, title, body, link) values (r.user_id, 'publish', 'Ready to publish: ' || new.name, 'Verification approved.', '/admin/scholarships/' || new.id);
      end loop;
    elsif new.status in ('changes_requested','rejected') then
      insert into public.notifications(user_id, kind, title, body, link) values (new.created_by, 'review', initcap(replace(new.status::text,'_',' ')) || ': ' || new.name, 'Open the submission to see reviewer notes.', '/admin/scholarships/' || new.id);
    end if;
  end if;
  return new;
end $$;
create trigger scholarships_log after insert or update on public.scholarships for each row execute function public.log_scholarship_change();

-- ========== UPLOADED DOCUMENTS ==========
create table public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid references public.scholarships(id) on delete set null,
  uploaded_by uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null check (mime_type in ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','image/webp','text/csv','text/plain')),
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 10485760),
  purpose text not null default 'supporting' check (purpose in ('supporting','ai_source','csv_import')),
  created_at timestamptz not null default now()
);
create index uploaded_documents_sch_idx on public.uploaded_documents(scholarship_id);
grant select, insert, delete on public.uploaded_documents to authenticated;
grant all on public.uploaded_documents to service_role;
alter table public.uploaded_documents enable row level security;
create policy "staff read docs" on public.uploaded_documents for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff add docs" on public.uploaded_documents for insert to authenticated with check (public.is_staff(auth.uid()) and uploaded_by = auth.uid());
create policy "owner or super admin delete docs" on public.uploaded_documents for delete to authenticated using (uploaded_by = auth.uid() or public.has_role(auth.uid(),'super_admin'));

-- ========== STUDENT: SAVED + TRACKING ==========
create table public.saved_scholarships (
  user_id uuid not null,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, scholarship_id)
);
grant select, insert, delete on public.saved_scholarships to authenticated;
grant all on public.saved_scholarships to service_role;
alter table public.saved_scholarships enable row level security;
create policy "own saved" on public.saved_scholarships for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.application_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  status public.tracking_status not null default 'interested',
  remind boolean not null default true,
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, scholarship_id)
);
create index tracking_user_idx on public.application_tracking(user_id);
grant select, insert, update, delete on public.application_tracking to authenticated;
grant all on public.application_tracking to service_role;
alter table public.application_tracking enable row level security;
create policy "own tracking" on public.application_tracking for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger tracking_touch before update on public.application_tracking for each row execute function public.touch_updated_at();

-- deadline reminders for the signed-in student (called from dashboard)
create or replace function public.generate_my_deadline_reminders() returns int language plpgsql security definer set search_path = public as $$
declare cnt int := 0; r record;
begin
  if auth.uid() is null then return 0; end if;
  for r in
    select s.id, s.name, s.slug, s.closes_on from public.scholarships s
    where s.status = 'published' and s.closes_on between current_date and current_date + 7
      and (exists(select 1 from public.saved_scholarships v where v.user_id = auth.uid() and v.scholarship_id = s.id)
        or exists(select 1 from public.application_tracking t where t.user_id = auth.uid() and t.scholarship_id = s.id and t.remind and t.status <> 'completed'))
  loop
    insert into public.notifications(user_id, kind, title, body, link, dedupe_key)
    values (auth.uid(), 'deadline', 'Deadline soon: ' || r.name, 'Closes on ' || to_char(r.closes_on,'DD Mon YYYY') || '. Confirm details on the official site.', '/scholarships/' || r.slug, 'deadline-' || r.id || '-' || r.closes_on)
    on conflict do nothing;
    get diagnostics cnt = row_count;
  end loop;
  return cnt;
end $$;
grant execute on function public.generate_my_deadline_reminders() to authenticated;

-- staff: mark published listings past deadline as expired + notify staff of approaching deadlines
create or replace function public.run_expiry_check() returns int language plpgsql security definer set search_path = public as $$
declare n int; r record; s record;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Staff only'; end if;
  update public.scholarships set status = 'expired' where status = 'published' and closes_on < current_date;
  get diagnostics n = row_count;
  for s in select id, name, closes_on from public.scholarships where status = 'published' and closes_on between current_date and current_date + 7 loop
    for r in select distinct user_id from public.user_roles loop
      insert into public.notifications(user_id, kind, title, body, link, dedupe_key)
      values (r.user_id, 'deadline', 'Deadline approaching: ' || s.name, 'Closes ' || to_char(s.closes_on,'DD Mon YYYY') || '. Re-check the official source.', '/admin/scholarships/' || s.id, 'staff-deadline-' || s.id || '-' || s.closes_on)
      on conflict do nothing;
    end loop;
  end loop;
  return n;
end $$;
grant execute on function public.run_expiry_check() to authenticated;
