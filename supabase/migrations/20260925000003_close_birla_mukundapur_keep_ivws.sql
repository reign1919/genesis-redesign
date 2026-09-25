-- Migration: 20260925000003_close_birla_mukundapur_keep_ivws.sql
-- Description: Closes BIRLA HIGH SCHOOL - MUKUNDAPUR (GEN-0036).
-- Keeps participant editing open ONLY for Indus Valley World School (GEN-0023).

begin;

-- 1. Close BIRLA HIGH SCHOOL - MUKUNDAPUR (GEN-0036)
update public.schools
set participant_editing_open = false
where school_code = 'GEN-0036'
   or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
   or name ilike 'Birla High School Mukundapur%';

update public.registrations
set status = 'submitted'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0036'
     or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
     or name ilike 'Birla High School Mukundapur%'
);

update public.school_event_selections
set status = 'submitted'
where school_id in (
  select id from public.schools
  where school_code = 'GEN-0036'
     or name ilike 'BIRLA HIGH SCHOOL - MUKUNDAPUR%'
     or name ilike 'Birla High School Mukundapur%'
)
and status = 'selected_complete';

-- 2. Ensure ONLY Indus Valley World School (GEN-0023) remains open
update public.schools
set participant_editing_open = false
where school_code <> 'GEN-0023';

update public.schools
set participant_editing_open = true
where school_code = 'GEN-0023'
   or name ilike 'Indus Valley World School%';

commit;
