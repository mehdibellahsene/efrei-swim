import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dlqtldfwucopraqislao.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscXRsZGZ3dWNvcHJhcWlzbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkzMzgwNzQsImV4cCI6MjAwNDkxNDA3NH0.UoWXNZnj8aXFBYYYj5SdT9g-oYJbD_qGiRONiZ-Ckfg";

// Create a singleton Supabase client with persistent storage
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true, // This ensures the session is stored in local storage
      autoRefreshToken: true, // Automatically refresh the token before it expires
      detectSessionInUrl: true, // Detect if there's a session in the URL (for OAuth)
    },
  }
);
