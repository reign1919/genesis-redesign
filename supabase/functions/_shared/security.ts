export type TurnstileResult =
  | { ok: true }
  | {
    ok: false;
    code: 'CAPTCHA_INVALID' | 'CAPTCHA_UNAVAILABLE' | 'CONFIGURATION_ERROR';
  };

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

export function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer ([^\s]+)$/u.exec(authorization);
  if (!match || match[1].length > 4096) return null;
  return match[1];
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) return 'unknown';

  // Supabase's managed gateway is expected to append or replace this header.
  // Taking the last valid value avoids trusting a caller-prepended address.
  const candidates = forwardedFor.split(',').map((value) => value.trim())
    .filter(Boolean);
  const candidate = candidates.at(-1) || 'unknown';
  if (candidate.length > 64) return 'unknown';

  const ipv4Parts = candidate.split('.');
  if (
    ipv4Parts.length === 4 &&
    ipv4Parts.every((part) => /^[0-9]{1,3}$/u.test(part) && Number(part) <= 255)
  ) {
    return ipv4Parts.map((part) => String(Number(part))).join('.');
  }

  if (!candidate.includes(':') || candidate.includes('%')) return 'unknown';
  try {
    const parsed = new URL(`http://[${candidate}]/`);
    const hostname = parsed.hostname.replace(/^\[|\]$/gu, '').toLowerCase();
    return hostname.includes(':') ? hostname : 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyTurnstile(
  token: string,
  remoteIp: string,
  requestId: string,
  options: {
    secret: string;
    expectedHostnames: string;
    expectedAction: string;
    fetchImpl?: typeof fetch;
  },
): Promise<TurnstileResult> {
  const expectedHostnames = new Set(
    options.expectedHostnames.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean),
  );

  if (
    !options.secret || !options.expectedAction || expectedHostnames.size === 0
  ) {
    return { ok: false, code: 'CONFIGURATION_ERROR' };
  }

  const form = new URLSearchParams({
    secret: options.secret,
    response: token,
    idempotency_key: requestId,
  });
  if (remoteIp !== 'unknown') form.set('remoteip', remoteIp);

  let response: Response;
  try {
    response = await (options.fetchImpl || fetch)(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    return { ok: false, code: 'CAPTCHA_UNAVAILABLE' };
  }

  if (!response.ok) return { ok: false, code: 'CAPTCHA_UNAVAILABLE' };

  let result: TurnstileResponse;
  try {
    result = await response.json() as TurnstileResponse;
  } catch {
    return { ok: false, code: 'CAPTCHA_UNAVAILABLE' };
  }

  if (
    result.success !== true ||
    !result.hostname ||
    !expectedHostnames.has(result.hostname.toLowerCase()) ||
    result.action !== options.expectedAction
  ) {
    return { ok: false, code: 'CAPTCHA_INVALID' };
  }

  return { ok: true };
}
