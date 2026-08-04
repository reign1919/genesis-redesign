import { corsDecision } from '../_shared/cors.ts';
import {
  decryptPassword,
  generateSchoolPassword,
} from '../_shared/credentials.ts';
import { createRequestId, jsonResponse, readJsonObject, stableBody } from '../_shared/http.ts';
import { safeLog } from '../_shared/logging.ts';
import { bearerToken } from '../_shared/security.ts';
import { authenticate, createAdminClient, isAdmin } from '../_shared/supabase.ts';
import { validateAdminTransition } from '../_shared/validation.ts';

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
    '— The Genesis Council',
  ].join('\n');
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
    const admin = await checkAdmin(adminClient, user.id);
    if (!admin) {
      return jsonResponse(
        stableBody(false, 'FORBIDDEN', 'Administrator access required.', requestId),
        403,
        cors.headers,
      );
    }

    const encryptionKey = env('SCHOOL_CREDENTIAL_ENCRYPTION_KEY');

    // GET: List all registered school applications and their statuses
    if (request.method === 'GET') {
      const { data, error } = await adminClient
        .from('schools')
        .select('id, name, contact_phone, contact_email, school_code, status, created_at, school_credentials(password_ciphertext, password_iv, password_text)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        safeLog('error', 'admin_list_registrations_failed', requestId, { error: error.message });
        return jsonResponse(
          stableBody(false, 'SERVICE_UNAVAILABLE', 'Registrations could not be loaded.', requestId),
          503,
          cors.headers,
        );
      }

      const registrations = await Promise.all(
        (data || []).map(async (row: Record<string, unknown>) => {
          const cred = Array.isArray(row.school_credentials)
            ? row.school_credentials[0]
            : row.school_credentials;

          let password = generateSchoolPassword();
          if (cred && typeof cred === 'object') {
            const credential = cred as Record<string, unknown>;
            if (typeof credential.password_text === 'string' && credential.password_text) {
              password = credential.password_text;
            } else if (
              typeof credential.password_ciphertext === 'string' &&
              typeof credential.password_iv === 'string' &&
              encryptionKey
            ) {
              try {
                password = await decryptPassword(
                  credential.password_ciphertext,
                  credential.password_iv,
                  encryptionKey,
                );
              } catch {
                password = generateSchoolPassword();
              }
            }
          }

          return {
            id: row.id,
            school_name: row.name || 'School Account',
            teacher_whatsapp: row.contact_phone || row.contact_email || 'N/A',
            school_code: row.school_code || 'GEN-0001',
            status: row.status || 'pending',
            password: password,
            created_at: row.created_at || new Date().toISOString(),
          };
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

    // PATCH: Handle Approve / Reject status transitions
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
      const { data: updatedSchool, error: updateError } = await adminClient
        .from('schools')
        .update({ status: 'rejected' })
        .eq('id', validated.value.registrationId)
        .select('id, name, school_code, contact_phone, status')
        .maybeSingle();

      if (updateError || !updatedSchool) {
        return jsonResponse(
          stableBody(false, 'SERVICE_UNAVAILABLE', 'The registration could not be updated.', requestId),
          503,
          cors.headers,
        );
      }

      return jsonResponse(
        stableBody(true, 'REGISTRATION_UPDATED', 'Registration rejected.', requestId, {
          registration: updatedSchool,
        }),
        200,
        cors.headers,
      );
    }

    if (validated.value.status === 'approved') {
      try {
        const { data: schoolRow, error: fetchError } = await adminClient
          .from('schools')
          .update({ status: 'approved' })
          .eq('id', validated.value.registrationId)
          .select('id, name, school_code, contact_email, contact_phone')
          .maybeSingle();

        if (fetchError || !schoolRow) {
          return jsonResponse(
            stableBody(false, 'PROVISIONING_FAILED', 'The registration could not be approved.', requestId),
            503,
            cors.headers,
          );
        }

        const schoolCode = schoolRow.school_code || 'GEN-0001';
        const email = schoolRow.contact_email || `${schoolCode.toLowerCase()}@schools.genesis.invalid`;
        const password = generateSchoolPassword();

        let authUserId: string | null = null;
        const createdUser = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { school_name: schoolRow.name },
        });

        if (createdUser.data?.user) {
          authUserId = createdUser.data.user.id;
        } else {
          const { data: usersData } = await adminClient.auth.admin.listUsers();
          const match = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          if (match) {
            authUserId = match.id;
            await adminClient.auth.admin.updateUserById(authUserId, { password });
          }
        }

        if (authUserId) {
          await adminClient
            .from('school_users')
            .upsert({ school_id: schoolRow.id, auth_user_id: authUserId, role: 'school_user' }, { onConflict: 'school_id,auth_user_id' });

          await adminClient
            .from('school_credentials')
            .upsert({ school_id: schoolRow.id, auth_user_id: authUserId, password_text: password }, { onConflict: 'school_id' });
        }

        const withCredentials = {
          id: schoolRow.id,
          school_name: schoolRow.name,
          school_code: schoolCode,
          status: 'approved',
          password,
        };

        const message = whatsappMessage(
          withCredentials,
          env('PUBLIC_PORTAL_URL') || 'https://genesis.example/#/portal',
        );

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
      } catch (err) {
        safeLog('error', 'admin_approval_failed', requestId, { error: String(err) });
        return jsonResponse(
          stableBody(false, 'PROVISIONING_FAILED', 'The registration could not be approved.', requestId),
          503,
          cors.headers,
        );
      }
    }

    return jsonResponse(
      stableBody(false, 'INVALID_TRANSITION', 'Invalid status requested.', requestId),
      400,
      cors.headers,
    );
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
