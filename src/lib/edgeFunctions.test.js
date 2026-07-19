import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  publicSupabaseKey: 'public-key',
  publicSupabaseUrl: 'https://project.supabase.co',
  supabase: { auth: { getSession: mocks.getSession } },
}));

import {
  listAdminRegistrations,
  submitRegistration,
  updateAdminRegistration,
} from './edgeFunctions';

describe('Edge Function client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fails closed without a Supabase session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    expect(await listAdminRegistrations()).toEqual({ ok: false, code: 'AUTH_REQUIRED' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the public key without requiring a session for registration submission', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      code: 'REGISTRATION_SUBMITTED',
      message: 'Registration submitted for review.',
      requestId: 'request-id',
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }));

    const result = await submitRegistration({
      schoolName: 'School A',
      teacherWhatsapp: '+919876543210',
    });

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://project.supabase.co/functions/v1/submit-registration',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ apikey: 'public-key' }),
      }),
    );
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it('uses explicit GET and PATCH admin operations without mass assignment', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'admin-jwt' } },
      error: null,
    });
    fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        code: 'REGISTRATIONS_LISTED',
        message: 'Registrations loaded.',
        requestId: 'one',
        registrations: [],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        code: 'REGISTRATION_UPDATED',
        message: 'Registration status updated.',
        requestId: 'two',
      }), { status: 200 }));

    await listAdminRegistrations();
    await updateAdminRegistration('10000000-0000-4000-8000-000000000001', 'approved');

    expect(fetch.mock.calls[0][1].method).toBe('GET');
    expect(fetch.mock.calls[1][1].method).toBe('PATCH');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      registrationId: '10000000-0000-4000-8000-000000000001',
      status: 'approved',
    });
  });

  it('collapses malformed upstream responses to a stable generic code', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'user-jwt' } },
      error: null,
    });
    fetch.mockResolvedValue(new Response('raw upstream detail', { status: 500 }));
    expect(await listAdminRegistrations()).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE' });
  });

  it('keeps bearer tokens out of request URLs', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'admin-jwt' } },
      error: null,
    });
    fetch.mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      code: 'FORBIDDEN',
      message: 'You do not have access to this area.',
      requestId: 'request-id',
    }), { status: 403, headers: { 'Content-Type': 'application/json' } }));

    await listAdminRegistrations();
    const [url, options] = fetch.mock.calls[0];
    expect(url).not.toContain('admin-jwt');
    expect(options.headers.Authorization).toBe('Bearer admin-jwt');
  });
});
