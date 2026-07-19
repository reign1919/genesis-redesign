import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ signInWithPassword: vi.fn() }));

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { signInWithPassword: mocks.signInWithPassword } },
}));

import { normalizeSchoolCode, schoolCodeEmail, signInSchool } from './auth';

describe('school credential Auth helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normalizes a GEN code to the internal Auth alias', () => {
    expect(normalizeSchoolCode(' gen-0042 ')).toBe('GEN-0042');
    expect(schoolCodeEmail(' gen-0042 ')).toBe('gen-0042@schools.genesis.invalid');
    expect(schoolCodeEmail('GEN-42')).toBeNull();
  });

  it('signs in with the generated school credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'school-jwt' } },
      error: null,
    });
    const result = await signInSchool('GEN-0001', 'ABCD2345');
    expect(result.ok).toBe(true);
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'gen-0001@schools.genesis.invalid',
      password: 'ABCD2345',
    });
  });

  it('rejects malformed or incomplete credentials before Auth', async () => {
    expect(await signInSchool('GEN-1', 'ABCD2345')).toEqual({ ok: false, code: 'INVALID_REQUEST' });
    expect(await signInSchool('GEN-0001', '')).toEqual({ ok: false, code: 'INVALID_REQUEST' });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });
});
