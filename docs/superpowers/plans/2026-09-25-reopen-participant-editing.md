# Reopen Participant Editing (GEN-0039 & GEN-0023) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reopen participant roster editing specifically for APEEJAY SCHOOL PARK STREET (code: `GEN-0039`) and Indus Valley World School (code: `GEN-0023`), while keeping participant editing closed for all other schools.

**Architecture:** 
1. Database: Create migration `supabase/migrations/20260925000001_reopen_participant_editing.sql` that adds `participant_editing_open` boolean column to `public.schools`, sets it to `true` for `GEN-0039` and `GEN-0023`, restores `public.is_school_draft(p_school_id uuid)` to check for this override flag, and restores `toggle_school_event_selection` and `save_event_participants` RPCs to check `is_school_draft`.
2. Frontend: In `SchoolDashboardPage.jsx`, `MobileSchoolDashboardPage.jsx`, and `EventDetailPage.jsx`, query `participant_editing_open` from `schools` table and conditionally unlock rosters and update banner/badge UI for allowed schools.
3. Tests: Update `EventDetailPage.test.jsx` to test both locked and unlocked behavior.

**Tech Stack:** React 19, Vite, PostgreSQL / Supabase, Vitest, Testing Library

## Global Constraints

- Do not alter roster editing permissions for any schools other than `GEN-0039` (APEEJAY SCHOOL PARK STREET) and `GEN-0023` (Indus Valley World School).
- Preserve existing RLS and security checks: admins retain full access; non-admin schools only access their own rosters when `participant_editing_open = true`.
- Match existing repository coding style: ES modules, two-space indentation, single quotes, semicolons.

---

### Task 1: Supabase Database Migration

**Files:**
- Create: `supabase/migrations/20260925000001_reopen_participant_editing.sql`

**Interfaces:**
- Consumes: `public.schools`, `public.school_event_selections`, `public.registration_participants`, `public.events`
- Produces: `schools.participant_editing_open` column, updated `is_school_draft`, `toggle_school_event_selection`, and `save_event_participants` RPCs.

- [x] **Step 1: Create migration file**

Create `supabase/migrations/20260925000001_reopen_participant_editing.sql` with the following content:

```sql
-- Migration: 20260925000001_reopen_participant_editing.sql
-- Description: Reopens participant roster editing for APEEJAY SCHOOL PARK STREET (GEN-0039)
-- and Indus Valley World School (GEN-0023) via a per-school flag. All other schools remain closed.

begin;

-- 1. Per-school "editing open" override flag
alter table public.schools
  add column if not exists participant_editing_open boolean not null default false;

-- 2. Target schools: APEEJAY SCHOOL PARK STREET (GEN-0039) & Indus Valley World School (GEN-0023)
update public.schools
set participant_editing_open = true
where school_code in ('GEN-0039', 'GEN-0023')
   or name ilike 'APEEJAY SCHOOL PARK STREET%'
   or name ilike 'Indus Valley World School%';

-- 3. Registration state check helper now means "editing allowed":
--    admins always allowed; a school is allowed only while its override flag is set.
create or replace function public.is_school_draft(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
     or exists (
       select 1 from public.schools s
       where s.id = p_school_id
         and s.participant_editing_open = true
     );
$$;

-- 4. RPC: toggle_school_event_selection (restores draft-aware toggle logic)
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

-- 5. RPC: save_event_participants (restores draft-aware participant saving logic)
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
```

---

### Task 2: Frontend School Dashboard Updates

**Files:**
- Modify: `src/pages/SchoolDashboardPage.jsx`
- Modify: `src/pages/mobile/MobileSchoolDashboardPage.jsx`

- [x] **Step 1: Update SchoolDashboardPage.jsx**

Update `getDeadlineDetails` to accept `editingOpen`:
```jsx
// Participant registration status - closed for all schools unless the school's override flag is set
function getDeadlineDetails(editingOpen) {
  if (editingOpen) {
    return {
      formattedText: 'Registration Editing Open',
      badgeClass: 'dash-deadline--neutral',
    };
  }
  return {
    formattedText: 'Registration Closed',
    badgeClass: 'dash-deadline--red',
  };
}
```

Add `participantEditingOpen` state and fetch it in the effect:
```jsx
const [participantEditingOpen, setParticipantEditingOpen] = useState(false);

// ... inside loadSchoolData, when activeSchoolId is resolved:
if (activeSchoolId) {
  const { data: schoolRow } = await supabase
    .from('schools')
    .select('participant_editing_open')
    .eq('id', activeSchoolId)
    .maybeSingle();
  if (active) setParticipantEditingOpen(Boolean(schoolRow?.participant_editing_open));
}
```

Update deadline invocation:
```jsx
const deadline = getDeadlineDetails(participantEditingOpen);
```

Update tooltip and subtitle copy:
```jsx
{participantEditingOpen
  ? 'Participant registration is open for this school. Rosters can be edited until the event locks them.'
  : 'Participant registration is closed for all schools. Rosters are locked and can no longer be edited or changed.'}
```
and
```jsx
<span className="label-caps text-muted">
  {participantEditingOpen
    ? 'Select 3–10 Events (Min 3 Complete)'
    : 'Registration Closed (Rosters Locked)'}
</span>
```

- [x] **Step 2: Update MobileSchoolDashboardPage.jsx**

Apply the identical changes in `src/pages/mobile/MobileSchoolDashboardPage.jsx`:
- Update `getDeadlineDetails(editingOpen)` function signature and logic.
- Add `participantEditingOpen` state.
- Query `participant_editing_open` from `schools` table for `activeSchoolId`.
- Update tooltip text and event rack subtitle based on `participantEditingOpen`.

---

### Task 3: Frontend EventDetailPage & Unit Tests

**Files:**
- Modify: `src/pages/EventDetailPage.jsx`
- Modify: `src/pages/EventDetailPage.test.jsx`

- [x] **Step 1: Update EventDetailPage.jsx**

Add `participantEditingOpen` state:
```jsx
const [participantEditingOpen, setParticipantEditingOpen] = useState(false);
```

In `loadData()`, query `schools` table for `currentSchoolId`:
```jsx
if (currentSchoolId) {
  // Fetch per-school editing override flag
  const { data: schoolRow } = await supabase
    .from('schools')
    .select('participant_editing_open')
    .eq('id', currentSchoolId)
    .maybeSingle();
  setParticipantEditingOpen(Boolean(schoolRow?.participant_editing_open));

  // ... fetch school registration status
```

Replace hardcoded `const REGISTRATION_CLOSED = true;` with:
```jsx
// Derived read-only state - participant registration closed unless the school's override flag is set
const REGISTRATION_CLOSED = !participantEditingOpen;
```

- [x] **Step 2: Update EventDetailPage.test.jsx**

Add mock support for `schools` table and test case verifying editing is enabled when `participant_editing_open` is true:
```jsx
mocks.schoolsEditingOpen = false;

// inside mocks.from implementation:
if (tableName === 'schools') {
  return {
    select: () => ({
      eq: () => ({
        maybeSingle: () =>
          Promise.resolve({
            data: { participant_editing_open: mocks.schoolsEditingOpen },
          }),
      }),
    }),
  };
}
```

Add test:
```jsx
it('enables participant editing when the school override flag is set', async () => {
  mocks.schoolsEditingOpen = true;

  render(
    <MemoryRouter initialEntries={['/dashboard/code-relay']}>
      <Routes>
        <Route path="/dashboard/:eventSlug" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

  // Closed banner must NOT appear when editing is open
  await waitFor(() => {
    expect(screen.queryByText('Registration Closed (Read-Only)')).not.toBeInTheDocument();
  });

  // Input fields should be enabled
  const nameInputs = screen.getAllByPlaceholderText('Enter Student Full Name');
  expect(nameInputs.length).toBeGreaterThan(0);
  nameInputs.forEach((input) => {
    expect(input).not.toBeDisabled();
  });

  const phoneInputs = screen.getAllByPlaceholderText('10-digit Phone');
  expect(phoneInputs.length).toBeGreaterThan(0);
  phoneInputs.forEach((input) => {
    expect(input).not.toBeDisabled();
  });

  // Save action should be available
  const saveButtons = screen.getAllByText(/Save Details/i);
  expect(saveButtons.length).toBeGreaterThanOrEqual(1);
});
```

---

### Task 4: Verification and Build Check

**Files:**
- N/A (Build and verification run)

- [x] **Step 1: Install dependencies if needed and verify tests**
Run `npm test` or `npx vitest run` to ensure unit test suite passes.

- [x] **Step 2: Run production build**
Run `npm run build` to confirm Vite produces a clean build with zero syntax or bundling errors.
