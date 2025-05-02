import { createClient } from '@supabase/supabase-js'

// HARDCODED VALUES FROM MAIN APP - exact copy of what works there
const supabaseUrl = 'https://ccbvfyyxdlojebatfupf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYnZmeXl4ZGxvamViYXRmdXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzIyMDEsImV4cCI6MjA1NzU0ODIwMX0.JWgLVke_wTgRx9hjTfn4rKwTkS2B8vVzq8pAP_HSna8';

// Create Supabase client with auth configuration from Main app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Log configuration for debugging
console.log('[Supabase] Client configured with URL:', supabaseUrl);
console.log('[Supabase] Anon key length:', supabaseAnonKey.length);

// Test connection function
export async function testSupabaseConnection() {
  try {
    // Test auth connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Supabase] Connection test failed:', error.message);
      return false;
    }
    
    console.log('[Supabase] Connection test successful:', data.session ? 'Session active' : 'No active session');
    return true;
  } catch (err) {
    console.error('[Supabase] Connection test exception:', err);
    return false;
  }
}

// Run test immediately
testSupabaseConnection().then(success => {
  console.log('[Supabase] Connection status:', success ? 'SUCCESS' : 'FAILED');
}); 