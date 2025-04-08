import { supabase } from "./supabase";

/**
 * A utility for diagnosing authentication issues
 */
export async function checkAuthConfig() {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const config = {
    supabaseUrlSet: !!supabaseUrl,
    supabaseAnonKeySet: !!supabaseAnonKey,
    currentURL: typeof window !== 'undefined' ? window.location.href : 'server-side',
    origin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
    timestamp: new Date().toISOString(),
  };
  
  // Only attempt Supabase calls in browser
  if (typeof window !== 'undefined') {
    try {
      // Test connection to Supabase
      const { data, error } = await supabase.auth.getSession();
      config['sessionExists'] = !!data?.session;
      config['sessionError'] = error?.message || null;
      
      // Check if cookies are enabled
      config['cookiesEnabled'] = navigator.cookieEnabled;
      
      // Check if localStorage is available
      try {
        localStorage.setItem('authTest', 'test');
        config['localStorageAvailable'] = localStorage.getItem('authTest') === 'test';
        localStorage.removeItem('authTest');
      } catch (e) {
        config['localStorageAvailable'] = false;
        config['localStorageError'] = e.message;
      }
    } catch (e) {
      config['connectionError'] = e.message;
    }
  }
  
  return config;
}
