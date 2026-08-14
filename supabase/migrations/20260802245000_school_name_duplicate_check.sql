-- Migration: 20260802245000_school_name_duplicate_check.sql
-- Description: Block duplicate school registrations by normalized name
-- (100% match on spelling, case-insensitive and whitespace-insensitive) so a
-- school cannot register twice under a different WhatsApp number.

begin;

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
  v_status text;
  v_count int;
  v_next_num int;
  v_code text;
  v_school_id uuid;
begin
  -- Reject duplicate school names: strip all whitespace and lowercase before comparing
  select status into v_status
  from public.schools
  where regexp_replace(lower(name), '\s', '', 'g') = regexp_replace(lower(p_school_name), '\s', '', 'g')
  order by created_at desc
  limit 1;

  if v_status is not null then
    return 'duplicate_' || v_status;
  end if;

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

  insert into public.schools (name, contact_email, contact_phone, school_code, status)
  values (p_school_name, lower(v_code) || '@schools.genesis.invalid', p_teacher_whatsapp, v_code, 'pending')
  returning id into v_school_id;

  return 'created';
end;
$$;

grant execute on function public.create_public_registration(text, text) to anon, authenticated, service_role;

commit;
