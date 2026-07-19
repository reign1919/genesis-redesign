-- Replace test-only magic-link enrollments with admin-issued school credentials.
-- Existing administrators remain in auth.users/profiles; active registrations are reset.

delete from public.registrations;
truncate table public.registration_rate_limits;
truncate table public.captcha_redemptions;

drop function if exists public.create_registration(uuid, text, text, text, text);
drop function if exists public.consume_registration_attempt(text, text);

drop policy if exists registrations_select_own on public.registrations;
drop trigger if exists registrations_enforce_state on public.registrations;

alter table public.registrations
  rename column user_id to auth_user_id;

alter table public.registrations
  alter column auth_user_id drop not null,
  drop column email,
  drop constraint registrations_status_valid,
  drop constraint registrations_school_code_valid,
  drop constraint registrations_code_matches_status;

alter sequence public.school_code_sequence maxvalue 9999 restart with 1;

alter table public.registrations
  add constraint registrations_whatsapp_unique unique (teacher_whatsapp),
  add constraint registrations_status_valid check (
    status in ('pending', 'provisioning', 'approved', 'rejected')
  ),
  add constraint registrations_school_code_valid check (
    school_code is null or school_code ~ '^GEN-[0-9]{4}$'
  ),
  add constraint registrations_credential_state_valid check (
    (status in ('pending', 'rejected') and school_code is null and auth_user_id is null)
    or (status = 'provisioning' and school_code is not null and auth_user_id is null)
    or (status = 'approved' and school_code is not null and auth_user_id is not null)
  );

comment on column public.registrations.school_code is
  'Admin-issued login identifier in GEN-0001 format.';

create table public.school_credentials (
  registration_id uuid primary key references public.registrations(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  password_ciphertext text not null check (char_length(password_ciphertext) between 16 and 1024),
  password_iv text not null check (char_length(password_iv) between 12 and 128),
  created_at timestamptz not null default now()
);

comment on table public.school_credentials is
  'Service-role-only encrypted display copy of school credentials. Auth stores the login hash.';

alter table public.school_credentials enable row level security;
alter table public.school_credentials force row level security;
revoke all privileges on table public.school_credentials from public, anon, authenticated;
grant all privileges on table public.school_credentials to service_role;

create table public.school_credential_provisioning (
  registration_id uuid primary key references public.registrations(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  password_ciphertext text not null,
  password_iv text not null,
  created_at timestamptz not null default now()
);
alter table public.school_credential_provisioning enable row level security;
alter table public.school_credential_provisioning force row level security;
revoke all privileges on table public.school_credential_provisioning from public, anon, authenticated;
grant all privileges on table public.school_credential_provisioning to service_role;

create or replace function public.enforce_registration_state()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pending' or new.school_code is not null or new.auth_user_id is not null then
      raise exception using errcode = '23514', message = 'new registrations must be pending without credentials';
    end if;
    return new;
  end if;

  if new.school_name is distinct from old.school_name
    or new.teacher_whatsapp is distinct from old.teacher_whatsapp then
    raise exception using errcode = '23514', message = 'registration identity and contact fields are immutable';
  end if;

  if old.status = 'pending' and new.status not in ('pending', 'provisioning', 'rejected') then
    raise exception using errcode = '23514', message = 'invalid registration status transition';
  elsif old.status = 'provisioning' and new.status not in ('provisioning', 'pending', 'approved') then
    raise exception using errcode = '23514', message = 'invalid registration status transition';
  elsif old.status in ('approved', 'rejected') and new.status <> old.status then
    raise exception using errcode = '23514', message = 'final registration status cannot change';
  end if;

  return new;
end
$function$;

create trigger registrations_enforce_state
before insert or update on public.registrations
for each row execute function public.enforce_registration_state();

create policy registrations_select_own
on public.registrations
for select
to authenticated
using (auth_user_id = (select auth.uid()));

drop table public.registration_rate_limits;
create table public.registration_rate_limits (
  scope text not null check (scope in ('whatsapp', 'ip')),
  scope_key_hash text not null check (scope_key_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (scope, scope_key_hash, window_start)
);
create index registration_rate_limits_expiry_idx
  on public.registration_rate_limits (window_start);
alter table public.registration_rate_limits enable row level security;
alter table public.registration_rate_limits force row level security;
revoke all privileges on table public.registration_rate_limits from public, anon, authenticated;
grant all privileges on table public.registration_rate_limits to service_role;

drop table public.captcha_redemptions;
create table public.captcha_redemptions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  redeemed_at timestamptz not null default now()
);
create index captcha_redemptions_expiry_idx on public.captcha_redemptions (redeemed_at);
alter table public.captcha_redemptions enable row level security;
alter table public.captcha_redemptions force row level security;
revoke all privileges on table public.captcha_redemptions from public, anon, authenticated;
grant all privileges on table public.captcha_redemptions to service_role;

create or replace function public.consume_public_registration_attempt(
  p_whatsapp_hash text,
  p_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_window timestamptz := date_trunc('hour', now());
  attempt_count integer;
begin
  delete from public.registration_rate_limits where window_start < now() - interval '2 hours';

  insert into public.registration_rate_limits (scope, scope_key_hash, window_start, attempts)
  values ('whatsapp', p_whatsapp_hash, current_window, 1)
  on conflict (scope, scope_key_hash, window_start) do update
    set attempts = public.registration_rate_limits.attempts + 1
    where public.registration_rate_limits.attempts < 5
  returning attempts into attempt_count;
  if attempt_count is null then return 'rate_limit_whatsapp'; end if;

  insert into public.registration_rate_limits (scope, scope_key_hash, window_start, attempts)
  values ('ip', p_ip_hash, current_window, 1)
  on conflict (scope, scope_key_hash, window_start) do update
    set attempts = public.registration_rate_limits.attempts + 1
    where public.registration_rate_limits.attempts < 20
  returning attempts into attempt_count;
  if attempt_count is null then return 'rate_limit_ip'; end if;
  return 'ok';
end
$function$;
revoke all on function public.consume_public_registration_attempt(text, text) from public, anon, authenticated;
grant execute on function public.consume_public_registration_attempt(text, text) to service_role;

create or replace function public.create_public_registration(
  p_school_name text,
  p_teacher_whatsapp text,
  p_captcha_hash text,
  p_subject_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  existing_status text;
begin
  delete from public.captcha_redemptions where redeemed_at < now() - interval '1 hour';
  begin
    insert into public.captcha_redemptions (token_hash, subject_hash)
    values (p_captcha_hash, p_subject_hash);
  exception when unique_violation then
    return 'captcha_reused';
  end;

  select status into existing_status
  from public.registrations
  where teacher_whatsapp = p_teacher_whatsapp;
  if existing_status is not null then return 'duplicate_' || existing_status; end if;

  begin
    insert into public.registrations (school_name, teacher_whatsapp)
    values (p_school_name, p_teacher_whatsapp);
    return 'created';
  exception when unique_violation then
    select status into existing_status
    from public.registrations
    where teacher_whatsapp = p_teacher_whatsapp;
    return 'duplicate_' || coalesce(existing_status, 'pending');
  end;
end
$function$;
revoke all on function public.create_public_registration(text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_public_registration(text, text, text, text) to service_role;

create or replace function public.reserve_registration_approval(p_registration_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_status text;
  current_code text;
begin
  select status, school_code into current_status, current_code
  from public.registrations where id = p_registration_id for update;
  if current_status is null then return 'not_found'; end if;
  if current_status = 'provisioning' then return current_code; end if;
  if current_status <> 'pending' then return 'invalid_transition'; end if;

  current_code := format('GEN-%s', lpad(nextval('public.school_code_sequence')::text, 4, '0'));
  update public.registrations
  set status = 'provisioning', school_code = current_code
  where id = p_registration_id;
  return current_code;
exception when sequence_generator_limit_exceeded then
  return 'code_exhausted';
end
$function$;
revoke all on function public.reserve_registration_approval(uuid) from public, anon, authenticated;
grant execute on function public.reserve_registration_approval(uuid) to service_role;

create or replace function public.finalize_registration_approval(
  p_registration_id uuid,
  p_auth_user_id uuid,
  p_password_ciphertext text,
  p_password_iv text
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.school_credentials
    (registration_id, auth_user_id, password_ciphertext, password_iv)
  values
    (p_registration_id, p_auth_user_id, p_password_ciphertext, p_password_iv)
  on conflict (registration_id) do nothing;

  delete from public.school_credential_provisioning
  where registration_id = p_registration_id;

  update public.registrations
  set auth_user_id = p_auth_user_id, status = 'approved'
  where id = p_registration_id and status = 'provisioning';
  if not found then return 'invalid_transition'; end if;
  return 'approved';
end
$function$;
revoke all on function public.finalize_registration_approval(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.finalize_registration_approval(uuid, uuid, text, text) to service_role;

create or replace function public.reset_registration_approval(p_registration_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
begin
  delete from public.school_credential_provisioning where registration_id = p_registration_id;
  update public.registrations
  set status = 'pending', school_code = null, auth_user_id = null
  where id = p_registration_id and status = 'provisioning';
  return case when found then 'reset' else 'invalid_transition' end;
end
$function$;
revoke all on function public.reset_registration_approval(uuid) from public, anon, authenticated;
grant execute on function public.reset_registration_approval(uuid) to service_role;
