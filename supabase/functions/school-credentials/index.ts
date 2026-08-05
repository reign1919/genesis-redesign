import { corsDecision } from '../_shared/cors.ts';
import { generateSchoolPassword } from '../_shared/credentials.ts';
import { createRequestId, jsonResponse, stableBody } from '../_shared/http.ts';
import { safeLog } from '../_shared/logging.ts';
import { bearerToken } from '../_shared/security.ts';
import { authenticate, createAdminClient } from '../_shared/supabase.ts';

export async function handleSchoolCredentials(request: Request): Promise<Response> {
  const env = (name: string) => Deno.env.get(name) || '';
  const requestId = createRequestId();
  const cors = corsDecision(request, ['GET'], env('ALLOWED_ORIGINS'));
  try {
    if (!cors.allowed) return jsonResponse(stableBody(false, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.', requestId), 403, cors.headers);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors.headers });
    if (request.method !== 'GET') return jsonResponse(stableBody(false, 'METHOD_NOT_ALLOWED', 'This request method is not allowed.', requestId), 405, cors.headers);

    const token = bearerToken(request);
    if (!token) return jsonResponse(stableBody(false, 'AUTH_REQUIRED', 'Sign in again to continue.', requestId), 401, cors.headers);
    const adminClient = createAdminClient();
    if (!adminClient) return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'The dashboard is temporarily unavailable.', requestId), 503, cors.headers);
    const user = await authenticate(adminClient, token);
    if (!user) return jsonResponse(stableBody(false, 'AUTH_INVALID', 'Sign in again to continue.', requestId), 401, cors.headers);

    const userCode = user.email ? user.email.split('@')[0].toUpperCase() : 'GEN-0001';

    // 1. Get school_users mapping row for this authenticated user
    const { data: su, error: suErr } = await adminClient
      .from('school_users')
      .select('school_id, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (suErr) {
      safeLog('error', 'school_users_lookup_failed', requestId, { error: suErr.message });
      throw suErr;
    }

    let schoolId = su?.school_id;

    // 2. If junction row doesn't exist yet, locate existing school by code
    if (!schoolId) {
      let { data: existingSchool } = await adminClient
        .from('schools')
        .select('id, name')
        .eq('school_code', userCode)
        .maybeSingle();

      if (!existingSchool && /^GEN-[0-9]{4}$/i.test(userCode)) {
        const { data: newSchool } = await adminClient
          .from('schools')
          .insert({
            name: `School ${userCode}`,
            contact_email: user.email || '',
            contact_phone: '+10000000000',
            school_code: userCode,
            status: 'approved',
          })
          .select('id, name')
          .single();

        existingSchool = newSchool;
      }

      if (existingSchool) {
        schoolId = existingSchool.id;
        await adminClient
          .from('school_users')
          .upsert({ school_id: schoolId, auth_user_id: user.id, role: 'school_user' }, { onConflict: 'school_id,auth_user_id' });
      }
    }

    if (!schoolId) {
      return jsonResponse(stableBody(false, 'FORBIDDEN', 'This account does not have an approved school.', requestId), 403, cors.headers);
    }

    // 3. Query school info and credentials separately to avoid invalid relationship joins
    const [schoolRes, credRes] = await Promise.all([
      adminClient.from('schools').select('id, name, contact_email, school_code').eq('id', schoolId).single(),
      adminClient.from('school_credentials').select('password_text').eq('school_id', schoolId).maybeSingle(),
    ]);

    if (schoolRes.error || !schoolRes.data) {
      safeLog('error', 'school_data_fetch_failed', requestId, { error: schoolRes.error?.message });
      throw schoolRes.error || new Error('School record missing');
    }

    const schoolData = schoolRes.data;
    let passwordText = credRes.data?.password_text;

    // Ensure a valid 16-character password exists
    if (!passwordText || passwordText.length !== 16 || passwordText === 'Genesis2026!') {
      passwordText = generateSchoolPassword();
      await adminClient
        .from('school_credentials')
        .upsert({ school_id: schoolId, auth_user_id: user.id, password_text: passwordText }, { onConflict: 'school_id' });
    }

    return jsonResponse(stableBody(true, 'SCHOOL_CREDENTIALS_LOADED', 'School credentials loaded.', requestId, {
      school: {
        school_id: schoolData.id,
        school_name: schoolData.name,
        school_code: schoolData.school_code,
        status: 'approved',
        password: passwordText,
      },
    }), 200, cors.headers);
  } catch (err) {
    safeLog('error', 'school_credentials_unhandled_failure', requestId, { error: String(err) });
    return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'The dashboard is temporarily unavailable.', requestId), 503, cors.headers);
  }
}

if (import.meta.main) Deno.serve(handleSchoolCredentials);
