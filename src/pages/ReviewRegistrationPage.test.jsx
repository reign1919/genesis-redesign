import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewRegistrationPage from './ReviewRegistrationPage';

// Mocks
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  from: vi.fn(),
  loadSchoolCredentials: vi.fn(),
}));

vi.mock('../components/NeuralBackground', () => ({
  default: () => <div data-testid="neural-bg" />,
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: mocks.from,
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

describe('ReviewRegistrationPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-uuid-1', email: 'gen-0015@schools.genesis.invalid' } } },
    });
    mocks.loadSchoolCredentials.mockResolvedValue({
      ok: true,
      school: { school_name: "St. Xavier's Collegiate School", school_code: 'GEN-0015' },
    });
  });

  it('renders locked gating state when fewer than 3 events are completed', async () => {
    // Mock school_users query
    const chainSelect = (data) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data }),
          is: () => Promise.resolve({ data }),
        }),
        is: () => Promise.resolve({ data }),
      }),
    });

    mocks.from.mockImplementation((tableName) => {
      if (tableName === 'school_users') {
        return chainSelect({ school_id: 'school-uuid-1' });
      }
      if (tableName === 'v_school_event_statuses') {
        return {
          select: () =>
            Promise.resolve({
              data: [
                { event_slug: 'cyber-heist', status: 'selected_complete' },
                { event_slug: 'robo-wars', status: 'selected_incomplete' },
              ],
            }),
        };
      }
      if (tableName === 'school_event_selections') {
        return chainSelect([]);
      }
      return chainSelect(null);
    });

    render(
      <BrowserRouter>
        <ReviewRegistrationPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Registration Summary Locked')).toBeInTheDocument();
    });

    expect(screen.getByText(/Return to Events Checklist/i)).toBeInTheDocument();
  });

  it('renders full roster summary and automatic qualification notice when 3+ events are completed', async () => {
    mocks.from.mockImplementation((tableName) => {
      if (tableName === 'school_users') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { school_id: 'school-uuid-1' } }),
            }),
          }),
        };
      }
      if (tableName === 'v_school_event_statuses') {
        return {
          select: () =>
            Promise.resolve({
              data: [
                { event_slug: 'cyber-heist', status: 'selected_complete' },
                { event_slug: 'robo-wars', status: 'selected_complete' },
                { event_slug: 'pixel-craft', status: 'selected_complete' },
              ],
            }),
        };
      }
      if (tableName === 'school_event_selections') {
        return {
          select: () => ({
            eq: () => ({
              is: () =>
                Promise.resolve({
                  data: [
                    { id: 'sel-1', event_id: 'cyber-heist', status: 'selected_complete', deselected_at: null },
                    { id: 'sel-2', event_id: 'robo-wars', status: 'selected_complete', deselected_at: null },
                    { id: 'sel-3', event_id: 'pixel-craft', status: 'selected_complete', deselected_at: null },
                  ],
                }),
            }),
          }),
        };
      }
      if (tableName === 'events') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { name: 'Cyber Heist', category: 'Coding', participant_limit: 2 } }),
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
                    { row_index: 1, participants: { name: 'Alex Vance', class: 'Grade 11', phone: '+919876543210' } },
                    { row_index: 2, participants: { name: 'Jordan Lee', class: 'Grade 12', phone: '+919876543211' } },
                  ],
                }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
    });

    render(
      <BrowserRouter>
        <ReviewRegistrationPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Qualification Criteria Met')).toBeInTheDocument();
    });

    expect(screen.getAllByText("St. Xavier's Collegiate School")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Alex Vance/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Jordan Lee/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Print/i)[0]).toBeInTheDocument();
  });
});
