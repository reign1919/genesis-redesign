-- Migration: 20260802238000_fix_trigger_and_preserve_names.sql
-- Description: Fix handle_new_school_user trigger so it never overwrites existing school names

begin;

-- 1. Fix trigger function to preserve existing school name on conflict
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

    -- Preserve existing school name if school_code already exists
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_school on auth.users;
create trigger on_auth_user_created_school
  after insert on auth.users
  for each row execute function public.handle_new_school_user();

-- 2. Ensure all school_credentials rows have a valid 16-character password_text
update public.school_credentials
set password_text = public.generate_random_password(16)
where length(coalesce(password_text, '')) <> 16
   or password_text like '••••%';

commit;
