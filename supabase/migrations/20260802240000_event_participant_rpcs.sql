-- Migration: 20260802240000_event_participant_rpcs.sql
-- Description: RPCs for atomic event selection toggles and participant roster saving with server-side validation and status flipping

begin;

--------------------------------------------------------------------------------
-- 1. RPC: toggle_school_event_selection
--------------------------------------------------------------------------------
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
  v_selection_id uuid;
  v_curr_status public.selection_status;
  v_event_name text;
begin
  v_caller_school_id := public.get_caller_school_id();
  v_is_admin := public.is_admin();

  -- 1. Authorization check
  if not v_is_admin and (v_caller_school_id is null or v_caller_school_id <> p_school_id) then
    raise exception 'Unauthorized: Caller cannot modify selections for school %', p_school_id
      using errcode = '42501';
  end if;

  -- 2. Registration draft check
  if not public.is_school_draft(p_school_id) then
    raise exception 'Validation failed: Registration for school % is already submitted and cannot be modified.', p_school_id
      using errcode = '22000';
  end if;

  -- Verify event exists
  select name into v_event_name
  from public.events
  where id = p_event_id and is_active = true;

  if v_event_name is null then
    raise exception 'Validation failed: Event % not found or inactive.', p_event_id
      using errcode = '22000';
  end if;

  -- Check existing selection
  select id, status into v_selection_id, v_curr_status
  from public.school_event_selections
  where school_id = p_school_id and event_id = p_event_id and deselected_at is null;

  if v_curr_status in ('locked', 'submitted') then
    raise exception 'Validation failed: Selection for event % is % and cannot be toggled.', v_event_name, v_curr_status
      using errcode = '22000';
  end if;

  if p_select then
    -- Selecting the event
    if v_selection_id is null then
      -- Check if soft-deselected row exists to re-activate
      select id into v_selection_id
      from public.school_event_selections
      where school_id = p_school_id and event_id = p_event_id;

      if v_selection_id is not null then
        update public.school_event_selections
        set deselected_at = null,
            selected_at = now(),
            status = coalesce(status, 'selected_incomplete'::public.selection_status)
        where id = v_selection_id;
      else
        insert into public.school_event_selections (school_id, event_id, status, selected_at)
        values (p_school_id, p_event_id, 'selected_incomplete'::public.selection_status, now())
        returning id into v_selection_id;
      end if;
    end if;

    select status into v_curr_status
    from public.school_event_selections
    where id = v_selection_id;

    return jsonb_build_object(
      'success', true,
      'is_selected', true,
      'selection_id', v_selection_id,
      'status', v_curr_status
    );
  else
    -- Deselecting the event (soft-deselect: set deselected_at, preserve registration_participants rows)
    if v_selection_id is not null then
      update public.school_event_selections
      set deselected_at = now()
      where id = v_selection_id;
    end if;

    return jsonb_build_object(
      'success', true,
      'is_selected', false,
      'selection_id', v_selection_id,
      'status', 'not_selected'
    );
  end if;
end;
$$;

grant execute on function public.toggle_school_event_selection(uuid, uuid, boolean) to authenticated;

--------------------------------------------------------------------------------
-- 2. RPC: save_event_participants
--------------------------------------------------------------------------------
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
  v_selection_id uuid;
  v_curr_status public.selection_status;
  v_event_limit int;
  v_elem jsonb;
  v_row_idx int;
  v_name text;
  v_class text;
  v_phone text;
  v_participant_id uuid;
  v_dup_check record;
  v_valid_count int := 0;
  v_final_status public.selection_status;
begin
  v_caller_school_id := public.get_caller_school_id();
  v_is_admin := public.is_admin();

  -- 1. Authorization check
  if not v_is_admin and (v_caller_school_id is null or v_caller_school_id <> p_school_id) then
    raise exception 'Unauthorized: Caller cannot update participants for school %', p_school_id
      using errcode = '42501';
  end if;

  -- 2. Registration draft check
  if not public.is_school_draft(p_school_id) then
    raise exception 'Validation failed: Registration for school % is already submitted.', p_school_id
      using errcode = '22000';
  end if;

  -- 3. Fetch event participant limit
  select participant_limit into v_event_limit
  from public.events
  where id = p_event_id and is_active = true;

  if v_event_limit is null then
    raise exception 'Validation failed: Event % not found or inactive.', p_event_id
      using errcode = '22000';
  end if;

  -- 4. Get active selection record
  select id, status into v_selection_id, v_curr_status
  from public.school_event_selections
  where school_id = p_school_id and event_id = p_event_id and deselected_at is null;

  if v_selection_id is null then
    raise exception 'Validation failed: Event is not selected by school %', p_school_id
      using errcode = '22000';
  end if;

  if v_curr_status in ('locked', 'submitted') then
    raise exception 'Validation failed: Event selection status is % and cannot be modified.', v_curr_status
      using errcode = '22000';
  end if;

  -- 5. Intra-event duplicate check (same Name + Phone combo in multiple rows)
  for v_dup_check in
    select 
      lower(trim(elem->>'name')) as clean_name, 
      lower(trim(elem->>'phone')) as clean_phone, 
      count(*) as cnt
    from jsonb_array_elements(p_participants) as elem
    where length(trim(coalesce(elem->>'name', ''))) > 0
      and length(trim(coalesce(elem->>'phone', ''))) > 0
    group by lower(trim(elem->>'name')), lower(trim(elem->>'phone'))
    having count(*) > 1
  loop
    raise exception 'Validation failed: Duplicate participant "%" with phone "%" detected in multiple rows within this event.', 
      v_dup_check.clean_name, v_dup_check.clean_phone
      using errcode = '22000';
  end loop;

  -- 6. Process each participant row
  for v_elem in select * from jsonb_array_elements(p_participants)
  loop
    v_row_idx := (v_elem->>'row_index')::int;
    v_name    := trim(coalesce(v_elem->>'name', ''));
    v_class   := trim(coalesce(v_elem->>'class', ''));
    v_phone   := trim(coalesce(v_elem->>'phone', ''));

    if v_row_idx is null or v_row_idx < 1 or v_row_idx > v_event_limit then
      raise exception 'Validation failed: Row index % out of bounds for event limit %.', v_row_idx, v_event_limit
        using errcode = '22000';
    end if;

    if v_name = '' or v_class = '' or v_phone = '' then
      -- Incomplete or empty row: Delete existing registration_participants link for this slot
      delete from public.registration_participants
      where school_event_selection_id = v_selection_id and row_index = v_row_idx;
    else
      -- Validate phone format for complete row
      if not (v_phone ~ '^[0-9+\s\-()]{10,15}$') then
        raise exception 'Validation failed: Row % phone number "%" is invalid format.', v_row_idx, v_phone
          using errcode = '22000';
      end if;

      -- Check if participant already linked to this row_index
      select participant_id into v_participant_id
      from public.registration_participants
      where school_event_selection_id = v_selection_id and row_index = v_row_idx;

      if v_participant_id is not null then
        -- Update existing participant row
        update public.participants
        set name = v_name,
            class = v_class,
            phone = v_phone,
            updated_at = now()
        where id = v_participant_id;
      else
        -- Insert new participant row
        insert into public.participants (school_id, name, class, phone)
        values (p_school_id, v_name, v_class, v_phone)
        returning id into v_participant_id;

        -- Link in registration_participants
        insert into public.registration_participants (school_event_selection_id, participant_id, row_index)
        values (v_selection_id, v_participant_id, v_row_idx)
        on conflict (school_event_selection_id, row_index) do update
        set participant_id = excluded.participant_id;
      end if;
    end if;
  end loop;

  -- 7. Count valid completed rows to update selection status
  select count(rp.id) filter (
    where p.name is not null and trim(p.name) <> ''
      and p.class is not null and trim(p.class) <> ''
      and p.phone is not null and trim(p.phone) <> ''
  ) into v_valid_count
  from public.registration_participants rp
  join public.participants p on p.id = rp.participant_id
  where rp.school_event_selection_id = v_selection_id;

  if v_valid_count = v_event_limit then
    v_final_status := 'selected_complete';
  else
    v_final_status := 'selected_incomplete';
  end if;

  update public.school_event_selections
  set status = v_final_status
  where id = v_selection_id;

  return jsonb_build_object(
    'success', true,
    'selection_id', v_selection_id,
    'status', v_final_status,
    'valid_count', v_valid_count,
    'participant_limit', v_event_limit,
    'last_saved_at', now()
  );
end;
$$;

grant execute on function public.save_event_participants(uuid, uuid, jsonb) to authenticated;

commit;
