import { isSupabaseConfigured, supabase } from './supabase';

const schoolAuthDomain = import.meta.env.VITE_SCHOOL_AUTH_DOMAIN || 'schools.genesis.invalid';

export function normalizeSchoolCode(value) {
  return value.normalize('NFKC').trim().toUpperCase();
}

export function schoolCodeEmail(value) {
  const code = normalizeSchoolCode(value);
  if (!/^GEN-[0-9]{4}$/u.test(code)) return null;
  return `${code.toLowerCase()}@${schoolAuthDomain}`;
}

export async function signInSchool(schoolCode, password) {
  if (!isSupabaseConfigured) return { ok: false, code: 'SERVICE_UNAVAILABLE' };
  const email = schoolCodeEmail(schoolCode);
  if (!email || !password) return { ok: false, code: 'INVALID_REQUEST' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data?.session) return { ok: false, code: 'AUTH_FAILED' };
    return { ok: true, session: data.session };
  } catch {
    return { ok: false, code: 'AUTH_FAILED' };
  }
}
