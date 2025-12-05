/**
 * supabase-client.js
 * Supabase initialization and singleton instance
 * 
 * Provides centralized access to the Supabase client used by other modules.
 */

// Supabase configuration
const SUPABASE_URL = 'https://kgnqutpeerhmlddhjoza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbnF1dHBlZXJobWxkZGhqb3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDI0NzYsImV4cCI6MjA2ODk3ODQ3Nn0.TWQq1X9T4rQXOd13xLkBkuEhbgpn1ygm4dJtHMq4Sco';

let supabaseInstance = null;

/**
 * Initialize Supabase client
 * @returns {Object} Supabase client instance
 */
export function initializeSupabase() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase library not loaded from CDN');
    }

    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

/**
 * Get Supabase client instance (ensures initialization)
 * @returns {Object} Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    return initializeSupabase();
  }
  return supabaseInstance;
}

export default {
  initializeSupabase,
  getSupabaseClient
};
