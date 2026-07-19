import { corsDecision } from '../_shared/cors.ts';
import { decryptPassword } from '../_shared/credentials.ts';
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

    const { data, error } = await adminClient
      .from('registrations')
      .select('school_name,school_code,status,school_credentials!inner(password_ciphertext,password_iv)')
      .eq('auth_user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonResponse(stableBody(false, 'FORBIDDEN', 'This account does not have an approved school.', requestId), 403, cors.headers);

    const related = Array.isArray(data.school_credentials) ? data.school_credentials[0] : data.school_credentials;
    if (!related) throw new Error('credential missing');
    const password = await decryptPassword(
      related.password_ciphertext,
      related.password_iv,
      env('SCHOOL_CREDENTIAL_ENCRYPTION_KEY'),
    );
    return jsonResponse(stableBody(true, 'SCHOOL_CREDENTIALS_LOADED', 'School credentials loaded.', requestId, {
      school: {
        school_name: data.school_name,
        school_code: data.school_code,
        status: data.status,
        password,
      },
    }), 200, cors.headers);
  } catch {
    safeLog('error', 'school_credentials_failed', requestId, { code: 'UNEXPECTED_ERROR' });
    return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'The dashboard is temporarily unavailable.', requestId), 503, cors.headers);
  }
}

if (import.meta.main) Deno.serve(handleSchoolCredentials);

