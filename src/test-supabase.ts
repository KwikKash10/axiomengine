import { createClient } from '@supabase/supabase-js';

// Direct hardcoded values for testing
const supabaseUrl = 'https://ccbvfyyxdlojebatfupf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYnZmeXl4ZGxvamViYXRmdXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzIyMDEsImV4cCI6MjA1NzU0ODIwMX0.JWgLVke_wTgRx9hjTfn4rKwTkS2B8vVzq8pAP_HSna8';

console.log('[Test] Creating Supabase client...');
console.log('[Test] URL:', supabaseUrl);
console.log('[Test] Key length:', supabaseAnonKey.length);

// Create direct client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function
async function testConnection() {
  console.log('[Test] Testing connection...');
  
  try {
    // Test auth endpoint
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Test] Connection test failed:', error.message);
    } else {
      console.log('[Test] Connection successful!', data);
    }
    
    // Try signing in with test credentials (this will fail but should give different error than invalid API key)
    console.log('[Test] Testing signInWithPassword...');
    const signInResult = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123',
    });
    
    console.log('[Test] Sign-in result:', 
      signInResult.error ? `Error: ${signInResult.error.message}` : 'Success!');
      
  } catch (err) {
    console.error('[Test] Test exception:', err);
  }
}

// Run test immediately
testConnection().catch(console.error); 