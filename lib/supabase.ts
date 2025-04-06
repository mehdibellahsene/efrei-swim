import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'efrei-swim-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false, // <== set to false
    flowType: 'pkce', // Use PKCE flow for added security
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
});