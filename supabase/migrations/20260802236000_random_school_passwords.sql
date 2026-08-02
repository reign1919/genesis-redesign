-- Migration: 20260802236000_random_school_passwords.sql
-- Description: Create 16-character secure random password generator in Postgres and update fallback entries

begin;

-- 1. Helper function to generate 16-character mixed password (uppercase, lowercase, numbers, symbols)
create or replace function public.generate_random_password(p_length int default 16)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_upper text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_lower text := 'abcdefghijkmnopqrstuvwxyz';
  v_digits text := '23456789';
  v_symbols text := '!@#$%';
  v_all text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  v_result text := '';
  i int;
begin
  -- Guarantee at least one character from each set
  v_result := v_result || substr(v_upper, floor(random() * length(v_upper) + 1)::int, 1);
  v_result := v_result || substr(v_lower, floor(random() * length(v_lower) + 1)::int, 1);
  v_result := v_result || substr(v_digits, floor(random() * length(v_digits) + 1)::int, 1);
  v_result := v_result || substr(v_symbols, floor(random() * length(v_symbols) + 1)::int, 1);

  for i in 5..p_length loop
    v_result := v_result || substr(v_all, floor(random() * length(v_all) + 1)::int, 1);
  end loop;

  return v_result;
end;
$$;

grant execute on function public.generate_random_password(int) to anon, authenticated, service_role;

-- 2. Update default on public.school_credentials to use generate_random_password(16)
alter table public.school_credentials
  alter column password_text set default public.generate_random_password(16);

-- 3. Replace placeholder 'Genesis2026!' passwords with 16-character secure passwords
update public.school_credentials
set password_text = public.generate_random_password(16)
where password_text = 'Genesis2026!' or password_text is null;

commit;
