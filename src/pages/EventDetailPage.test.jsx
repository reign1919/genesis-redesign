import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EventDetailPage from './EventDetailPage';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  loadSchoolCredentials: vi.fn(),
  schoolsEditingOpen: false,
}));

vi.mock('../components/NeuralBackground', () => ({
  default: () => <div data-testid="neural-bg" />,
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession, signOut: vi.fn() },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

vi.mock('../lib/edgeFunctions', () => ({
  loadSchoolCredentials: mocks.loadSchoolCredentials,
}));

vi.mock('../lib/authContext', () => ({
  useAuth: () => ({
    user: { schoolCode: 'GEN-0015', schoolName: "St. Xavier's Collegiate School" },
    logout: vi.fn(),
  }),
}));

describe('EventDetailPage Component Lockdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.schoolsEditingOpen = false;

    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-uuid-1', email: 'gen-0015@schools.genesis.invalid' } } },
    });

    mocks.loadSchoolCredentials.mockResolvedValue({
      ok: true,
      school: { id: 'school-uuid-1', school_name: "St. Xavier's Collegiate School", school_code: 'GEN-0015' },
    });

    mocks.from.mockImplementation((tableName) => {
      if (tableName === 'events') {
        return {
          select: () => ({
            ilike: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: 'event-uuid-1',
                    slug: 'code-relay',
                    name: 'Code Relay',
                    participant_limit: 2,
                  },
                }),
            }),
          }),
        };
      }

      if (tableName === 'school_users') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { school_id: 'school-uuid-1' } }),
            }),
          }),
        };
      }

      if (tableName === 'registrations') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { status: 'draft' } }),
            }),
          }),
        };
      }

      if (tableName === 'v_school_event_statuses') {
        return {
          select: () => ({
            ilike: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    status: 'selected_incomplete',
                    selection_id: 'sel-uuid-1',
                  },
                }),
            }),
          }),
        };
      }

      if (tableName === 'school_event_selections') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: {
                      id: 'sel-uuid-1',
                      status: 'selected_incomplete',
                      deselected_at: null,
                    },
                  }),
              }),
            }),
          }),
        };
      }

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

      if (tableName === 'registration_participants') {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [
                    {
                      row_index: 1,
                      participant_id: 'part-1',
                      participants: { name: 'Alice Smith', class: 'Grade 11', phone: '+919876543210' },
                    },
                  ],
                }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null }),
          }),
        }),
      };
    });
  });

  it('renders read-only registration closed banner and disables participant inputs', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/code-relay']}>
        <Routes>
          <Route path="/dashboard/:eventSlug" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Registration Closed (Read-Only)')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Participant registration is officially closed for all schools. Rosters are locked and can no longer be edited or changed.'
      )
    ).toBeInTheDocument();

    // Verify input fields are disabled
    const nameInputs = screen.getAllByPlaceholderText('Enter Student Full Name');
    expect(nameInputs.length).toBeGreaterThan(0);
    nameInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    const phoneInputs = screen.getAllByPlaceholderText('10-digit Phone');
    expect(phoneInputs.length).toBeGreaterThan(0);
    phoneInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    // Ensure save button and clear button are NOT rendered
    expect(screen.queryByText(/Save Details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Clear Participant/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Select Event/i)).not.toBeInTheDocument();
  });

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
});
