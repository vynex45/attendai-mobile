import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
);

// Fallback credentials prevent runtime crash if keys are not provided in environment yet
const defaultUrl = supabaseUrl || 'https://attendai-app.supabase.co';
const defaultKey =
  supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dGVuZGFpLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk5OTk5OTksImV4cCI6MTk5OTk5OTk5OX0.placeholderKey';

export const supabase = createClient(defaultUrl, defaultKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
