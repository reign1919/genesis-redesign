const LOCAL_DEVELOPMENT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

export type CorsDecision = {
  allowed: boolean;
  headers: Headers;
};

function isValidConfiguredOrigin(value: string): boolean {
  if (!value || value === '*') return false;

  try {
    const url = new URL(value);
    const isLocal = url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1';
    return url.origin === value &&
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' || (url.protocol === 'http:' && isLocal));
  } catch {
    return false;
  }
}

export function allowedOrigins(configuredOrigins = ''): Set<string> {
  const origins = new Set(LOCAL_DEVELOPMENT_ORIGINS);

  for (const candidate of configuredOrigins.split(',')) {
    const origin = candidate.trim();
    if (isValidConfiguredOrigin(origin)) origins.add(origin);
  }

  return origins;
}

export function corsDecision(
  request: Request,
  methods: string[],
  configuredOrigins = '',
): CorsDecision {
  const origin = request.headers.get('origin');
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': [...methods, 'OPTIONS'].join(', '),
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  });

  if (!origin) return { allowed: true, headers };
  if (!allowedOrigins(configuredOrigins).has(origin)) {
    return { allowed: false, headers };
  }

  headers.set('Access-Control-Allow-Origin', origin);
  return { allowed: true, headers };
}
