/**
 * auth-manager.js
 * Authentication and user state management
 * 
 * Manages Supabase OAuth authentication, user sessions, and auth state.
 */

import { getSupabaseClient } from './supabase-client.js';
import { setInLocalStorage, getFromLocalStorage, removeFromLocalStorage } from './storage-manager.js';
import { showErrorToast, logError } from './error-handler.js';

// Auth state
export const authState = {
  user: null,
  authenticated: false,
  session: null,
  email: null
};

let supabase = null;
let otpEmail = null;

/**
 * Initialize authentication system
 * @returns {Promise<boolean>} True if auth initialized successfully
 */
export async function initializeAuthFlow() {
  try {
    console.log('[AUTH] Initializing auth flow');
    
    supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AUTH] Failed to get session:', error);
      return false;
    }

    if (session && session.user) {
      authState.session = session;
      authState.user = session.user;
      authState.authenticated = true;
      authState.email = session.user.email;
      console.log('[AUTH] Existing session restored:', session.user.email);
      updateAuthUI();
      return true;
    }

    // Check localStorage for cached auth
    const cachedAuth = getFromLocalStorage('spelldle_auth_session');
    if (cachedAuth) {
      authState.email = cachedAuth.email;
      console.log('[AUTH] Cached auth found:', cachedAuth.email);
    }

    console.log('[AUTH] No active session');
    return false;
  } catch (error) {
    console.error('[AUTH] Auth initialization failed:', error);
    logError('auth initialization', error);
    return false;
  }
}

/**
 * Send OTP to email
 * @param {string} email - Email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendOTP(email) {
  try {
    console.log('[AUTH] Sending OTP to:', email);

    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      throw error;
    }

    // Cache email for reference
    otpEmail = email;
    setInLocalStorage('spelldle_otp_email', email);

    console.log('[AUTH] OTP sent successfully to:', email);
    return { success: true, message: 'Check your email for the verification code' };
  } catch (error) {
    console.error('[AUTH] Failed to send OTP:', error);
    logError('send OTP', error);
    return { success: false, message: error.message || 'Failed to send verification code' };
  }
}

/**
 * Verify OTP and complete authentication
 * @param {string} email - Email address
 * @param {string} token - OTP token (6 digits)
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
export async function verifyOTP(email, token) {
  try {
    console.log('[AUTH] Verifying OTP for:', email);

    if (!email || !token || token.length !== 6) {
      throw new Error('Invalid email or token');
    }

    supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });

    if (error) {
      throw error;
    }

    if (!data.session || !data.user) {
      throw new Error('Session not created');
    }

    // Update auth state
    authState.session = data.session;
    authState.user = data.user;
    authState.authenticated = true;
    authState.email = data.user.email;

    // Cache auth info
    setInLocalStorage('spelldle_auth_session', {
      userId: data.user.id,
      email: data.user.email,
      authenticatedAt: new Date().toISOString()
    });

    removeFromLocalStorage('spelldle_otp_email');
    otpEmail = null;

    console.log('[AUTH] User authenticated:', data.user.email);
    updateAuthUI();

    return {
      success: true,
      message: 'Authentication successful',
      user: data.user
    };
  } catch (error) {
    console.error('[AUTH] Failed to verify OTP:', error);
    logError('verify OTP', error);
    return { success: false, message: error.message || 'Invalid verification code' };
  }
}

/**
 * Logout current user
 * @returns {Promise<boolean>} True if logout successful
 */
export async function logout() {
  try {
    console.log('[AUTH] Logging out');

    supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // Clear auth state
    authState.user = null;
    authState.authenticated = false;
    authState.session = null;
    authState.email = null;

    // Clear cached auth
    removeFromLocalStorage('spelldle_auth_session');
    removeFromLocalStorage('spelldle_otp_email');
    otpEmail = null;

    console.log('[AUTH] User logged out');
    updateAuthUI();
    showErrorToast('Logged out successfully', 'success', 2000);

    return true;
  } catch (error) {
    console.error('[AUTH] Logout failed:', error);
    logError('logout', error);
    return false;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return authState.authenticated && authState.user !== null;
}

/**
 * Get current user
 * @returns {Object|null}
 */
export function getCurrentUser() {
  return authState.user;
}

/**
 * Get current user email
 * @returns {string|null}
 */
export function getCurrentUserEmail() {
  return authState.email;
}

/**
 * Show authentication modal
 */
export function showAuthModal() {
  try {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      const emailPhase = document.getElementById('emailPhase');
      if (emailPhase) {
        emailPhase.style.display = 'flex';
      }
      const otpPhase = document.getElementById('otpPhase');
      if (otpPhase) {
        otpPhase.style.display = 'none';
      }
      console.log('[AUTH] Auth modal displayed');
    }
  } catch (error) {
    console.error('[AUTH] Failed to show auth modal:', error);
  }
}

/**
 * Hide authentication modal
 */
export function hideAuthModal() {
  try {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'none';
      console.log('[AUTH] Auth modal hidden');
    }
  } catch (error) {
    console.error('[AUTH] Failed to hide auth modal:', error);
  }
}

/**
 * Show email phase of auth modal
 */
export function showEmailPhase() {
  try {
    const emailPhase = document.getElementById('emailPhase');
    const otpPhase = document.getElementById('otpPhase');
    
    if (emailPhase) emailPhase.style.display = 'flex';
    if (otpPhase) otpPhase.style.display = 'none';
  } catch (error) {
    console.error('[AUTH] Failed to show email phase:', error);
  }
}

/**
 * Show OTP phase of auth modal
 */
export function showOTPPhase() {
  try {
    const emailPhase = document.getElementById('emailPhase');
    const otpPhase = document.getElementById('otpPhase');
    
    if (emailPhase) emailPhase.style.display = 'none';
    if (otpPhase) otpPhase.style.display = 'flex';
  } catch (error) {
    console.error('[AUTH] Failed to show OTP phase:', error);
  }
}

/**
 * Update auth UI elements (buttons, status)
 */
function updateAuthUI() {
  try {
    const signInLink = document.getElementById('signInLink');
    const logoutLink = document.getElementById('logoutLink');
    const authStatus = document.getElementById('authStatus');

    if (isAuthenticated()) {
      // User is authenticated
      if (signInLink) signInLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline-block';
      if (authStatus) {
        authStatus.textContent = `Signed in as ${authState.email}`;
        authStatus.style.display = 'block';
      }
    } else {
      // User is not authenticated
      if (signInLink) signInLink.style.display = 'inline-block';
      if (logoutLink) logoutLink.style.display = 'none';
      if (authStatus) authStatus.style.display = 'none';
    }
  } catch (error) {
    console.error('[AUTH] Failed to update auth UI:', error);
  }
}

/**
 * Setup auth button event listeners
 */
export function setupAuthListeners() {
  try {
    // Sign in button
    const signInLink = document.getElementById('signInLink');
    if (signInLink) {
      signInLink.onclick = (e) => {
        e.preventDefault();
        showAuthModal();
      };
    }

    // Logout button
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.onclick = (e) => {
        e.preventDefault();
        logout();
      };
    }

    console.log('[AUTH] Auth listeners setup');
  } catch (error) {
    console.error('[AUTH] Failed to setup auth listeners:', error);
  }
}

export default {
  authState,
  initializeAuthFlow,
  sendOTP,
  verifyOTP,
  logout,
  isAuthenticated,
  getCurrentUser,
  getCurrentUserEmail,
  showAuthModal,
  hideAuthModal,
  showEmailPhase,
  showOTPPhase,
  setupAuthListeners
};
