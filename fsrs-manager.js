/**
 * fsrs-manager.js
 * Spaced Repetition System (FSRS) management
 * 
 * Handles FSRS card operations, scheduling, batching, and health monitoring.
 */

import { getSupabaseClient } from './supabase-client.js';
import { isAuthenticated, getCurrentUser } from './auth-manager.js';
import { showErrorToast, logError, logDatabaseOperation } from './error-handler.js';

// FSRS Configuration
const FSRS_CONFIG = {
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: false
};

let fsrsLibrary = null;
let fsrsInitialized = false;

// Health status
let fsrsHealthStatus = {
  isHealthy: true,
  lastHealthCheck: null,
  consecutiveFailures: 0,
  totalOperations: 0,
  successfulOperations: 0,
  lastError: null,
  degradationLevel: 'none'
};

/**
 * Initialize FSRS system
 * @returns {boolean} True if initialized successfully
 */
export async function initializeFSRS() {
  try {
    console.log('[FSRS] Initializing FSRS system');

    if (typeof window.tsFsrs === 'undefined') {
      throw new Error('FSRS library not loaded from CDN');
    }

    const { fsrs, generatorParameters } = window.tsFsrs;
    const params = generatorParameters(FSRS_CONFIG);
    fsrsLibrary = fsrs(params);
    fsrsInitialized = true;

    console.log('[FSRS] FSRS library initialized successfully');
    return true;
  } catch (error) {
    console.error('[FSRS] Failed to initialize:', error);
    fsrsInitialized = false;
    showErrorToast('FSRS library failed to load', 'warning');
    return false;
  }
}

/**
 * Create FSRS card for a word
 * @param {string} word - Word to create card for
 * @param {string} lessonName - Lesson name
 * @returns {Promise<Object|null>}
 */
export async function createFSRSCard(word, lessonName = null) {
  if (!fsrsInitialized || !isAuthenticated()) {
    return null;
  }

  try {
    console.log(`[FSRS] Creating card for: ${word}`);
    const user = getCurrentUser();
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
      .from('fsrs_cards')
      .insert({
        user_id: user.id,
        word: word,
        lesson_name: lessonName,
        difficulty: 0.5,
        stability: 0,
        last_review: null,
        next_due: new Date().toISOString(),
        review_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    logDatabaseOperation('create_card', true, { word });
    trackFSRSOperation(true, 'create_card');
    return data;
  } catch (error) {
    console.error('[FSRS] Failed to create card:', error);
    logDatabaseOperation('create_card', false, error);
    trackFSRSOperation(false, 'create_card', error);
    return null;
  }
}

/**
 * Update FSRS card with grade
 * @param {string} cardId - Card ID
 * @param {number} grade - Grade (1-4)
 * @returns {Promise<Object|null>}
 */
export async function updateFSRSCard(cardId, grade) {
  if (!fsrsInitialized || !isAuthenticated()) {
    return null;
  }

  try {
    console.log(`[FSRS] Updating card ${cardId} with grade ${grade}`);
    const user = getCurrentUser();
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase not available');
    }

    const now = new Date();

    const { data, error } = await supabase
      .from('fsrs_cards')
      .update({
        last_review: now.toISOString(),
        next_due: now.toISOString(),
        review_count: grade,
        updated_at: now.toISOString()
      })
      .eq('id', cardId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    logDatabaseOperation('update_card', true, { cardId, grade });
    trackFSRSOperation(true, 'update_card');
    return data;
  } catch (error) {
    console.error('[FSRS] Failed to update card:', error);
    logDatabaseOperation('update_card', false, error);
    trackFSRSOperation(false, 'update_card', error);
    return null;
  }
}

/**
 * Get FSRS card by word
 * @param {string} word - Word
 * @param {string} lessonName - Lesson name
 * @returns {Promise<Object|null>}
 */
export async function getFSRSCardByWord(word, lessonName = null) {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const user = getCurrentUser();
    const supabase = getSupabaseClient();

    if (!supabase) return null;

    let query = supabase
      .from('fsrs_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('word', word);

    if (lessonName) {
      query = query.eq('lesson_name', lessonName);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('[FSRS] Failed to get card by word:', error);
    return null;
  }
}

/**
 * Get due cards for review
 * @param {number} limit - Max cards to return
 * @returns {Promise<Array>}
 */
export async function getDueReviewCards(limit = 10) {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    const user = getCurrentUser();
    const supabase = getSupabaseClient();

    if (!supabase) return [];

    const now = new Date();

    const { data, error } = await supabase
      .from('fsrs_cards')
      .select('*')
      .eq('user_id', user.id)
      .lte('next_due', now.toISOString())
      .order('next_due', { ascending: true })
      .limit(limit);

    if (error) throw error;

    logDatabaseOperation('get_due_cards', true, { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('[FSRS] Failed to get due cards:', error);
    logDatabaseOperation('get_due_cards', false, error);
    return [];
  }
}

/**
 * Select review words for session
 * @param {string} userId - User ID
 * @param {number} maxReviews - Maximum reviews to select
 * @returns {Promise<Array>}
 */
export async function selectReviewWords(userId, maxReviews = 5) {
  if (!userId) {
    return [];
  }

  try {
    console.log(`[FSRS] Selecting ${maxReviews} review words`);

    const dueCards = await getDueReviewCards(maxReviews * 2);

    if (dueCards.length === 0) {
      return [];
    }

    // Deduplicate by word
    const uniqueCards = new Map();
    dueCards.forEach(card => {
      if (!uniqueCards.has(card.word)) {
        uniqueCards.set(card.word, card);
      }
    });

    const reviewWords = Array.from(uniqueCards.values())
      .slice(0, maxReviews)
      .map(card => ({
        word: card.word,
        sentence: `Review: ${card.word}`,
        isReview: true,
        fsrsCard: card,
        lessonName: card.lesson_name
      }));

    console.log(`[FSRS] Selected ${reviewWords.length} review words`);
    return reviewWords;
  } catch (error) {
    console.error('[FSRS] Failed to select review words:', error);
    return [];
  }
}

/**
 * Get user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getUserPreferences(userId) {
  if (!userId) {
    return { max_reviews_per_lesson: 5, desired_retention: 0.90 };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { max_reviews_per_lesson: 5, desired_retention: 0.90 };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { max_reviews_per_lesson: 5, desired_retention: 0.90 };
    }

    return data;
  } catch (error) {
    console.error('[FSRS] Failed to get preferences:', error);
    return { max_reviews_per_lesson: 5, desired_retention: 0.90 };
  }
}

/**
 * Get FSRS system status
 * @returns {Object}
 */
export function getFSRSSystemStatus() {
  return {
    initialized: fsrsInitialized,
    healthy: fsrsHealthStatus.isHealthy,
    health: fsrsHealthStatus,
    totalOperations: fsrsHealthStatus.totalOperations,
    successRate: fsrsHealthStatus.totalOperations > 0
      ? (fsrsHealthStatus.successfulOperations / fsrsHealthStatus.totalOperations * 100).toFixed(1)
      : 0
  };
}

/**
 * Track FSRS operation for monitoring
 * @param {boolean} success - Success status
 * @param {string} operation - Operation type
 * @param {Error} error - Error object
 */
function trackFSRSOperation(success, operation, error = null) {
  fsrsHealthStatus.totalOperations++;

  if (success) {
    fsrsHealthStatus.successfulOperations++;
    fsrsHealthStatus.consecutiveFailures = 0;
  } else {
    fsrsHealthStatus.consecutiveFailures++;
    fsrsHealthStatus.lastError = error?.message || 'Unknown error';
  }

  console.log(`[FSRS] Operation ${operation}: ${success ? 'success' : 'failed'}`);
}

export default {
  initializeFSRS,
  createFSRSCard,
  updateFSRSCard,
  getFSRSCardByWord,
  getDueReviewCards,
  selectReviewWords,
  getUserPreferences,
  getFSRSSystemStatus
};
