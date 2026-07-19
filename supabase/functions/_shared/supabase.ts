import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2.110.6';

export type AuthenticatedContext = {
  adminClient: SupabaseClient;
  user: User;
};

export function createAdminClient(): SupabaseClient | null {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function authenticate(
  adminClient: SupabaseClient,
  token: string,
): Promise<User | null> {
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function isAdmin(
  adminClient: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  return !error && data?.is_admin === true;
}
