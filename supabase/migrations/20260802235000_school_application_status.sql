-- Migration: 20260802235000_school_application_status.sql
-- Description: Add status column to public.schools defaulting to 'pending' and update public registration RPC

begin;

-- 1. Add status column to public.schools if not exists
alter table public.schools
  add column if not exists status text not null default 'pending';

-- Update existing schools linked to active school_users to 'approved', others remain 'pending'
update public.schools s
set status = 'approved'
where exists (
  select 1 from public.school_users su where su.school_id = s.id
);

-- Remove test entries created during API validation
delete from public.schools where name like '%St. Xavier%';

-- 2. Update create_public_registration RPC to explicitly insert new registrations with status = 'pending'
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

  insert into public.schools (name, contact_email, contact_phone, school_code, status)
  values (p_school_name, lower(v_code) || '@schools.genesis.invalid', p_teacher_whatsapp, v_code, 'pending')
  returning id into v_school_id;

  return 'created';
end;
$$;

grant execute on function public.create_public_registration(text, text) to anon, authenticated, service_role;

commit;
