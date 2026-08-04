-- Migration: 20260802242000_restrict_school_user_trigger_and_cleanup.sql
-- Description: Restrict handle_new_school_user trigger to valid GEN-#### codes and delete non-school records

begin;

-- 1. Restrict trigger function so it only auto-provisions if school code matches GEN-####
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

    -- Only auto-provision if v_code matches the valid GEN-#### format
    if (v_code ~ '^GEN-[0-9]{4}$') then
      v_name := coalesce(
        (new.raw_user_meta_data->>'school_name'),
        'School ' || v_code
      );

      insert into public.schools (name, contact_email, contact_phone, school_code)
      values (v_name, new.email, '+10000000000', v_code)
      on conflict (school_code) do update set contact_email = excluded.contact_email
      returning id into v_school_id;

      if v_school_id is null then
        select id into v_school_id from public.schools where school_code = v_code;
      end if;

      insert into public.school_users (school_id, auth_user_id, role)
      values (v_school_id, new.id, 'school_user')
      on conflict (school_id, auth_user_id) do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_school on auth.users;
create trigger on_auth_user_created_school
  after insert on auth.users
  for each row execute function public.handle_new_school_user();

-- 2. Clean up any invalid non-GEN-#### entries from schools and credentials
delete from public.school_credentials
where school_id in (
  select id from public.schools where school_code !~ '^GEN-[0-9]{4}$'
);

delete from public.school_users
where school_id in (
  select id from public.schools where school_code !~ '^GEN-[0-9]{4}$'
);

delete from public.schools
where school_code !~ '^GEN-[0-9]{4}$';

commit;
