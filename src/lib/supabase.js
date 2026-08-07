import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kcnmvggxqcxlbbfgtrwq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjbm12Z2d4cWN4bGJiZmd0cndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzIzNzUsImV4cCI6MjA5OTcwODM3NX0.x_bDyuRfNqiaBQMbzXIGscQbKYV23paJvEgjgujw55k';

function getValidSupabaseUrl(url) {
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed.includes('.supabase.co') || trimmed.includes('127.0.0.1') || trimmed.includes('localhost')) {
      return trimmed.replace(/\/+$/, '');
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function getValidAnonKey(key) {
  if (key && typeof key === 'string') {
    const trimmed = key.trim();
    if (trimmed.length > 20 && !trimmed.includes('missing')) {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = getValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getValidAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

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
