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
