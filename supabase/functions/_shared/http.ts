export type StableBody = {
  ok: boolean;
  code: string;
  message: string;
  requestId: string;
  [key: string]: unknown;
};

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function stableBody(
  ok: boolean,
  code: string,
  message: string,
  requestId: string,
  extra: Record<string, unknown> = {},
): StableBody {
  return { ok, code, message, requestId, ...extra };
}

export function jsonResponse(
  body: StableBody,
  status: number,
  headers: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}

export async function readJsonObject(
  request: Request,
  maxBytes = 8192,
): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('application/json')) return null;

  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return null;
  }

  if (!rawBody || new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    return null;
  }

  try {
    const value = JSON.parse(rawBody);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
