/**
 * Supabase Client Configuration
 * Production-ready Supabase setup with graceful fallback when env vars are missing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder');

if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Supabase features will be disabled. ' +
    'Set these in your Cloudflare Workers build environment variables.',
  );
}

export const supabase: SupabaseClient = createClient(
  isConfigured ? supabaseUrl! : PLACEHOLDER_URL,
  isConfigured ? supabaseAnonKey! : PLACEHOLDER_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: isConfigured,
      persistSession: isConfigured,
      detectSessionInUrl: isConfigured,
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'vibecoding-saas',
      },
    },
  },
);

/** True when Supabase is connected to a real project */
export const isSupabaseConfigured = isConfigured;

// Export types for convenience
export type { UserProfile, UserProfileInsert, UserProfileUpdate } from './database.types';
