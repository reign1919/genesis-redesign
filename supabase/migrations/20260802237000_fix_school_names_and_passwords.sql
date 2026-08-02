-- Migration: 20260802237000_fix_school_names_and_passwords.sql
-- Description: Fix school institution names and ensure all school credentials have 16-character passwords

begin;

-- 1. Ensure password_text is generated with 16 characters for all rows in school_credentials
update public.school_credentials
set password_text = public.generate_random_password(16)
where length(coalesce(password_text, '')) <> 16
   or password_text = 'Genesis2026!'
   or password_text like '••••%';

-- 2. Update institution names in public.schools
update public.schools set name = 'Genesis Institution' where school_code = 'GEN-0001' or name = 'School GEN-0001';
update public.schools set name = 'Heritage School' where school_code = 'GEN-0002' or name = 'School GEN-0002';
update public.schools set name = 'La Martiniere for Boys' where school_code = 'GEN-0003' or name = 'School GEN-0003';
update public.schools set name = 'La Martiniere for Girls' where school_code = 'GEN-0004' or name = 'School GEN-0004';
update public.schools set name = 'St. James'' School' where school_code = 'GEN-0005' or name = 'School GEN-0005';
update public.schools set name = 'Don Bosco School' where school_code = 'GEN-0006' or name = 'School GEN-0006';
update public.schools set name = 'Modern High School' where school_code = 'GEN-0007' or name = 'School GEN-0007';
update public.schools set name = 'South Point High School' where school_code = 'GEN-0008' or name = 'School GEN-0008';
update public.schools set name = 'Calcutta Boys'' School' where school_code = 'GEN-0009' or name = 'School GEN-0009';
update public.schools set name = 'Calcutta Girls'' High School' where school_code = 'GEN-0010' or name = 'School GEN-0010';
update public.schools set name = 'St. Xavier''s Collegiate School' where school_code = 'GEN-0015' or name = 'School GEN-0015';

commit;
