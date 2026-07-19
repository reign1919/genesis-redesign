import { corsDecision } from '../_shared/cors.ts';
import { bearerToken, clientIp } from '../_shared/security.ts';
import { validateAdminTransition, validateRegistrationPayload } from '../_shared/validation.ts';
import { handleAdminRegistrations } from '../admin-registrations/index.ts';
import { handleSubmitRegistration } from '../submit-registration/index.ts';
import { decryptPassword, encryptPassword, generateSchoolPassword } from '../_shared/credentials.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown, message: string) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) {
    throw new Error(`${message}: expected ${right}, received ${left}`);
  }
}

async function responseBody(response: Response) {
  return await response.json() as Record<string, unknown>;
}

Deno.test('registration validation rejects unknown and malformed fields', () => {
  assertEquals(
    validateRegistrationPayload({
      schoolName: 'School A',
      teacherWhatsapp: '+919876543210',
      userId: 'caller-controlled',
    }),
    { ok: false, code: 'INVALID_PAYLOAD' },
    'unknown identity field must fail',
  );
  assertEquals(
    validateRegistrationPayload({
      schoolName: 'A',
      teacherWhatsapp: '+919876543210',
    }),
    { ok: false, code: 'INVALID_SCHOOL_NAME' },
    'short school name must fail',
  );
  assertEquals(
    validateRegistrationPayload({
      schoolName: 'School A',
      teacherWhatsapp: '9876543210',
    }),
    { ok: false, code: 'INVALID_PHONE' },
    'non-E.164 phone must fail',
  );
});

Deno.test('school passwords use eight unambiguous mixed characters and encrypted display storage', async () => {
  for (let index = 0; index < 50; index += 1) {
    const password = generateSchoolPassword();
    assert(/^[A-HJ-NP-Za-km-z2-9!@#$%]{8}$/u.test(password), 'password alphabet and length');
    assert(
      /[A-Z]/u.test(password) && /[a-z]/u.test(password) && /[0-9]/u.test(password) && /[!@#$%]/u.test(password),
      'password must contain uppercase, lowercase, digit, and symbol',
    );
  }
  const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encrypted = await encryptPassword('ABCD2345', key);
  assert(encrypted.ciphertext !== 'ABCD2345', 'plaintext is not stored');
  assertEquals(await decryptPassword(encrypted.ciphertext, encrypted.iv, key), 'ABCD2345', 'encrypted password round trip');
});

Deno.test('CORS uses an exact allowlist and always varies on Origin', () => {
  const allowed = corsDecision(
    new Request('https://function.example', {
      headers: { Origin: 'https://genesis.example' },
    }),
    ['POST'],
    'https://genesis.example',
  );
  assert(allowed.allowed, 'configured origin should be accepted');
  assertEquals(
    allowed.headers.get('Access-Control-Allow-Origin'),
    'https://genesis.example',
    'exact origin',
  );
  assertEquals(allowed.headers.get('Vary'), 'Origin', 'Vary header');

  const reflected = corsDecision(
    new Request('https://function.example', {
      headers: { Origin: 'https://evil.example' },
    }),
    ['POST'],
    '*',
  );
  assert(
    !reflected.allowed,
    'wildcard configuration must not reflect an attacker origin',
  );
  assertEquals(
    reflected.headers.get('Access-Control-Allow-Origin'),
    null,
    'attacker origin must be absent',
  );
});

Deno.test('bearer and proxy parsing reject malformed caller-controlled data', () => {
  assertEquals(
    bearerToken(new Request('https://example.test')),
    null,
    'missing token',
  );
  assertEquals(
    bearerToken(
      new Request('https://example.test', {
        headers: { Authorization: 'Bearer valid.jwt' },
      }),
    ),
    'valid.jwt',
    'valid bearer',
  );
  assertEquals(
    clientIp(
      new Request('https://example.test', {
        headers: { 'x-forwarded-for': 'spoofed, 203.0.113.10' },
      }),
    ),
    '203.0.113.10',
    'last trusted proxy value',
  );
  assertEquals(
    clientIp(
      new Request('https://example.test', {
        headers: { 'x-forwarded-for': 'attacker-controlled' },
      }),
    ),
    'unknown',
    'invalid proxy data fails closed',
  );
});

Deno.test('submit handler creates a public registration after validation and quota checks', async () => {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const adminClient = {
    rpc(name: string, parameters: Record<string, unknown>) {
      calls.push([name, parameters]);
      return Promise.resolve({
        data: name === 'consume_public_registration_attempt' ? 'ok' : 'created',
        error: null,
      });
    },
  };
  const response = await handleSubmitRegistration(
    new Request('https://function.example', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({
        schoolName: '  School   A  ',
        teacherWhatsapp: '+91 98765 43210',
      }),
    }),
    {
      env: (name) =>
        ({
          ENROLLMENT_ENABLED: 'true',
        })[name] || '',
      createAdminClient: () => adminClient as never,
      sha256: () => Promise.resolve('a'.repeat(64)),
    },
  );

  assertEquals(response.status, 201, 'created status');
  assertEquals(
    (await responseBody(response)).code,
    'REGISTRATION_SUBMITTED',
    'created code',
  );
  assertEquals(calls[1][0], 'create_public_registration', 'atomic creation RPC');
  assertEquals(calls[1][1].p_school_name, 'School A', 'normalized school');
  assertEquals(
    calls[1][1].p_teacher_whatsapp,
    '+919876543210',
    'normalized phone',
  );
});

Deno.test('submit handler returns stable rate and duplicate failures', async () => {
  const baseRequest = () =>
    new Request('https://function.example', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolName: 'School A',
        teacherWhatsapp: '+919876543210',
      }),
    });
  const baseDependencies = {
    env: (name: string) => name === 'ENROLLMENT_ENABLED' ? 'true' : 'configured',
    sha256: () => Promise.resolve('a'.repeat(64)),
  };

  const limited = await handleSubmitRegistration(baseRequest(), {
    ...baseDependencies,
    createAdminClient: () =>
      ({
        rpc: () => Promise.resolve({ data: 'rate_limit_whatsapp', error: null }),
      }) as never,
  });
  assertEquals(limited.status, 429, 'rate status');
  assertEquals((await responseBody(limited)).code, 'RATE_LIMITED', 'rate code');

  let rpcCall = 0;
  const duplicate = await handleSubmitRegistration(baseRequest(), {
    ...baseDependencies,
    createAdminClient: () =>
      ({
        rpc: () =>
          Promise.resolve({
            data: rpcCall++ === 0 ? 'ok' : 'duplicate_rejected',
            error: null,
          }),
      }) as never,
  });
  assertEquals(duplicate.status, 409, 'duplicate status');
  assertEquals(
    (await responseBody(duplicate)).code,
    'REGISTRATION_REJECTED',
    'duplicate code',
  );
});

Deno.test('admin handler rejects missing JWT, invalid JWT, and non-admin callers', async () => {
  const missing = await handleAdminRegistrations(
    new Request('https://function.example'),
    { env: () => '' },
  );
  assertEquals(
    (await responseBody(missing)).code,
    'AUTH_REQUIRED',
    'missing admin JWT',
  );

  const invalid = await handleAdminRegistrations(
    new Request('https://function.example', {
      headers: { Authorization: 'Bearer invalid' },
    }),
    {
      env: () => '',
      createAdminClient: () => ({}) as never,
      authenticate: () => Promise.resolve(null),
    },
  );
  assertEquals(
    (await responseBody(invalid)).code,
    'AUTH_INVALID',
    'invalid admin JWT',
  );

  const expired = await handleAdminRegistrations(
    new Request('https://function.example', {
      headers: { Authorization: 'Bearer expired' },
    }),
    {
      env: () => '',
      createAdminClient: () => ({}) as never,
      authenticate: () => Promise.resolve(null),
    },
  );
  assertEquals(expired.status, 401, 'expired admin JWT status');
  assertEquals(
    (await responseBody(expired)).code,
    'AUTH_INVALID',
    'expired admin JWT',
  );

  const nonAdmin = await handleAdminRegistrations(
    new Request('https://function.example', {
      headers: { Authorization: 'Bearer valid' },
    }),
    {
      env: () => '',
      createAdminClient: () => ({}) as never,
      authenticate: () => Promise.resolve({ id: 'school-user' } as never),
      isAdmin: () => Promise.resolve(false),
    },
  );
  assertEquals(nonAdmin.status, 403, 'non-admin status');
  assertEquals(
    (await responseBody(nonAdmin)).code,
    'FORBIDDEN',
    'non-admin code',
  );
  assertEquals(
    nonAdmin.headers.get('Cache-Control'),
    'no-store',
    'authorization failures must not be cached',
  );
});

Deno.test('admin transition validation rejects mass assignment and invalid states', () => {
  for (
    const protectedField of [
      'is_admin',
      'isAdmin',
      'school_code',
      'schoolCode',
      'user_id',
      'userId',
      'email',
      'school_name',
      'teacher_whatsapp',
      'created_at',
      'arbitrary',
    ]
  ) {
    assertEquals(
      validateAdminTransition({
        registrationId: '10000000-0000-4000-8000-000000000001',
        status: 'approved',
        [protectedField]: 'caller-controlled',
      }),
      { ok: false, code: 'INVALID_PAYLOAD' },
      `protected field ${protectedField}`,
    );
  }
  assertEquals(
    validateAdminTransition({
      registrationId: '10000000-0000-4000-8000-000000000001',
      status: 'pending',
    }),
    { ok: false, code: 'INVALID_TRANSITION' },
    'pending transition',
  );
});

Deno.test('normal users cannot invoke any admin list or transition operation', async () => {
  let dataAccesses = 0;
  const adminClient = {
    from() {
      dataAccesses += 1;
      throw new Error('non-admin reached database access');
    },
  };
  const dependencies = {
    env: () => '',
    createAdminClient: () => adminClient as never,
    authenticate: () => Promise.resolve({ id: 'school-user' } as never),
    isAdmin: () => Promise.resolve(false),
  };
  const requests = [
    new Request('https://function.example', {
      method: 'GET',
      headers: { Authorization: 'Bearer school-token' },
    }),
    ...(['approved', 'rejected'] as const).map((status) =>
      new Request('https://function.example', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer school-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: '10000000-0000-4000-8000-000000000001',
          status,
        }),
      })
    ),
    new Request('https://function.example', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer school-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId: '10000000-0000-4000-8000-000000000001',
        status: 'approved',
        is_admin: true,
        school_code: 'GEN-000001',
        user_id: 'attacker-user',
      }),
    }),
  ];

  for (const request of requests) {
    const response = await handleAdminRegistrations(request, dependencies);
    const body = await responseBody(response);
    assertEquals(response.status, 403, `${request.method} non-admin status`);
    assertEquals(body.code, 'FORBIDDEN', `${request.method} non-admin code`);
    assert(
      !JSON.stringify(body).includes('school-token'),
      'authorization response must not expose the JWT',
    );
  }
  assertEquals(dataAccesses, 0, 'non-admin never reaches registration data');
});

Deno.test('admin handler rejects extra fields before performing an update', async () => {
  let updates = 0;
  const adminClient = {
    from() {
      return {
        update() {
          updates += 1;
          throw new Error('mass assignment reached update');
        },
      };
    },
  };
  const response = await handleAdminRegistrations(
    new Request('https://function.example', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer admin-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId: '10000000-0000-4000-8000-000000000001',
        status: 'approved',
        school_code: 'GEN-999999',
      }),
    }),
    {
      env: () => '',
      createAdminClient: () => adminClient as never,
      authenticate: () => Promise.resolve({ id: 'admin-user' } as never),
      isAdmin: () => Promise.resolve(true),
    },
  );

  assertEquals(response.status, 400, 'mass-assignment status');
  assertEquals(
    (await responseBody(response)).code,
    'INVALID_PAYLOAD',
    'mass-assignment code',
  );
  assertEquals(updates, 0, 'invalid payload never reaches update');
});

Deno.test('admin CORS denies attacker origins before authentication', async () => {
  let authenticationAttempts = 0;
  for (const method of ['GET', 'PATCH', 'OPTIONS']) {
    const response = await handleAdminRegistrations(
      new Request('https://function.example', {
        method,
        headers: {
          Authorization: 'Bearer attacker-token',
          Origin: 'https://attacker.example',
          'Content-Type': 'application/json',
        },
        body: method === 'PATCH' ? '{}' : undefined,
      }),
      {
        env: (name) => name === 'ALLOWED_ORIGINS' ? 'https://genesis.example' : '',
        authenticate: () => {
          authenticationAttempts += 1;
          return Promise.resolve({ id: 'admin-user' } as never);
        },
      },
    );
    assertEquals(response.status, 403, `${method} attacker-origin status`);
    assertEquals(
      response.headers.get('Access-Control-Allow-Origin'),
      null,
      `${method} attacker origin is not reflected`,
    );
    assertEquals(response.headers.get('Vary'), 'Origin', `${method} Vary header`);
  }
  assertEquals(authenticationAttempts, 0, 'CORS denial happens before authentication');
});

Deno.test('admin mutations require a bearer token and are not ambient-cookie CSRF capable', async () => {
  let dataAccesses = 0;
  const response = await handleAdminRegistrations(
    new Request('https://function.example', {
      method: 'PATCH',
      headers: {
        Cookie: 'genesis-supabase-auth=attacker-forged-cookie',
        Origin: 'https://genesis.example',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId: '10000000-0000-4000-8000-000000000001',
        status: 'approved',
      }),
    }),
    {
      env: (name) => name === 'ALLOWED_ORIGINS' ? 'https://genesis.example' : '',
      createAdminClient: () => {
        dataAccesses += 1;
        return {} as never;
      },
    },
  );

  assertEquals(response.status, 401, 'cookie-only mutation status');
  assertEquals(
    (await responseBody(response)).code,
    'AUTH_REQUIRED',
    'cookie-only mutation code',
  );
  assertEquals(dataAccesses, 0, 'cookie-only request never reaches data access');
});

Deno.test('admin handler lists credentials and performs explicit rejection', async () => {
  const makeClient = (updatedStatus = 'approved') => ({
    from() {
      const chain = {
        select() {
          return chain;
        },
        order() {
          return chain;
        },
        limit() {
          return Promise.resolve({ data: [], error: null });
        },
        update() {
          return chain;
        },
        eq() {
          return chain;
        },
        maybeSingle() {
          return Promise.resolve({
            data: {
              id: '10000000-0000-4000-8000-000000000001',
              status: updatedStatus,
            },
            error: null,
          });
        },
      };
      return chain;
    },
  });
  const authDependencies = (status?: string) => ({
    env: (name: string) => name === 'SCHOOL_CREDENTIAL_ENCRYPTION_KEY'
      ? btoa('12345678901234567890123456789012')
      : '',
    createAdminClient: () => makeClient(status) as never,
    authenticate: () => Promise.resolve({ id: 'admin-user' } as never),
    isAdmin: () => Promise.resolve(true),
  });

  const list = await handleAdminRegistrations(
    new Request('https://function.example', {
      headers: { Authorization: 'Bearer admin' },
    }),
    authDependencies(),
  );
  assertEquals(list.status, 200, 'admin list status');
  assertEquals(
    (await responseBody(list)).code,
    'REGISTRATIONS_LISTED',
    'admin list code',
  );

  for (const status of ['rejected'] as const) {
    const response = await handleAdminRegistrations(
      new Request('https://function.example', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer admin',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: '10000000-0000-4000-8000-000000000001',
          status,
        }),
      }),
      authDependencies(status),
    );
    assertEquals(response.status, 200, `${status} status`);
    assertEquals(
      (await responseBody(response)).code,
      'REGISTRATION_UPDATED',
      `${status} code`,
    );
  }
});
