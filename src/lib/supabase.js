import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const publicSupabaseUrl = supabaseUrl || 'http://127.0.0.1:54321';
export const publicSupabaseKey = supabaseAnonKey || 'missing-public-key';

export const supabase = createClient(publicSupabaseUrl, publicSupabaseKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'genesis-supabase-auth',
  },
});
