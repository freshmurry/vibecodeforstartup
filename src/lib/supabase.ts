/**
 * Supabase Client Configuration
 * Production-ready Supabase setup
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-actual')) {
  console.warn('Supabase not configured - using placeholder client');
  // Create a mock client for development
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'vibecoding-saas',
    },
  },
});

// Export types for convenience
export type { UserProfile, UserProfileInsert, UserProfileUpdate } from './database.types';