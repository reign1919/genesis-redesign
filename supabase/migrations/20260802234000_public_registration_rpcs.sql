-- Migration: 20260802234000_public_registration_rpcs.sql
-- Description: Create public registration RPCs for submit-registration Edge Function

begin;

-- 1. Quota RPC
create or replace function public.consume_public_registration_attempt(
  p_whatsapp_hash text,
  p_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  return 'ok';
end;
$$;

grant execute on function public.consume_public_registration_attempt(text, text) to anon, authenticated, service_role;

-- 2. Public Registration Creation RPC
create or replace function public.create_public_registration(
  p_school_name text,
  p_teacher_whatsapp text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
  v_next_num int;
  v_code text;
  v_school_id uuid;
begin
  -- Check duplicate phone number
  select count(*) into v_count
  from public.schools
  where contact_phone = p_teacher_whatsapp;

  if v_count > 0 then
    return 'duplicate_pending';
  end if;

  -- Generate next GEN-XXXX code
  select coalesce(max(cast(substring(school_code from 5) as int)), 10) + 1
  into v_next_num
  from public.schools
  where school_code ~ '^GEN-[0-9]{4}$';

  if v_next_num is null then
    v_next_num := 11;
  end if;

  v_code := 'GEN-' || lpad(v_next_num::text, 4, '0');

  insert into public.schools (name, contact_email, contact_phone, school_code)
  values (p_school_name, lower(v_code) || '@schools.genesis.invalid', p_teacher_whatsapp, v_code)
  returning id into v_school_id;

  return 'created';
end;
$$;

grant execute on function public.create_public_registration(text, text) to anon, authenticated, service_role;

commit;
