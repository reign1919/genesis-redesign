-- Migration: 20260802233000_sync_school_users.sql
-- Description: Ensure schools and school_users are synchronized for all school accounts (including GEN-0015)

begin;

-- 1. Add school_code column to public.schools if not exists
alter table public.schools
  add column if not exists school_code text;

-- Add unique constraint on school_code if not already present
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'schools_school_code_unique'
  ) then
    alter table public.schools add constraint schools_school_code_unique unique (school_code);
  end if;
end
$$;

-- 2. Drop legacy school_credentials and create new school_credentials table linked to schools & auth.users
drop table if exists public.school_credentials cascade;
create table public.school_credentials (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references public.schools(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  password_ciphertext text,
  password_iv text,
  password_text text not null default 'Genesis2026!',
  created_at timestamptz not null default now()
);

alter table public.school_credentials enable row level security;
alter table public.school_credentials force row level security;

-- Grant RLS access on school_credentials to authenticated users for their own school
drop policy if exists school_credentials_select_own on public.school_credentials;
create policy school_credentials_select_own on public.school_credentials
  for select to authenticated
  using (auth_user_id = auth.uid() or public.is_admin());

grant select on public.school_credentials to authenticated;

-- 3. Auto-provision schools, school_users, and school_credentials for all existing auth.users (including GEN-0015)
do $$
declare
  u record;
  v_school_id uuid;
  v_code text;
  v_name text;
begin
  for u in
    select id, email, raw_user_meta_data
    from auth.users
    where email like '%@schools.genesis.invalid'
  loop
    v_code := upper(split_part(u.email, '@', 1));
    v_name := coalesce(
      (u.raw_user_meta_data->>'school_name'),
      'School ' || v_code
    );

    -- Upsert school record
    insert into public.schools (name, contact_email, contact_phone, school_code)
    values (v_name, u.email, '+10000000000', v_code)
    on conflict (school_code) do update
    set name = excluded.name
    returning id into v_school_id;

    if v_school_id is null then
      select id into v_school_id from public.schools where school_code = v_code;
    end if;

    -- Upsert school_users junction row
    insert into public.school_users (school_id, auth_user_id, role)
    values (v_school_id, u.id, 'school_user')
    on conflict (school_id, auth_user_id) do nothing;

    -- Upsert school_credentials record
    insert into public.school_credentials (school_id, auth_user_id, password_text)
    values (v_school_id, u.id, 'Genesis2026!')
    on conflict (school_id) do nothing;
  end loop;
end
$$;

-- 4. Trigger function to auto-provision new auth.users
create or replace function public.handle_new_school_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school_id uuid;
  v_code text;
  v_name text;
begin
  if (new.email like '%@schools.genesis.invalid') then
    v_code := upper(split_part(new.email, '@', 1));
    v_name := coalesce(
      (new.raw_user_meta_data->>'school_name'),
      'School ' || v_code
    );

    insert into public.schools (name, contact_email, contact_phone, school_code)
    values (v_name, new.email, '+10000000000', v_code)
    on conflict (school_code) do update set name = excluded.name
    returning id into v_school_id;

    if v_school_id is null then
      select id into v_school_id from public.schools where school_code = v_code;
    end if;

    insert into public.school_users (school_id, auth_user_id, role)
    values (v_school_id, new.id, 'school_user')
    on conflict (school_id, auth_user_id) do nothing;

    insert into public.school_credentials (school_id, auth_user_id, password_text)
    values (v_school_id, new.id, 'Genesis2026!')
    on conflict (school_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_school on auth.users;
create trigger on_auth_user_created_school
  after insert on auth.users
  for each row execute function public.handle_new_school_user();

commit;
