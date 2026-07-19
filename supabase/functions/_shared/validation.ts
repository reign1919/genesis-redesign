export type RegistrationInput = {
  schoolName: string;
  teacherWhatsapp: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: string };

function exactKeys(
  value: Record<string, unknown>,
  expected: string[],
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index]);
}

export function normalizeSchoolName(value: string): string {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

export function normalizePhone(value: string): string {
  return value.normalize('NFKC').replace(/[\s()-]/gu, '').trim();
}

export function validateRegistrationPayload(
  payload: Record<string, unknown>,
): ValidationResult<RegistrationInput> {
  if (!exactKeys(payload, ['schoolName', 'teacherWhatsapp'])) {
    return { ok: false, code: 'INVALID_PAYLOAD' };
  }

  if (
    typeof payload.schoolName !== 'string' ||
    typeof payload.teacherWhatsapp !== 'string'
  ) {
    return { ok: false, code: 'INVALID_PAYLOAD' };
  }

  if (
    payload.schoolName.length > 512 ||
    payload.teacherWhatsapp.length > 64
  ) {
    return { ok: false, code: 'INVALID_PAYLOAD' };
  }

  const schoolName = normalizeSchoolName(payload.schoolName);
  const teacherWhatsapp = normalizePhone(payload.teacherWhatsapp);

  if (
    schoolName.length < 2 ||
    schoolName.length > 120 ||
    /[\u0000-\u001f\u007f]/u.test(schoolName)
  ) {
    return { ok: false, code: 'INVALID_SCHOOL_NAME' };
  }

  if (!/^\+[1-9][0-9]{7,14}$/u.test(teacherWhatsapp)) {
    return { ok: false, code: 'INVALID_PHONE' };
  }

  return {
    ok: true,
    value: { schoolName, teacherWhatsapp },
  };
}

export type AdminTransitionInput = {
  registrationId: string;
  status: 'approved' | 'rejected';
};

export function validateAdminTransition(
  payload: Record<string, unknown>,
): ValidationResult<AdminTransitionInput> {
  if (!exactKeys(payload, ['registrationId', 'status'])) {
    return { ok: false, code: 'INVALID_PAYLOAD' };
  }

  if (
    typeof payload.registrationId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
      .test(payload.registrationId) ||
    (payload.status !== 'approved' && payload.status !== 'rejected')
  ) {
    return { ok: false, code: 'INVALID_TRANSITION' };
  }

  return {
    ok: true,
    value: {
      registrationId: payload.registrationId.toLowerCase(),
      status: payload.status,
    },
  };
}
