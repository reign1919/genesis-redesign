import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kcnmvggxqcxlbbfgtrwq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjbm12Z2d4cWN4bGJiZmd0cndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzIzNzUsImV4cCI6MjA5OTcwODM3NX0.x_bDyuRfNqiaBQMbzXIGscQbKYV23paJvEgjgujw55k';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const publicSupabaseUrl = supabaseUrl;
export const publicSupabaseKey = supabaseAnonKey;
export const isSupabaseConfigured = Boolean(publicSupabaseUrl && publicSupabaseKey);

export const supabase = createClient(publicSupabaseUrl, publicSupabaseKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'genesis-supabase-auth',
  },
});
