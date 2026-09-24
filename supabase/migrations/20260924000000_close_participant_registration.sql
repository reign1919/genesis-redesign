-- Migration: 20260924000000_close_participant_registration.sql
-- Description: Closes participant registration across all schools, blocking edits to selections or participant rosters for non-admins

begin;

-- 1. Helper function: is_school_draft
-- Participant registration is officially closed for all schools.
-- Only administrators retain draft permissions.
create or replace function public.is_school_draft(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin();
$$;

-- 2. RPC: toggle_school_event_selection
create or replace function public.toggle_school_event_selection(
  p_school_id uuid,
  p_event_id uuid,
  p_select boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_school_id uuid;
  v_is_admin boolean;
begin
  v_caller_school_id := public.get_caller_school_id();
  v_is_admin := public.is_admin();

  -- Authorization check
  if not v_is_admin and (v_caller_school_id is null or v_caller_school_id <> p_school_id) then
    raise exception 'Unauthorized: Caller cannot modify selections for school %', p_school_id
      using errcode = '42501';
  end if;

  -- Registration closed check: Selections can no longer be modified
  if not v_is_admin then
    raise exception 'Validation failed: Participant registration is closed for all schools. Event selections cannot be modified.'
      using errcode = '22000';
  end if;

  -- Verify event exists
  if not exists (select 1 from public.events where id = p_event_id and is_active = true) then
    raise exception 'Validation failed: Event % not found or inactive.', p_event_id
      using errcode = '22000';
  end if;

  if p_select then
    insert into public.school_event_selections (school_id, event_id, status, selected_at, deselected_at)
    values (p_school_id, p_event_id, 'selected_incomplete'::public.selection_status, now(), null)
    on conflict (school_id, event_id) do update
    set deselected_at = null,
        selected_at = now();

    return jsonb_build_object(
      'success', true,
      'is_selected', true,
      'status', 'selected_incomplete'
    );
  else
    update public.school_event_selections
    set deselected_at = now()
    where school_id = p_school_id and event_id = p_event_id;

    return jsonb_build_object(
      'success', true,
      'is_selected', false,
      'status', 'not_selected'
    );
  end if;
end;
$$;

grant execute on function public.toggle_school_event_selection(uuid, uuid, boolean) to authenticated;

-- 3. RPC: save_event_participants
create or replace function public.save_event_participants(
  p_school_id uuid,
  p_event_id uuid,
  p_participants jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_school_id uuid;
  v_is_admin boolean;
begin
  v_caller_school_id := public.get_caller_school_id();
  v_is_admin := public.is_admin();

  -- Authorization check
  if not v_is_admin and (v_caller_school_id is null or v_caller_school_id <> p_school_id) then
    raise exception 'Unauthorized: Caller cannot update participants for school %', p_school_id
      using errcode = '42501';
  end if;

  -- Registration closed check: Roster modifications are blocked
  if not v_is_admin then
    raise exception 'Validation failed: Participant registration is closed for all schools. Participant rosters cannot be modified.'
      using errcode = '22000';
  end if;

  return jsonb_build_object(
    'success', false,
    'error', 'Participant registration is closed.'
  );
end;
$$;

grant execute on function public.save_event_participants(uuid, uuid, jsonb) to authenticated;

commit;
