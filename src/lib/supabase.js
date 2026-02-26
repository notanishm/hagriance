import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Simplified client initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (!error) return null;
  console.error('Supabase errorDetails:', error);

  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password',
    'User already registered': 'An account with this email already exists',
    'Email not confirmed': 'Please verify your email before logging in',
    'Invalid token': 'Your session has expired. Please log in again',
  };

  return errorMessages[error.message] || error.message || 'An unexpected error occurred';
};

export default supabase;
