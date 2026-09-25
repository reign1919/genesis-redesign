-- Migration: 20260925000002_reopen_birla_mukundapur_close_apeejay.sql
-- Description: Closes APEEJAY SCHOOL PARK STREET (GEN-0039) and reopens BIRLA HIGH SCHOOL - MUKUNDAPUR (GEN-0036).
-- Indus Valley World School (GEN-0023) remains open.

begin;

-- 1. Close APEEJAY SCHOOL PARK STREET (GEN-0039)
update public.schools
set participant_editing_open = false
where school_code = 'GEN-0039'
   or name ilike 'APEEJAY SCHOOL PARK STREET%';

update public.registrations
set status = 'submitted'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0039'
     or name ilike 'APEEJAY SCHOOL PARK STREET%'
);

update public.school_event_selections
set status = 'submitted'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0039'
     or name ilike 'APEEJAY SCHOOL PARK STREET%'
)
and status = 'selected_complete';

-- 2. Open BIRLA HIGH SCHOOL - MUKUNDAPUR (GEN-0036)
update public.schools
set participant_editing_open = true
where school_code = 'GEN-0036'
   or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
   or name ilike 'Birla High School Mukundapur%';

-- Reset BIRLA HIGH SCHOOL - MUKUNDAPUR registration & selections to draft/editable
update public.registrations
set status = 'draft'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0036'
     or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
     or name ilike 'Birla High School Mukundapur%'
);

update public.school_event_selections
set status = 'selected_complete'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0036'
     or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
     or name ilike 'Birla High School Mukundapur%'
)
and status = 'submitted';

commit;
