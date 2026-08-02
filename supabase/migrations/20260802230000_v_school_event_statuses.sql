-- Migration: 20260802230000_v_school_event_statuses.sql
-- Description: View and RPC to calculate event selection statuses per school server-side

begin;

-- 1. View to compute selection status per active event for caller's school
create or replace view public.v_school_event_statuses as
select
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  e.description as event_description,
  e.participant_limit,
  e.is_active,
  e.eligibility_note,
  coalesce(ses.status::text, 'not_selected') as status,
  ses.id as selection_id,
  ses.selected_at,
  public.get_caller_school_id() as school_id
from public.events e
left join public.school_event_selections ses
  on ses.event_id = e.id
 and ses.school_id = public.get_caller_school_id()
 and ses.deselected_at is null
where e.is_active = true
order by e.name asc;

grant select on public.v_school_event_statuses to authenticated;

-- 2. RPC function to query status by school_id directly
create or replace function public.get_school_event_statuses(p_school_id uuid)
returns table (
  event_id uuid,
  event_slug text,
  event_name text,
  event_description text,
  participant_limit int,
  is_active boolean,
  eligibility_note text,
  status text,
  selection_id uuid,
  selected_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id as event_id,
    e.slug as event_slug,
    e.name as event_name,
    e.description as event_description,
    e.participant_limit,
    e.is_active,
    e.eligibility_note,
    coalesce(ses.status::text, 'not_selected') as status,
    ses.id as selection_id,
    ses.selected_at
  from public.events e
  left join public.school_event_selections ses
    on ses.event_id = e.id
   and ses.school_id = p_school_id
   and ses.deselected_at is null
  where e.is_active = true
  order by e.name asc;
$$;

grant execute on function public.get_school_event_statuses(uuid) to authenticated;

commit;
