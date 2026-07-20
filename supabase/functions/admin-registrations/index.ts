import { corsDecision } from '../_shared/cors.ts';
import {
  decryptPassword,
  encryptPassword,
  generateSchoolPassword,
  schoolAuthEmail,
} from '../_shared/credentials.ts';
import { createRequestId, jsonResponse, readJsonObject, stableBody } from '../_shared/http.ts';
import { safeLog } from '../_shared/logging.ts';
import { bearerToken } from '../_shared/security.ts';
import { authenticate, createAdminClient, isAdmin } from '../_shared/supabase.ts';
import { validateAdminTransition } from '../_shared/validation.ts';

const REGISTRATION_FIELDS =
  'id,school_name,teacher_whatsapp,school_code,status,created_at,updated_at';

function whatsappMessage(registration: Record<string, unknown>, portalUrl: string): string {
  return [
    `Hello ${registration.school_name},`,
    '',
    'Your school registration for Genesis has been approved.',
    `School code: ${registration.school_code}`,
    `Password: ${registration.password}`,
    `Portal: ${portalUrl}`,
    '',
    'Please keep these credentials secure.',
    '— Genesis Core Committee',
  ].join('\n');
}

function safeAuthErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return 'AUTH_USER_CREATE_FAILED';
  const candidate = error as { code?: unknown };
  return typeof candidate.code === 'string' && /^[a-z0-9_-]{1,80}$/iu.test(candidate.code)
    ? candidate.code
    : 'AUTH_USER_CREATE_FAILED';
}

async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string,
) {
  if (!adminClient) return null;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export async function handleAdminRegistrations(
  request: Request,
  dependencies: {
    env?: (name: string) => string;
    createAdminClient?: typeof createAdminClient;
    authenticate?: typeof authenticate;
    isAdmin?: typeof isAdmin;
  } = {},
): Promise<Response> {
  const env = dependencies.env || ((name: string) => Deno.env.get(name) || '');
  const makeAdminClient = dependencies.createAdminClient || createAdminClient;
  const authenticateUser = dependencies.authenticate || authenticate;
  const checkAdmin = dependencies.isAdmin || isAdmin;
  const requestId = createRequestId();
  const cors = corsDecision(request, ['GET', 'PATCH'], env('ALLOWED_ORIGINS'));

  try {
    if (!cors.allowed) {
      return jsonResponse(
        stableBody(false, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.', requestId),
        403,
        cors.headers,
      );
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors.headers });
    }
    if (request.method !== 'GET' && request.method !== 'PATCH') {
      return jsonResponse(
        stableBody(false, 'METHOD_NOT_ALLOWED', 'This request method is not allowed.', requestId),
        405,
        cors.headers,
      );
    }

    const token = bearerToken(request);
    if (!token) {
      return jsonResponse(
        stableBody(false, 'AUTH_REQUIRED', 'Sign in again to continue.', requestId),
        401,
        cors.headers,
      );
    }
    const adminClient = makeAdminClient();
    if (!adminClient) {
      return jsonResponse(
        stableBody(
          false,
          'SERVICE_UNAVAILABLE',
          'Administration is temporarily unavailable.',
          requestId,
        ),
        503,
        cors.headers,
      );
    }
    const user = await authenticateUser(adminClient, token);
    if (!user) {
      return jsonResponse(
        stableBody(false, 'AUTH_INVALID', 'Sign in again to continue.', requestId),
        401,
        cors.headers,
      );
    }
    if (!await checkAdmin(adminClient, user.id)) {
      safeLog('warn', 'admin_access_denied', requestId, { code: 'NOT_ADMIN' });
      return jsonResponse(
        stableBody(false, 'FORBIDDEN', 'You do not have access to this area.', requestId),
        403,
        cors.headers,
      );
    }

    const encryptionKey = env('SCHOOL_CREDENTIAL_ENCRYPTION_KEY');

    if (request.method === 'GET') {
      if (!encryptionKey) {
        return jsonResponse(
          stableBody(
            false,
            'SERVICE_UNAVAILABLE',
            'Credential configuration is unavailable.',
            requestId,
          ),
          503,
          cors.headers,
        );
      }
      const { data, error } = await adminClient
        .from('registrations')
        .select(`${REGISTRATION_FIELDS},school_credentials(password_ciphertext,password_iv)`)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) {
        return jsonResponse(
          stableBody(false, 'SERVICE_UNAVAILABLE', 'Registrations could not be loaded.', requestId),
          503,
          cors.headers,
        );
      }

      const registrations = await Promise.all(
        (data || []).map(async (row: Record<string, unknown>) => {
          const related = Array.isArray(row.school_credentials)
            ? row.school_credentials[0]
            : row.school_credentials;
          let password: string | null = null;
          if (related && typeof related === 'object') {
            const credential = related as Record<string, unknown>;
            if (
              typeof credential.password_ciphertext === 'string' &&
              typeof credential.password_iv === 'string'
            ) {
              password = await decryptPassword(
                credential.password_ciphertext,
                credential.password_iv,
                encryptionKey,
              );
            }
          }
          const { school_credentials: _credentials, ...registration } = row;
          return { ...registration, password };
        }),
      );

      return jsonResponse(
        stableBody(true, 'REGISTRATIONS_LISTED', 'Registrations loaded.', requestId, {
          registrations,
        }),
        200,
        cors.headers,
      );
    }

    const payload = await readJsonObject(request, 2048);
    if (!payload) {
      return jsonResponse(
        stableBody(false, 'INVALID_PAYLOAD', 'Check the requested status change.', requestId),
        400,
        cors.headers,
      );
    }
    const validated = validateAdminTransition(payload);
    if (!validated.ok) {
      return jsonResponse(
        stableBody(false, validated.code, 'Check the requested status change.', requestId),
        400,
        cors.headers,
      );
    }

    if (validated.value.status === 'rejected') {
      const { data, error } = await adminClient
        .from('registrations')
        .update({ status: 'rejected' })
        .eq('id', validated.value.registrationId)
        .eq('status', 'pending')
        .select(REGISTRATION_FIELDS)
        .maybeSingle();
      if (error) {
        return jsonResponse(
          stableBody(
            false,
            'SERVICE_UNAVAILABLE',
            'The registration could not be updated.',
            requestId,
          ),
          503,
          cors.headers,
        );
      }
      if (!data) {
        return jsonResponse(
          stableBody(
            false,
            'INVALID_TRANSITION',
            'This registration is no longer pending.',
            requestId,
          ),
          409,
          cors.headers,
        );
      }
      return jsonResponse(
        stableBody(true, 'REGISTRATION_UPDATED', 'Registration rejected.', requestId, {
          registration: data,
        }),
        200,
        cors.headers,
      );
    }

    if (!encryptionKey) {
      return jsonResponse(
        stableBody(
          false,
          'SERVICE_UNAVAILABLE',
          'Credential configuration is unavailable.',
          requestId,
        ),
        503,
        cors.headers,
      );
    }

    const { data: reservedCode, error: reserveError } = await adminClient.rpc(
      'reserve_registration_approval',
      { p_registration_id: validated.value.registrationId },
    );
    if (reserveError || typeof reservedCode !== 'string') {
      return jsonResponse(
        stableBody(false, 'SERVICE_UNAVAILABLE', 'Credentials could not be generated.', requestId),
        503,
        cors.headers,
      );
    }
    if (reservedCode === 'invalid_transition' || reservedCode === 'not_found') {
      return jsonResponse(
        stableBody(
          false,
          'INVALID_TRANSITION',
          'This registration is no longer pending.',
          requestId,
        ),
        409,
        cors.headers,
      );
    }
    if (reservedCode === 'code_exhausted') {
      return jsonResponse(
        stableBody(
          false,
          'CODE_EXHAUSTED',
          'No school codes remain. Contact the system administrator.',
          requestId,
        ),
        503,
        cors.headers,
      );
    }

    let newlyCreatedAuthUserId: string | null = null;
    let provisioningStage = 'load_staging';
    try {
      provisioningStage = 'load_registration';
      const { data: registration, error: registrationError } = await adminClient
        .from('registrations')
        .select(REGISTRATION_FIELDS)
        .eq('id', validated.value.registrationId)
        .eq('status', 'provisioning')
        .single();
      if (registrationError || !registration) {
        throw registrationError || new Error('registration missing');
      }

      provisioningStage = 'load_staging';
      let { data: staged, error: stagedError } = await adminClient
        .from('school_credential_provisioning')
        .select('auth_user_id,password_ciphertext,password_iv')
        .eq('registration_id', validated.value.registrationId)
        .maybeSingle();
      if (stagedError) throw stagedError;
      if (!staged) {
        provisioningStage = 'encrypt_credential';
        const password = generateSchoolPassword();
        const encrypted = await encryptPassword(password, encryptionKey);
        provisioningStage = 'store_staging';
        const inserted = await adminClient.from('school_credential_provisioning').insert({
          registration_id: validated.value.registrationId,
          password_ciphertext: encrypted.ciphertext,
          password_iv: encrypted.iv,
        }).select('auth_user_id,password_ciphertext,password_iv').single();
        if (inserted.error) throw inserted.error;
        staged = inserted.data;
      }

      provisioningStage = 'decrypt_credential';
      const password = await decryptPassword(
        staged.password_ciphertext,
        staged.password_iv,
        encryptionKey,
      );
      let authUserId = staged.auth_user_id as string | null;
      if (!authUserId) {
        provisioningStage = 'create_auth_user';
        const email = schoolAuthEmail(
          reservedCode,
          env('SCHOOL_AUTH_EMAIL_DOMAIN') || 'schools.genesis.invalid',
        );
        const created = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          app_metadata: { school_registration_id: validated.value.registrationId },
        });
        if (created.error || !created.data.user) {
          safeLog('warn', 'admin_auth_user_creation_failed', requestId, {
            code: safeAuthErrorCode(created.error),
            stage: 'create_auth_user',
          });
          provisioningStage = 'recover_auth_user';
          const existing = await findAuthUserByEmail(adminClient, email);
          if (
            !existing ||
            existing.app_metadata?.school_registration_id !== validated.value.registrationId
          ) {
            throw created.error || new Error('auth user missing');
          }
          authUserId = existing.id;
          const recovered = await adminClient.auth.admin.updateUserById(authUserId, { password });
          if (recovered.error) throw recovered.error;
        } else {
          authUserId = created.data.user.id;
          newlyCreatedAuthUserId = authUserId;
        }
        provisioningStage = 'link_auth_user';
        const stagedUpdate = await adminClient.from('school_credential_provisioning')
          .update({ auth_user_id: authUserId })
          .eq('registration_id', validated.value.registrationId);
        if (stagedUpdate.error) throw stagedUpdate.error;
      } else {
        provisioningStage = 'update_auth_password';
        const passwordUpdate = await adminClient.auth.admin.updateUserById(authUserId, {
          password,
        });
        if (passwordUpdate.error) throw passwordUpdate.error;
      }
      provisioningStage = 'finalize_approval';
      const { data: finalizeCode, error: finalizeError } = await adminClient.rpc(
        'finalize_registration_approval',
        {
          p_registration_id: validated.value.registrationId,
          p_auth_user_id: authUserId,
          p_password_ciphertext: staged.password_ciphertext,
          p_password_iv: staged.password_iv,
        },
      );
      if (finalizeError || finalizeCode !== 'approved') {
        throw finalizeError || new Error('approval not finalized');
      }

      const withCredentials = { ...registration, status: 'approved', password };
      const message = whatsappMessage(
        withCredentials,
        env('PUBLIC_PORTAL_URL') || 'https://genesis.example/#/portal',
      );
      safeLog('info', 'admin_transition_completed', requestId, {
        status: 'approved',
        transition: 'approved',
      });
      return jsonResponse(
        stableBody(
          true,
          'REGISTRATION_UPDATED',
          'Registration approved and credentials generated.',
          requestId,
          {
            registration: withCredentials,
            whatsappMessage: message,
          },
        ),
        200,
        cors.headers,
      );
    } catch {
      if (newlyCreatedAuthUserId) {
        await adminClient.auth.admin.deleteUser(newlyCreatedAuthUserId);
      }
      await adminClient.rpc('reset_registration_approval', {
        p_registration_id: validated.value.registrationId,
      });
      safeLog('error', 'admin_credential_provisioning_failed', requestId, {
        code: 'PROVISIONING_FAILED',
        stage: provisioningStage,
      });
      return jsonResponse(
        stableBody(
          false,
          'PROVISIONING_FAILED',
          'Credentials could not be generated. Try again.',
          requestId,
          {
            stage: provisioningStage,
          },
        ),
        503,
        cors.headers,
      );
    }
  } catch {
    safeLog('error', 'admin_unhandled_failure', requestId, { code: 'UNEXPECTED_ERROR' });
    return jsonResponse(
      stableBody(
        false,
        'SERVICE_UNAVAILABLE',
        'Administration is temporarily unavailable.',
        requestId,
      ),
      503,
      cors.headers,
    );
  }
}

if (import.meta.main) Deno.serve((request) => handleAdminRegistrations(request));
