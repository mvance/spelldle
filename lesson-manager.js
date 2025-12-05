/**
 * lesson-manager.js
 * Lesson and word list management
 * 
 * Handles loading lessons from CSV, managing word lists, and building play sessions.
 */

import { showErrorToast, logError, handleStorageError } from './error-handler.js';
import { selectReviewWords } from './fsrs-manager.js';

// GitHub Gist CSV URL - must be raw content URL
const CSV_URL = 'https://gist.githubusercontent.com/mvance/1096921b2243372780ccef1d82f1a156/raw/spelldle_lessons.csv';

// Fallback word list (original hardcoded words)
const FALLBACK_WORD_LIST = [
  { word: 'friend', sentence: 'She is my best friend.' },
  { word: 'bright', sentence: 'The sun is very bright today.' },
  { word: 'school', sentence: 'I walk to school every morning.' },
  { word: 'enough', sentence: 'We have enough food for dinner.' },
  { word: 'through', sentence: 'The ball went through the window.' },
  { word: 'because', sentence: 'I stayed home because I was sick.' },
  { word: 'different', sentence: 'Each snowflake is different.' },
  { word: 'beautiful', sentence: 'The sunset was beautiful tonight.' },
  { word: 'important', sentence: "It's important to brush your teeth." },
  { word: 'knowledge', sentence: 'Reading books increases your knowledge.' },
  { word: 'rhythm', sentence: 'The music has a steady rhythm.' },
  { word: 'necessary', sentence: 'Sleep is necessary for good health.' }
];

let lessonsData = [];
let availableLessons = [];

/**
 * Load lessons from GitHub Gist CSV
 * Falls back to hardcoded list if loading fails
 * @returns {Promise<void>}
 */
export async function loadLessons() {
  try {
    console.log('[LESSON] Loading lessons from GitHub Gist...');

    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV using Papa Parse (loaded from CDN)
    if (typeof Papa === 'undefined') {
      throw new Error('Papa Parse library not loaded');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          try {
            if (results.errors.length > 0) {
              throw new Error(`CSV Parse Error: ${results.errors.map(e => e.message).join(', ')}`);
            }

            // Map CSV headers to expected format
            const headers = results.meta.fields || [];

            // Check if we have the expected headers
            const hasLessonName = headers.includes('Lesson Name') || headers.includes('lesson_name');
            const hasWord = headers.includes('Word') || headers.includes('word');
            const hasSentence = headers.includes('Example Sentence') || headers.includes('sentence');

            if (!hasLessonName || !hasWord || !hasSentence) {
              throw new Error(`Missing required columns. Found: ${headers.join(', ')}`);
            }

            // Normalize the data to use consistent field names
            lessonsData = results.data
              .map(row => ({
                lesson_name: row['Lesson Name'] || row['lesson_name'],
                word: row['Word'] || row['word'],
                sentence: row['Example Sentence'] || row['sentence']
              }))
              .filter(row => row.lesson_name && row.word && row.sentence);

            // Clean up problematic entries
            lessonsData = lessonsData.filter(row => {
              if (row.word.includes(' ') && row.word.trim() !== row.word) {
                console.warn(`Skipping problematic word entry: "${row.word}"`);
                return false;
              }
              return true;
            });

            // Get unique lessons
            availableLessons = [...new Set(lessonsData.map(row => row.lesson_name))].filter(Boolean);

            console.log(`[LESSON] Loaded ${lessonsData.length} words across ${availableLessons.length} lessons`);
            console.log('[LESSON] Available lessons:', availableLessons);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: function(error) {
          reject(new Error(`Papa Parse Error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('[LESSON] Failed to load lessons from GitHub:', error);
    console.log('[LESSON] Falling back to hardcoded lessons');

    // Fallback: use hardcoded lessons
    lessonsData = FALLBACK_WORD_LIST.map(item => ({
      lesson_name: 'Default',
      word: item.word,
      sentence: item.sentence
    }));

    availableLessons = ['Default'];
    showErrorToast('Using cached lessons (GitHub unavailable)', 'info', 4000);
  }
}

/**
 * Get all available lessons
 * @returns {Array} Array of lesson names
 */
export function getAvailableLessons() {
  return [...availableLessons];
}

/**
 * Get all lessons data
 * @returns {Array} Complete lessons data
 */
export function getAllLessonsData() {
  return [...lessonsData];
}

/**
 * Build a lesson session with words to play
 * @param {string} lessonName - Name of lesson to load
 * @returns {Promise<Object>} Session object with words
 */
export async function buildLessonSession(lessonName) {
  try {
    console.log(`[LESSON] Building session for: ${lessonName}`);

    if (!lessonName) {
      throw new Error('Lesson name is required');
    }

    // Filter words for this lesson
    const lessonWords = lessonsData.filter(row => row.lesson_name === lessonName);

    if (lessonWords.length === 0) {
      throw new Error(`No words found for lesson: ${lessonName}`);
    }

    // Convert to session format
    const sessionWords = lessonWords.map(item => ({
      word: item.word,
      sentence: item.sentence,
      isReview: false,
      lessonName: lessonName
    }));

    console.log(`[LESSON] Built session with ${sessionWords.length} words`);

    return {
      lessonName,
      words: sessionWords,
      wordCount: sessionWords.length,
      isReview: false
    };
  } catch (error) {
    console.error('[LESSON] Failed to build lesson session:', error);
    logError('build lesson session', error);
    throw error;
  }
}

/**
 * Build a review session combining review words with new lesson words
 * @param {string} userId - User ID for fetching review words
 * @param {string} lessonName - Lesson name to add to session
 * @param {number} maxReviews - Maximum review words to include
 * @returns {Promise<Object>} Session object with combined words
 */
export async function buildReviewSession(userId, lessonName, maxReviews = 5) {
  try {
    console.log(`[LESSON] Building review session for lesson: ${lessonName}`);

    // Get review words if user is authenticated
    let reviewWords = [];
    if (userId) {
      try {
        reviewWords = await selectReviewWords(userId, maxReviews);
        console.log(`[LESSON] Selected ${reviewWords.length} review words`);
      } catch (error) {
        console.warn('[LESSON] Could not load review words:', error.message);
        // Continue without reviews
      }
    }

    // Get lesson words
    const lessonWords = lessonsData.filter(row => row.lesson_name === lessonName);

    // Convert to session format
    const sessionWords = [
      ...reviewWords,
      ...lessonWords.map(item => ({
        word: item.word,
        sentence: item.sentence,
        isReview: false,
        lessonName: lessonName
      }))
    ];

    console.log(
      `[LESSON] Built review session: ${reviewWords.length} reviews + ${lessonWords.length} lesson words`
    );

    return {
      lessonName,
      words: sessionWords,
      wordCount: sessionWords.length,
      reviewCount: reviewWords.length,
      lessonCount: lessonWords.length,
      isReview: true
    };
  } catch (error) {
    console.error('[LESSON] Failed to build review session:', error);
    logError('build review session', error);
    // Return lesson-only session as fallback
    return buildLessonSession(lessonName);
  }
}

/**
 * Get metadata for a specific lesson
 * @param {string} lessonName - Lesson name
 * @returns {Object} Lesson metadata
 */
export function getLessonMetadata(lessonName) {
  try {
    if (!lessonName) {
      return null;
    }

    const lessonWords = lessonsData.filter(row => row.lesson_name === lessonName);

    return {
      name: lessonName,
      wordCount: lessonWords.length,
      words: lessonWords.map(w => w.word),
      firstWord: lessonWords.length > 0 ? lessonWords[0].word : null,
      lastWord: lessonWords.length > 0 ? lessonWords[lessonWords.length - 1].word : null
    };
  } catch (error) {
    console.error('[LESSON] Failed to get lesson metadata:', error);
    return null;
  }
}

/**
 * Get a specific word entry from lessons
 * @param {string} word - Word to find
 * @param {string} lessonName - Optional lesson name filter
 * @returns {Object|null} Word entry or null if not found
 */
export function getWordEntry(word, lessonName = null) {
  try {
    let query = lessonsData.filter(row => row.word === word);

    if (lessonName) {
      query = query.filter(row => row.lesson_name === lessonName);
    }

    return query.length > 0 ? query[0] : null;
  } catch (error) {
    console.error('[LESSON] Failed to get word entry:', error);
    return null;
  }
}

/**
 * Get fallback word list (for offline or error scenarios)
 * @returns {Array} Fallback words
 */
export function getFallbackWordList() {
  return [...FALLBACK_WORD_LIST];
}

export default {
  loadLessons,
  getAvailableLessons,
  getAllLessonsData,
  buildLessonSession,
  buildReviewSession,
  getLessonMetadata,
  getWordEntry,
  getFallbackWordList
};
