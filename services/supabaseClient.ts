import { createClient } from '@supabase/supabase-js';

// NOTE: In a real environment, these would be in import.meta.env
// We check if they exist to enable "Real DB" mode, otherwise we use LocalStorage mode.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
