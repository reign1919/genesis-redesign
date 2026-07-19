begin;

create extension if not exists pgcrypto with schema extensions;

-- The archive intentionally excludes every credential field. Its retention
-- duration is an organizational decision and must be set outside this schema.
create table if not exists public.registration_archive (
  id bigint generated always as identity primary key,
  legacy_registration_id text,
  school_name text,
  teacher_whatsapp text,
  legacy_status text,
  legacy_school_code text,
  legacy_created_at timestamptz,
  legacy_updated_at timestamptz,
  archived_at timestamptz not null default now()
);

comment on table public.registration_archive is
  'Minimal admin-only archive of invalidated legacy registrations. Plaintext passwords are never retained.';

-- Archive the known legacy shape without ever selecting the password column.
-- A table with unexpected required fields aborts the whole transaction.
do $legacy_migration$
declare
  required_column_name text;
  legacy_id_expression text;
  legacy_status_expression text;
  legacy_code_expression text;
  legacy_created_expression text;
  legacy_updated_expression text;
begin
  if to_regclass('public.registrations') is null then
    return;
  end if;

  foreach required_column_name in array array['school_name', 'teacher_whatsapp'] loop
    if not exists (
      select 1
      from information_schema.columns as legacy_column
      where legacy_column.table_schema = 'public'
        and legacy_column.table_name = 'registrations'
        and legacy_column.column_name = required_column_name
    ) then
      raise exception 'Unsafe legacy registrations shape: required column % is missing', required_column_name;
    end if;
  end loop;

  legacy_id_expression := case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and columns.column_name = 'id'
  ) then 'legacy.id::text' else 'null::text' end;

  legacy_status_expression := case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and columns.column_name = 'status'
  ) then 'legacy.status::text' else 'null::text' end;

  legacy_code_expression := case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and columns.column_name = 'school_code'
  ) then 'legacy.school_code::text' else 'null::text' end;

  legacy_created_expression := case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and columns.column_name = 'created_at'
  ) then 'legacy.created_at::timestamptz' else 'null::timestamptz' end;

  legacy_updated_expression := case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and columns.column_name = 'updated_at'
  ) then 'legacy.updated_at::timestamptz' else 'null::timestamptz' end;

  execute format(
    'insert into public.registration_archive
      (legacy_registration_id, school_name, teacher_whatsapp, legacy_status,
       legacy_school_code, legacy_created_at, legacy_updated_at)
     select %s, legacy.school_name::text, legacy.teacher_whatsapp::text, %s,
            %s, %s, %s
     from public.registrations as legacy',
    legacy_id_expression,
    legacy_status_expression,
    legacy_code_expression,
    legacy_created_expression,
    legacy_updated_expression
  );

  -- No CASCADE: unknown live dependencies make the migration fail safely.
  drop table public.registrations;
end
$legacy_migration$;

-- Every Auth user receives a non-admin profile. Existing admin flags are kept.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $profiles_shape$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    raise exception 'Unsafe profiles shape: public.profiles.id must be uuid';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'is_admin'
      and data_type = 'boolean'
  ) then
    raise exception 'Unsafe profiles shape: public.profiles.is_admin must be boolean';
  end if;
end
$profiles_shape$;

alter table public.profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles set is_admin = false where is_admin is null;
alter table public.profiles alter column id set not null;
alter table public.profiles alter column is_admin set default false;
alter table public.profiles alter column is_admin set not null;

-- This is intentionally explicit even when an existing primary key already
-- covers id. It makes profile upserts and Auth ownership unambiguous, and a
-- duplicate legacy id aborts the transaction instead of being merged. Use a
-- declarative constraint so schema verifiers and downstream tooling can
-- distinguish the ownership guarantee from an implementation-only index.
do $profiles_unique$
begin
  if not exists (
    select 1
    from pg_constraint as profile_constraint
    join pg_attribute as profile_column
      on profile_column.attrelid = profile_constraint.conrelid
      and profile_column.attname = 'id'
    where profile_constraint.conrelid = 'public.profiles'::regclass
      and profile_constraint.contype = 'u'
      and profile_constraint.conkey = array[profile_column.attnum]::smallint[]
  ) then
    alter table public.profiles
      add constraint profiles_id_unique unique (id);
  end if;
end
$profiles_unique$;

do $profiles_fk$
begin
  if exists (
    select 1
    from public.profiles as profile
    left join auth.users as auth_user on auth_user.id = profile.id
    where auth_user.id is null
  ) then
    raise exception 'Unsafe profiles data: orphaned profile rows must be reviewed before migration';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_auth_user_fk
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end
$profiles_fk$;

create sequence public.school_code_sequence
  as bigint
  minvalue 1
  maxvalue 999999
  no cycle;

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  school_name text not null,
  teacher_whatsapp text not null,
  school_code text unique,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_email_normalized check (
    email = lower(btrim(email))
    and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  constraint registrations_school_name_valid check (
    char_length(school_name) between 2 and 120
    and school_name = btrim(regexp_replace(school_name, '[[:space:]]+', ' ', 'g'))
  ),
  constraint registrations_phone_valid check (
    teacher_whatsapp ~ '^[+][1-9][0-9]{7,14}$'
  ),
  constraint registrations_status_valid check (
    status in ('pending', 'approved', 'rejected')
  ),
  constraint registrations_school_code_valid check (
    school_code is null or school_code ~ '^GEN-[0-9]{6}$'
  ),
  constraint registrations_code_matches_status check (
    (status = 'approved' and school_code is not null)
    or (status in ('pending', 'rejected') and school_code is null)
  )
);

comment on column public.registrations.school_code is
  'Non-secret display identifier generated by the database on approval. It is never an authentication credential.';

create index registrations_status_created_idx
  on public.registrations (status, created_at desc);

create table public.registration_rate_limits (
  scope text not null check (scope in ('user', 'ip')),
  scope_key_hash text not null check (scope_key_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (scope, scope_key_hash, window_start)
);

create index registration_rate_limits_expiry_idx
  on public.registration_rate_limits (window_start);

comment on table public.registration_rate_limits is
  'Security-control state. Identifiers and IPs are stored only as SHA-256 hashes.';

create table public.captcha_redemptions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

create index captcha_redemptions_expiry_idx
  on public.captcha_redemptions (redeemed_at);

comment on table public.captcha_redemptions is
  'One-time CAPTCHA redemption hashes. Raw CAPTCHA tokens are never stored.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at := now();
  return new;
end
$function$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create or replace function public.enforce_registration_state()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pending' or new.school_code is not null then
      raise exception using errcode = '23514', message = 'new registrations must be pending without a school code';
    end if;
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.email is distinct from old.email
    or new.school_name is distinct from old.school_name
    or new.teacher_whatsapp is distinct from old.teacher_whatsapp then
    raise exception using errcode = '23514', message = 'registration identity and contact fields are immutable';
  end if;

  if new.status is distinct from old.status then
    if old.status <> 'pending' or new.status not in ('approved', 'rejected') then
      raise exception using errcode = '23514', message = 'invalid registration status transition';
    end if;

    if new.status = 'approved' then
      new.school_code := format(
        'GEN-%s',
        lpad(nextval('public.school_code_sequence')::text, 6, '0')
      );
    else
      new.school_code := null;
    end if;
  elsif new.school_code is distinct from old.school_code then
    raise exception using errcode = '23514', message = 'school codes are database managed';
  end if;

  return new;
end
$function$;

revoke all on function public.enforce_registration_state() from public, anon, authenticated;

create trigger registrations_enforce_state
before insert or update on public.registrations
for each row execute function public.enforce_registration_state();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end
$function$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists create_profile_for_auth_user on auth.users;
create trigger create_profile_for_auth_user
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (id, is_admin)
select auth_user.id, false
from auth.users as auth_user
on conflict (id) do nothing;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_admin is true
  );
$function$;

revoke all on function public.current_user_is_admin() from public, anon, authenticated;
grant execute on function public.current_user_is_admin() to authenticated;

create or replace function public.consume_registration_attempt(
  p_user_hash text,
  p_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_window timestamptz := date_trunc('hour', now());
  new_attempt_count integer;
begin
  if p_user_hash !~ '^[a-f0-9]{64}$' or p_ip_hash !~ '^[a-f0-9]{64}$' then
    return 'invalid_hash';
  end if;

  delete from public.registration_rate_limits
  where window_start < current_window - interval '1 hour';

  insert into public.registration_rate_limits (scope, scope_key_hash, window_start, attempts)
  values ('user', p_user_hash, current_window, 1)
  on conflict (scope, scope_key_hash, window_start) do update
    set attempts = public.registration_rate_limits.attempts + 1
    where public.registration_rate_limits.attempts < 5
  returning attempts into new_attempt_count;

  if new_attempt_count is null then
    return 'rate_limit_user';
  end if;

  new_attempt_count := null;
  insert into public.registration_rate_limits (scope, scope_key_hash, window_start, attempts)
  values ('ip', p_ip_hash, current_window, 1)
  on conflict (scope, scope_key_hash, window_start) do update
    set attempts = public.registration_rate_limits.attempts + 1
    where public.registration_rate_limits.attempts < 20
  returning attempts into new_attempt_count;

  if new_attempt_count is null then
    return 'rate_limit_ip';
  end if;

  return 'ok';
end
$function$;

revoke all on function public.consume_registration_attempt(text, text) from public, anon, authenticated;
grant execute on function public.consume_registration_attempt(text, text) to service_role;

create or replace function public.create_registration(
  p_user_id uuid,
  p_email text,
  p_school_name text,
  p_teacher_whatsapp text,
  p_captcha_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_captcha_hash !~ '^[a-f0-9]{64}$' then
    return 'invalid_captcha_hash';
  end if;

  if not exists (
    select 1
    from auth.users
    where id = p_user_id
      and lower(email) = p_email
      and email_confirmed_at is not null
  ) then
    return 'invalid_identity';
  end if;

  delete from public.captcha_redemptions
  where redeemed_at < now() - interval '1 hour';

  begin
    insert into public.captcha_redemptions (token_hash, user_id)
    values (p_captcha_hash, p_user_id);

    insert into public.registrations (
      user_id,
      email,
      school_name,
      teacher_whatsapp
    ) values (
      p_user_id,
      p_email,
      p_school_name,
      p_teacher_whatsapp
    );

    return 'created';
  exception
    when unique_violation then
      if exists (
        select 1 from public.registrations where user_id = p_user_id
      ) then
        return 'duplicate_registration';
      end if;
      return 'captcha_reused';
  end;
end
$function$;

revoke all on function public.create_registration(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_registration(uuid, text, text, text, text)
  to service_role;

-- Remove every legacy policy before adding the reviewed non-recursive set.
do $drop_policies$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'registrations',
        'profiles',
        'registration_archive',
        'registration_rate_limits',
        'captcha_redemptions'
      )
  loop
    execute format(
      'drop policy %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$drop_policies$;

alter table public.registrations enable row level security;
alter table public.registrations force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.registration_archive enable row level security;
alter table public.registration_archive force row level security;
alter table public.registration_rate_limits enable row level security;
alter table public.registration_rate_limits force row level security;
alter table public.captcha_redemptions enable row level security;
alter table public.captcha_redemptions force row level security;

revoke all privileges on table public.registrations from public, anon, authenticated;
revoke all privileges on table public.profiles from public, anon, authenticated;
revoke all privileges on table public.registration_archive from public, anon, authenticated;
revoke all privileges on table public.registration_rate_limits from public, anon, authenticated;
revoke all privileges on table public.captcha_redemptions from public, anon, authenticated;
revoke all privileges on sequence public.registration_archive_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.school_code_sequence from public, anon, authenticated;

grant select on table public.registrations to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.registration_archive to authenticated;

grant all privileges on table public.registrations to service_role;
grant all privileges on table public.profiles to service_role;
grant all privileges on table public.registration_archive to service_role;
grant all privileges on table public.registration_rate_limits to service_role;
grant all privileges on table public.captcha_redemptions to service_role;
grant usage, select on sequence public.registration_archive_id_seq to service_role;
grant usage, select on sequence public.school_code_sequence to service_role;

create policy registrations_select_own
on public.registrations
for select
to authenticated
using (user_id = (select auth.uid()));

create policy registrations_select_admin
on public.registrations
for select
to authenticated
using ((select public.current_user_is_admin()));

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_select_admin
on public.profiles
for select
to authenticated
using ((select public.current_user_is_admin()));

create policy registration_archive_select_admin
on public.registration_archive
for select
to authenticated
using ((select public.current_user_is_admin()));

commit;
