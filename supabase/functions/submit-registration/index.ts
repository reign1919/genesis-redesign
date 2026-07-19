import { corsDecision } from '../_shared/cors.ts';
import { createRequestId, jsonResponse, readJsonObject, stableBody } from '../_shared/http.ts';
import { safeLog } from '../_shared/logging.ts';
import { clientIp, sha256, verifyTurnstile } from '../_shared/security.ts';
import { createAdminClient } from '../_shared/supabase.ts';
import { validateRegistrationPayload } from '../_shared/validation.ts';

const DUPLICATE_RESPONSES: Record<string, { code: string; message: string }> = {
  duplicate_pending: {
    code: 'ALREADY_PENDING',
    message: 'Your school registration is already awaiting review.',
  },
  duplicate_provisioning: {
    code: 'ALREADY_PENDING',
    message: 'Your school registration is already being reviewed.',
  },
  duplicate_approved: {
    code: 'ALREADY_APPROVED',
    message: 'Your school is already approved. Contact the core committee if you need the credentials again.',
  },
  duplicate_rejected: {
    code: 'REGISTRATION_REJECTED',
    message: 'Thank you for your interest. Your school registration was not approved for this edition of Genesis.',
  },
};

export async function handleSubmitRegistration(
  request: Request,
  dependencies: {
    env?: (name: string) => string;
    createAdminClient?: typeof createAdminClient;
    verifyTurnstile?: typeof verifyTurnstile;
    sha256?: typeof sha256;
  } = {},
): Promise<Response> {
  const env = dependencies.env || ((name: string) => Deno.env.get(name) || '');
  const makeAdminClient = dependencies.createAdminClient || createAdminClient;
  const verifyCaptcha = dependencies.verifyTurnstile || verifyTurnstile;
  const hash = dependencies.sha256 || sha256;
  const requestId = createRequestId();
  const cors = corsDecision(request, ['POST'], env('ALLOWED_ORIGINS'));

  try {
    if (!cors.allowed) {
      return jsonResponse(stableBody(false, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.', requestId), 403, cors.headers);
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors.headers });
    if (request.method !== 'POST') {
      return jsonResponse(stableBody(false, 'METHOD_NOT_ALLOWED', 'This request method is not allowed.', requestId), 405, cors.headers);
    }
    if (env('ENROLLMENT_ENABLED') !== 'true') {
      return jsonResponse(stableBody(false, 'ENROLLMENT_CLOSED', 'School enrollment is temporarily closed.', requestId), 503, cors.headers);
    }

    const payload = await readJsonObject(request);
    if (!payload) {
      return jsonResponse(stableBody(false, 'INVALID_PAYLOAD', 'Check the submitted fields and try again.', requestId), 400, cors.headers);
    }
    const validated = validateRegistrationPayload(payload);
    if (!validated.ok) {
      const message = validated.code === 'INVALID_SCHOOL_NAME'
        ? 'Enter a school name between 2 and 120 characters.'
        : validated.code === 'INVALID_PHONE'
          ? 'Enter the WhatsApp number in international format, such as +919876543210.'
          : validated.code === 'CAPTCHA_REQUIRED'
            ? 'Complete the security check before continuing.'
            : 'Check the submitted fields and try again.';
      return jsonResponse(stableBody(false, validated.code, message, requestId), 400, cors.headers);
    }

    const adminClient = makeAdminClient();
    if (!adminClient) {
      safeLog('error', 'submit_registration_configuration_failed', requestId, { code: 'SUPABASE_CONFIG' });
      return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'Registration is temporarily unavailable.', requestId), 503, cors.headers);
    }

    const ipAddress = clientIp(request);
    const [whatsappHash, ipHash] = await Promise.all([
      hash(validated.value.teacherWhatsapp),
      hash(ipAddress),
    ]);
    const { data: quotaCode, error: quotaError } = await adminClient.rpc(
      'consume_public_registration_attempt',
      { p_whatsapp_hash: whatsappHash, p_ip_hash: ipHash },
    );
    if (quotaError || typeof quotaCode !== 'string') {
      safeLog('error', 'registration_quota_failed', requestId, { code: 'DATABASE_ERROR' });
      return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'Registration is temporarily unavailable.', requestId), 503, cors.headers);
    }
    if (quotaCode.startsWith('rate_limit_')) {
      return jsonResponse(stableBody(false, 'RATE_LIMITED', 'Too many attempts. Try again later.', requestId), 429, cors.headers);
    }

    const captcha = await verifyCaptcha(validated.value.captchaToken, ipAddress, requestId, {
      secret: env('TURNSTILE_SECRET_KEY'),
      expectedHostnames: env('TURNSTILE_EXPECTED_HOSTNAMES'),
      expectedAction: env('TURNSTILE_REGISTRATION_ACTION') || 'submit_registration',
    });
    if (!captcha.ok) {
      const invalid = captcha.code === 'CAPTCHA_INVALID';
      return jsonResponse(
        stableBody(false, invalid ? 'CAPTCHA_INVALID' : 'SERVICE_UNAVAILABLE', invalid ? 'The security check expired or was invalid. Try again.' : 'Registration is temporarily unavailable.', requestId),
        invalid ? 400 : 503,
        cors.headers,
      );
    }

    const captchaHash = await hash(validated.value.captchaToken);
    const { data: creationCode, error: creationError } = await adminClient.rpc(
      'create_public_registration',
      {
        p_school_name: validated.value.schoolName,
        p_teacher_whatsapp: validated.value.teacherWhatsapp,
        p_captcha_hash: captchaHash,
        p_subject_hash: whatsappHash,
      },
    );
    if (creationError || typeof creationCode !== 'string') {
      safeLog('error', 'registration_creation_failed', requestId, { code: 'DATABASE_ERROR' });
      return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'Registration is temporarily unavailable.', requestId), 503, cors.headers);
    }
    if (creationCode === 'captcha_reused') {
      return jsonResponse(stableBody(false, 'CAPTCHA_INVALID', 'The security check expired or was invalid. Try again.', requestId), 400, cors.headers);
    }
    const duplicate = DUPLICATE_RESPONSES[creationCode];
    if (duplicate) {
      return jsonResponse(stableBody(false, duplicate.code, duplicate.message, requestId), 409, cors.headers);
    }
    if (creationCode !== 'created') {
      safeLog('error', 'registration_creation_invalid_result', requestId, { code: creationCode });
      return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'Registration is temporarily unavailable.', requestId), 503, cors.headers);
    }

    safeLog('info', 'registration_created', requestId, { status: 'pending' });
    return jsonResponse(
      stableBody(true, 'REGISTRATION_SUBMITTED', 'Application received. The core committee will contact approved schools on WhatsApp.', requestId),
      201,
      cors.headers,
    );
  } catch {
    safeLog('error', 'submit_registration_unhandled_failure', requestId, { code: 'UNEXPECTED_ERROR' });
    return jsonResponse(stableBody(false, 'SERVICE_UNAVAILABLE', 'Registration is temporarily unavailable.', requestId), 503, cors.headers);
  }
}

if (import.meta.main) Deno.serve((request) => handleSubmitRegistration(request));
