-- Migration: 20260802220000_genesis_fest_schema.sql
-- Description: Genesis Inter-School Fest Backend Schema, RLS, RPCs, and Audit Logging

begin;

--------------------------------------------------------------------------------
-- 1. Custom Enum Types
--------------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'selection_status') then
    create type public.selection_status as enum (
      'selected_incomplete',
      'selected_complete',
      'locked',
      'submitted'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type public.registration_status as enum (
      'draft',
      'submitted',
      'reopened'
    );
  end if;
end
$$;

--------------------------------------------------------------------------------
-- 2. Core Tables Creation
--------------------------------------------------------------------------------

-- Schools Table
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text not null,
  contact_phone text not null,
  created_at timestamptz not null default now()
);

-- School Users Junction Table
create table if not exists public.school_users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'school_user',
  created_at timestamptz not null default now(),
  constraint school_users_school_auth_unique unique (school_id, auth_user_id)
);

-- Events Table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  participant_limit int not null check (participant_limit > 0),
  is_active boolean not null default true,
  eligibility_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- School Event Selections Table
create table if not exists public.school_event_selections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status public.selection_status not null default 'selected_incomplete',
  selected_at timestamptz not null default now(),
  deselected_at timestamptz
);

-- Partial Unique Index: A school can select an event only once while active (deselected_at is null)
create unique index if not exists school_event_selections_active_unique 
  on public.school_event_selections (school_id, event_id) 
  where deselected_at is null;

-- Participants Table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  class text not null,
  phone text not null,
  guardian_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Registration Participants Table
create table if not exists public.registration_participants (
  id uuid primary key default gen_random_uuid(),
  school_event_selection_id uuid not null references public.school_event_selections(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  row_index int not null check (row_index >= 1),
  constraint reg_part_selection_row_unique unique (school_event_selection_id, row_index),
  constraint reg_part_selection_participant_unique unique (school_event_selection_id, participant_id)
);

-- Registrations Table
drop trigger if exists registrations_set_updated_at on public.registrations;
drop trigger if exists registrations_enforce_state on public.registrations;
drop table if exists public.registrations cascade;
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references public.schools(id) on delete cascade,
  status public.registration_status not null default 'draft',
  submitted_at timestamptz,
  reopened_at timestamptz,
  reopened_by uuid references auth.users(id) on delete set null,
  consent_confirmed boolean not null default false
);

-- Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 3. Security Helper Functions
--------------------------------------------------------------------------------

-- Admin checker helper: inspects JWT claims or public.profiles.is_admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select 
    coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
    or coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    or coalesce((auth.jwt() ->> 'role') = 'service_role', false)
    or exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    );
$$;

-- Caller school lookup helper
create or replace function public.get_caller_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select school_id 
  from public.school_users 
  where auth_user_id = auth.uid() 
  limit 1;
$$;

-- Registration state check helper (returns true if status is 'draft' or no registration row exists yet)
create or replace function public.is_school_draft(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select status from public.registrations where school_id = p_school_id limit 1),
    'draft'::public.registration_status
  ) = 'draft'::public.registration_status;
$$;

--------------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS) & Grant Privileges
--------------------------------------------------------------------------------

alter table public.schools enable row level security;
alter table public.schools force row level security;

alter table public.school_users enable row level security;
alter table public.school_users force row level security;

alter table public.events enable row level security;
alter table public.events force row level security;

alter table public.school_event_selections enable row level security;
alter table public.school_event_selections force row level security;

alter table public.participants enable row level security;
alter table public.participants force row level security;

alter table public.registration_participants enable row level security;
alter table public.registration_participants force row level security;

alter table public.registrations enable row level security;
alter table public.registrations force row level security;

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

-- Grant permissions to authenticated role
grant usage on schema public to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select, insert, update on public.schools to authenticated;
grant select on public.school_users to authenticated;
grant select, insert, update, delete on public.school_event_selections to authenticated;
grant select, insert, update, delete on public.participants to authenticated;
grant select, insert, update, delete on public.registration_participants to authenticated;
grant select, insert, update on public.registrations to authenticated;
grant select on public.audit_logs to authenticated;

--------------------------------------------------------------------------------
-- 5. RLS Policies
--------------------------------------------------------------------------------

-- Schools Policies
drop policy if exists schools_select_policy on public.schools;
create policy schools_select_policy on public.schools
  for select to authenticated
  using (public.is_admin() or id = public.get_caller_school_id());

drop policy if exists schools_update_policy on public.schools;
create policy schools_update_policy on public.schools
  for update to authenticated
  using (public.is_admin() or (id = public.get_caller_school_id() and public.is_school_draft(id)))
  with check (public.is_admin() or (id = public.get_caller_school_id() and public.is_school_draft(id)));

drop policy if exists schools_admin_all_policy on public.schools;
create policy schools_admin_all_policy on public.schools
  for all to authenticated
  using (public.is_admin());

-- School Users Policies
drop policy if exists school_users_select_policy on public.school_users;
create policy school_users_select_policy on public.school_users
  for select to authenticated
  using (public.is_admin() or auth_user_id = auth.uid() or school_id = public.get_caller_school_id());

drop policy if exists school_users_admin_all_policy on public.school_users;
create policy school_users_admin_all_policy on public.school_users
  for all to authenticated
  using (public.is_admin());

-- Events Policies (Read-only to schools, writable only by admins)
drop policy if exists events_select_policy on public.events;
create policy events_select_policy on public.events
  for select to anon, authenticated
  using (true);

drop policy if exists events_admin_insert_policy on public.events;
create policy events_admin_insert_policy on public.events
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists events_admin_update_policy on public.events;
create policy events_admin_update_policy on public.events
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists events_admin_delete_policy on public.events;
create policy events_admin_delete_policy on public.events
  for delete to authenticated
  using (public.is_admin());

-- Registrations Policies
drop policy if exists registrations_select_policy on public.registrations;
create policy registrations_select_policy on public.registrations
  for select to authenticated
  using (public.is_admin() or school_id = public.get_caller_school_id());

drop policy if exists registrations_insert_policy on public.registrations;
create policy registrations_insert_policy on public.registrations
  for insert to authenticated
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

drop policy if exists registrations_update_policy on public.registrations;
create policy registrations_update_policy on public.registrations
  for update to authenticated
  using (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)))
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

-- School Event Selections Policies (Writable only while registration status = 'draft')
drop policy if exists selections_select_policy on public.school_event_selections;
create policy selections_select_policy on public.school_event_selections
  for select to authenticated
  using (public.is_admin() or school_id = public.get_caller_school_id());

drop policy if exists selections_insert_policy on public.school_event_selections;
create policy selections_insert_policy on public.school_event_selections
  for insert to authenticated
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

drop policy if exists selections_update_policy on public.school_event_selections;
create policy selections_update_policy on public.school_event_selections
  for update to authenticated
  using (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)))
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

drop policy if exists selections_delete_policy on public.school_event_selections;
create policy selections_delete_policy on public.school_event_selections
  for delete to authenticated
  using (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

-- Participants Policies (Writable only while registration status = 'draft')
drop policy if exists participants_select_policy on public.participants;
create policy participants_select_policy on public.participants
  for select to authenticated
  using (public.is_admin() or school_id = public.get_caller_school_id());

drop policy if exists participants_insert_policy on public.participants;
create policy participants_insert_policy on public.participants
  for insert to authenticated
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

drop policy if exists participants_update_policy on public.participants;
create policy participants_update_policy on public.participants
  for update to authenticated
  using (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)))
  with check (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

drop policy if exists participants_delete_policy on public.participants;
create policy participants_delete_policy on public.participants
  for delete to authenticated
  using (public.is_admin() or (school_id = public.get_caller_school_id() and public.is_school_draft(school_id)));

-- Registration Participants Policies (Writable only while registration status = 'draft')
drop policy if exists reg_part_select_policy on public.registration_participants;
create policy reg_part_select_policy on public.registration_participants
  for select to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.school_event_selections s
      where s.id = registration_participants.school_event_selection_id
        and s.school_id = public.get_caller_school_id()
    )
  );

drop policy if exists reg_part_insert_policy on public.registration_participants;
create policy reg_part_insert_policy on public.registration_participants
  for insert to authenticated
  with check (
    public.is_admin() or exists (
      select 1 from public.school_event_selections s
      where s.id = registration_participants.school_event_selection_id
        and s.school_id = public.get_caller_school_id()
        and public.is_school_draft(s.school_id)
    )
  );

drop policy if exists reg_part_update_policy on public.registration_participants;
create policy reg_part_update_policy on public.registration_participants
  for update to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.school_event_selections s
      where s.id = registration_participants.school_event_selection_id
        and s.school_id = public.get_caller_school_id()
        and public.is_school_draft(s.school_id)
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.school_event_selections s
      where s.id = registration_participants.school_event_selection_id
        and s.school_id = public.get_caller_school_id()
        and public.is_school_draft(s.school_id)
    )
  );

drop policy if exists reg_part_delete_policy on public.registration_participants;
create policy reg_part_delete_policy on public.registration_participants
  for delete to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.school_event_selections s
      where s.id = registration_participants.school_event_selection_id
        and s.school_id = public.get_caller_school_id()
        and public.is_school_draft(s.school_id)
    )
  );

-- Audit Logs Policies
drop policy if exists audit_logs_select_policy on public.audit_logs;
create policy audit_logs_select_policy on public.audit_logs
  for select to authenticated
  using (public.is_admin());

drop policy if exists audit_logs_insert_policy on public.audit_logs;
create policy audit_logs_insert_policy on public.audit_logs
  for insert to authenticated
  with check (true);

--------------------------------------------------------------------------------
-- 6. Trigger for Automatic Selection Status Calculation
--------------------------------------------------------------------------------

create or replace function public.sync_selection_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_selection_id uuid;
  v_event_limit int;
  v_part_count int;
  v_missing_fields int;
  v_curr_status public.selection_status;
begin
  if (tg_op = 'DELETE') then
    v_selection_id := old.school_event_selection_id;
  else
    v_selection_id := new.school_event_selection_id;
  end if;

  select status into v_curr_status
  from public.school_event_selections
  where id = v_selection_id;

  -- Do not override submitted or locked status automatically
  if v_curr_status in ('submitted', 'locked') then
    return null;
  end if;

  select e.participant_limit into v_event_limit
  from public.school_event_selections s
  join public.events e on e.id = s.event_id
  where s.id = v_selection_id;

  select count(*),
         count(*) filter (where p.name is null or trim(p.name) = '' or p.class is null or trim(p.class) = '' or p.phone is null or trim(p.phone) = '')
  into v_part_count, v_missing_fields
  from public.registration_participants rp
  join public.participants p on p.id = rp.participant_id
  where rp.school_event_selection_id = v_selection_id;

  if v_part_count = v_event_limit and v_missing_fields = 0 then
    update public.school_event_selections
    set status = 'selected_complete'
    where id = v_selection_id and status <> 'selected_complete';
  else
    update public.school_event_selections
    set status = 'selected_incomplete'
    where id = v_selection_id and status <> 'selected_incomplete';
  end if;

  return null;
end;
$$;

drop trigger if exists sync_selection_status_trigger on public.registration_participants;
create trigger sync_selection_status_trigger
  after insert or update or delete on public.registration_participants
  for each row execute function public.sync_selection_status();

--------------------------------------------------------------------------------
-- 7. Audit Logging Triggers
--------------------------------------------------------------------------------

-- Trigger Function: Audit Event Limit Change
create or replace function public.audit_event_limit_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (old.participant_limit is distinct from new.participant_limit) then
    insert into public.audit_logs (
      actor_id,
      actor_role,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      auth.uid(),
      case when public.is_admin() then 'admin' else 'system' end,
      'event_limit_changed',
      'events',
      new.id,
      jsonb_build_object(
        'event_slug', new.slug,
        'event_name', new.name,
        'old_limit', old.participant_limit,
        'new_limit', new.participant_limit
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists audit_event_limit_trigger on public.events;
create trigger audit_event_limit_trigger
  after update on public.events
  for each row execute function public.audit_event_limit_change();

-- Trigger Function: Audit Selection (Event Selected / Deselected)
create or replace function public.audit_selection_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.audit_logs (
      actor_id,
      actor_role,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      auth.uid(),
      case when public.is_admin() then 'admin' else 'school_user' end,
      'event_selected',
      'school_event_selections',
      new.id,
      jsonb_build_object(
        'school_id', new.school_id,
        'event_id', new.event_id,
        'selected_at', new.selected_at
      )
    );
  elsif (tg_op = 'UPDATE' and old.deselected_at is null and new.deselected_at is not null) then
    insert into public.audit_logs (
      actor_id,
      actor_role,
      action,
      target_table,
      target_id,
      metadata
    ) values (
      auth.uid(),
      case when public.is_admin() then 'admin' else 'school_user' end,
      'event_deselected',
      'school_event_selections',
      new.id,
      jsonb_build_object(
        'school_id', new.school_id,
        'event_id', new.event_id,
        'deselected_at', new.deselected_at
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists audit_selection_trigger on public.school_event_selections;
create trigger audit_selection_trigger
  after insert or update on public.school_event_selections
  for each row execute function public.audit_selection_change();

--------------------------------------------------------------------------------
-- 8. Postgres RPC Functions
--------------------------------------------------------------------------------

-- RPC Function: submit_registration
create or replace function public.submit_registration(p_school_id uuid)
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
  v_invalid_selection_record record;
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

  -- 3. Verify exactly 3 active selected events
  select count(*) into v_active_count
  from public.school_event_selections
  where school_id = p_school_id and deselected_at is null;

  if v_active_count <> 3 then
    raise exception 'Validation failed: Exactly 3 events must be selected. Currently active count: %', v_active_count
      using errcode = '22000';
  end if;

  -- 4. Check that all 3 active selections have status = 'selected_complete'
  -- and verify participant limit & non-null required fields
  for v_invalid_selection_record in
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
    if v_invalid_selection_record.assigned_count <> v_invalid_selection_record.participant_limit
       or v_invalid_selection_record.valid_assigned_count <> v_invalid_selection_record.participant_limit then
      raise exception 'Validation failed: Event "%" requires % complete participants. Found % valid participants.',
        v_invalid_selection_record.event_name,
        v_invalid_selection_record.participant_limit,
        v_invalid_selection_record.valid_assigned_count
        using errcode = '22000';
    end if;
  end loop;

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

  -- Lock all 3 active selections to status = 'submitted'
  update public.school_event_selections
  set status = 'submitted'
  where school_id = p_school_id and deselected_at is null;

  -- Insert Audit Log
  insert into public.audit_logs (
    actor_id,
    actor_role,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    auth.uid(),
    case when v_is_admin then 'admin' else 'school_user' end,
    'registration_submitted',
    'registrations',
    v_reg_id,
    jsonb_build_object(
      'school_id', p_school_id,
      'submitted_at', now(),
      'event_count', 3
    )
  );

  return jsonb_build_object(
    'success', true,
    'school_id', p_school_id,
    'status', 'submitted',
    'submitted_at', now()
  );
end;
$$;

-- Grant execution on submit_registration
grant execute on function public.submit_registration(uuid) to authenticated;

-- RPC Function: reopen_registration
create or replace function public.reopen_registration(
  p_school_id uuid,
  p_admin_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean;
  v_reg_id uuid;
  v_reg_status public.registration_status;
  v_admin_actor uuid;
  v_selection_record record;
  v_new_status public.selection_status;
begin
  v_is_admin := public.is_admin();

  -- 1. Admin permission check
  if not v_is_admin then
    raise exception 'Unauthorized: Only administrative users can reopen a registration.'
      using errcode = '42501';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Validation failed: A valid reason must be provided to reopen a registration.'
      using errcode = '22000';
  end if;

  -- 2. Fetch existing registration
  select id, status into v_reg_id, v_reg_status
  from public.registrations
  where school_id = p_school_id;

  if v_reg_id is null or v_reg_status <> 'submitted' then
    raise exception 'Validation failed: Registration for school % is not in submitted state.', p_school_id
      using errcode = '22000';
  end if;

  v_admin_actor := coalesce(p_admin_id, auth.uid());

  -- 3. Set registration status back to 'draft'
  update public.registrations
  set status = 'draft',
      reopened_at = now(),
      reopened_by = v_admin_actor
  where id = v_reg_id;

  -- 4. Unlock associated active school_event_selections
  for v_selection_record in
    select 
      s.id as selection_id,
      e.participant_limit,
      count(rp.id) filter (
        where p.name is not null and trim(p.name) <> ''
          and p.class is not null and trim(p.class) <> ''
          and p.phone is not null and trim(p.phone) <> ''
      ) as valid_count
    from public.school_event_selections s
    join public.events e on e.id = s.event_id
    left join public.registration_participants rp on rp.school_event_selection_id = s.id
    left join public.participants p on p.id = rp.participant_id
    where s.school_id = p_school_id and s.deselected_at is null
    group by s.id, e.participant_limit
  loop
    if v_selection_record.valid_count = v_selection_record.participant_limit then
      v_new_status := 'selected_complete';
    else
      v_new_status := 'selected_incomplete';
    end if;

    update public.school_event_selections
    set status = v_new_status
    where id = v_selection_record.selection_id;
  end loop;

  -- 5. Write audit log entry
  insert into public.audit_logs (
    actor_id,
    actor_role,
    action,
    target_table,
    target_id,
    metadata
  ) values (
    v_admin_actor,
    'admin',
    'admin_reopened',
    'registrations',
    v_reg_id,
    jsonb_build_object(
      'school_id', p_school_id,
      'reopened_at', now(),
      'reason', p_reason
    )
  );

  return jsonb_build_object(
    'success', true,
    'school_id', p_school_id,
    'status', 'draft',
    'reopened_at', now(),
    'reopened_by', v_admin_actor
  );
end;
$$;

-- Grant execution on reopen_registration
grant execute on function public.reopen_registration(uuid, uuid, text) to authenticated;

commit;
