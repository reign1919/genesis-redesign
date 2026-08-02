-- Migration: 20260802239000_update_event_selection_limits.sql
-- Description: Update event selection limits for submission (min 3, max 10 active events; min 3 complete rosters)

begin;

create or replace function public.submit_school_registration(p_school_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_school_id uuid;
  v_is_admin boolean;
  v_reg_status public.registration_status;
  v_reg_id uuid;
  v_active_count int;
  v_complete_count int := 0;
  v_selection_record record;
begin
  v_caller_school_id := public.get_caller_school_id();
  v_is_admin := public.is_admin();

  -- 1. Authorization check
  if not v_is_admin and (v_caller_school_id is null or v_caller_school_id <> p_school_id) then
    raise exception 'Unauthorized: Caller does not have permissions to submit registration for school %', p_school_id
      using errcode = '42501';
  end if;

  -- 2. Fetch or initialize registration state
  select id, status into v_reg_id, v_reg_status
  from public.registrations
  where school_id = p_school_id;

  if v_reg_status = 'submitted' then
    raise exception 'Validation failed: Registration for school % is already submitted.', p_school_id
      using errcode = '22000';
  end if;

  -- 3. Verify between 3 and 10 active selected events
  select count(*) into v_active_count
  from public.school_event_selections
  where school_id = p_school_id and deselected_at is null;

  if v_active_count < 3 or v_active_count > 10 then
    raise exception 'Validation failed: Between 3 and 10 events must be selected. Currently active count: %', v_active_count
      using errcode = '22000';
  end if;

  -- 4. Check active selections and count complete rosters (min 3 complete rosters required)
  for v_selection_record in
    select 
      s.id as selection_id,
      e.name as event_name,
      e.participant_limit,
      s.status as selection_status,
      count(rp.id) as assigned_count,
      count(rp.id) filter (
        where p.name is not null and trim(p.name) <> ''
          and p.class is not null and trim(p.class) <> ''
          and p.phone is not null and trim(p.phone) <> ''
      ) as valid_assigned_count
    from public.school_event_selections s
    join public.events e on e.id = s.event_id
    left join public.registration_participants rp on rp.school_event_selection_id = s.id
    left join public.participants p on p.id = rp.participant_id
    where s.school_id = p_school_id and s.deselected_at is null
    group by s.id, e.name, e.participant_limit, s.status
  loop
    if v_selection_record.assigned_count = v_selection_record.participant_limit
       and v_selection_record.valid_assigned_count = v_selection_record.participant_limit then
      v_complete_count := v_complete_count + 1;
    end if;
  end loop;

  if v_complete_count < 3 then
    raise exception 'Validation failed: At least 3 events must have complete rosters with participant details. Currently complete count: %', v_complete_count
      using errcode = '22000';
  end if;

  -- 5. Atomic State Updates
  -- Upsert registration record to 'submitted'
  insert into public.registrations (school_id, status, submitted_at)
  values (p_school_id, 'submitted', now())
  on conflict (school_id) do update
  set status = 'submitted',
      submitted_at = now();

  select id into v_reg_id
  from public.registrations
  where school_id = p_school_id;

  -- Update all active selections to status = 'submitted'
  update public.school_event_selections
  set status = 'submitted'
  where school_id = p_school_id and deselected_at is null;

  return jsonb_build_object(
    'ok', true,
    'registration_id', v_reg_id,
    'status', 'submitted',
    'submitted_at', now()
  );
end;
$$;

grant execute on function public.submit_school_registration(uuid) to authenticated, service_role;

commit;
