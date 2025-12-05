/**
 * app.js
 * Main application orchestrator
 * 
 * Central coordinator for game lifecycle, phase management, and module integration.
 * (Phase 7: Will be fully implemented)
 */

// Import pure modules (no dependencies)
import { evaluateGuess, getFeedback } from './game-engine.js';
import { getFromLocalStorage, setInLocalStorage } from './storage-manager.js';
import { getSupabaseClient } from './supabase-client.js';

export async function initialize() {
  console.log('[APP] Initializing application');
  
  try {
    // Phase 2: Initialize core modules
    console.log('[APP] Loading pure modules...');
    
    // Test game-engine functions
    const testEval = evaluateGuess('test', 'test');
    console.log('[APP] game-engine.evaluateGuess working:', testEval);
    
    // Test storage functions
    const testStorage = getFromLocalStorage('test_key', 'default');
    console.log('[APP] storage-manager working:', typeof testStorage !== 'undefined');
    
    // Test supabase client
    const supabase = getSupabaseClient();
    console.log('[APP] supabase-client initialized:', supabase !== null);
    
    console.log('[APP] ✓ Application initialized successfully');
    return true;
  } catch (error) {
    console.error('[APP] ✗ Initialization failed:', error);
    return false;
  }
}

export function startGame() {
  console.log('[APP] Starting game');
}

export function endGame() {
  console.log('[APP] Ending game');
}

export default {
  initialize,
  startGame,
  endGame
};
