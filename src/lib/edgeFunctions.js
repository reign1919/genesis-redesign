import {
  isSupabaseConfigured,
  publicSupabaseKey,
  publicSupabaseUrl,
  supabase,
} from './supabase';

async function callFunction(name, { method, body, authenticated = true }) {
  if (!isSupabaseConfigured) return { ok: false, code: 'SERVICE_UNAVAILABLE' };

  let accessToken = null;
  if (authenticated) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    accessToken = sessionData?.session?.access_token;
    if (sessionError || !accessToken) return { ok: false, code: 'AUTH_REQUIRED' };
  }

  let response;
  try {
    response = await fetch(`${publicSupabaseUrl}/functions/v1/${name}`, {
      method,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        apikey: publicSupabaseKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`[Edge Function ${name} Fetch Network Error]`, err);
    return { ok: false, code: 'SERVICE_UNAVAILABLE' };
  }

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    console.error(`[Edge Function ${name} Parse Error] Status: ${response?.status}`, err);
    return { ok: false, code: 'SERVICE_UNAVAILABLE' };
  }

  if (!payload || typeof payload !== 'object' || typeof payload.code !== 'string') {
    console.error(`[Edge Function ${name} Invalid Payload]`, payload);
    return { ok: false, code: 'SERVICE_UNAVAILABLE' };
  }

  if (!response.ok || payload.ok !== true) {
    console.error(`[Edge Function ${name} Error Response] Code: ${payload.code}, Message: ${payload.message}`);
  }

  return {
    ...payload,
    ok: response.ok && payload.ok === true,
  };
}

export function submitRegistration(body) {
  return callFunction('submit-registration', { method: 'POST', body, authenticated: false });
}

export function listAdminRegistrations() {
  return callFunction('admin-registrations', { method: 'GET' });
}

export function updateAdminRegistration(registrationId, status) {
  return callFunction('admin-registrations', {
    method: 'PATCH',
    body: { registrationId, status },
  });
}

export function loadSchoolCredentials() {
  return callFunction('school-credentials', { method: 'GET' });
}
