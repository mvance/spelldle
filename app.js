/**
 * app.js
 * Main application orchestrator
 * 
 * Central coordinator for game lifecycle, phase management, and module integration.
 */

// Import all modules
import { evaluateGuess, getFeedback, validateGuessInput } from './game-engine.js';
import { getFromLocalStorage, setInLocalStorage } from './storage-manager.js';
import { getSupabaseClient } from './supabase-client.js';
import { initializeAuthFlow, isAuthenticated, setupAuthListeners } from './auth-manager.js';
import { initializeSpeechSynthesis, speakWord, repeatWord } from './tts-handler.js';
import { loadLessons, getAvailableLessons, buildLessonSession } from './lesson-manager.js';
import { initializeFSRS } from './fsrs-manager.js';
import { showWelcomeScreen, showGameScreen, updateProgressCounter } from './ui-renderer.js';
import { showErrorToast } from './error-handler.js';

// Game state
let gameState = {
  currentLesson: null,
  currentWords: [],
  currentWordIndex: 0,
  currentWord: null,
  currentSentence: null,
  gameStarted: false,
  sessionStartTime: null
};

/**
 * Initialize the application
 * @returns {Promise<boolean>} True if initialization successful
 */
export async function initialize() {
  console.log('[APP] ================================================');
  console.log('[APP] Initializing Spelldle Application');
  console.log('[APP] ================================================');

  try {
    // Step 1: Initialize core utilities
    console.log('[APP] Step 1: Initializing core utilities...');
    
    const supabase = getSupabaseClient();
    console.log('[APP] ✓ Supabase client ready');

    const storage = getFromLocalStorage('test', null);
    console.log('[APP] ✓ Storage manager ready');

    // Step 2: Initialize TTS
    console.log('[APP] Step 2: Initializing text-to-speech...');
    const ttsReady = initializeSpeechSynthesis();
    console.log(`[APP] ${ttsReady ? '✓' : '✗'} TTS initialized`);

    // Step 3: Initialize Auth
    console.log('[APP] Step 3: Initializing authentication...');
    const authReady = await initializeAuthFlow();
    console.log(`[APP] ${authReady ? '✓' : '✗'} Auth ready`);
    setupAuthListeners();

    // Step 4: Initialize FSRS
    console.log('[APP] Step 4: Initializing spaced repetition...');
    const fsrsReady = await initializeFSRS();
    console.log(`[APP] ${fsrsReady ? '✓' : '✗'} FSRS ready`);

    // Step 5: Load lessons
    console.log('[APP] Step 5: Loading lessons...');
    try {
      await loadLessons();
      const lessons = getAvailableLessons();
      console.log(`[APP] ✓ Loaded ${lessons.length} lessons:`, lessons);
      populateLessonDropdown(lessons);
    } catch (error) {
      console.warn('[APP] Could not load external lessons, using fallback', error);
    }

    // Step 6: Setup UI
    console.log('[APP] Step 6: Setting up user interface...');
    setupGameUI();
    showWelcomeScreen();
    console.log('[APP] ✓ UI ready');

    console.log('[APP] ================================================');
    console.log('[APP] ✓ Application initialized successfully!');
    console.log('[APP] ================================================');

    return true;
  } catch (error) {
    console.error('[APP] ✗ Initialization failed:', error);
    showErrorToast('Application initialization failed', 'error');
    return false;
  }
}

/**
 * Setup game UI event listeners
 */
function setupGameUI() {
  try {
    // Lesson selection
    const startButton = document.getElementById('startLessonButton');
    if (startButton) {
      startButton.onclick = startSelectedLesson;
    }

    // Guess input handling
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
      guessInput.onkeydown = handleInputKeydown;
      guessInput.oninput = handleInputChange;
    }

    // Submit button
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.onclick = submitGuess;
    }

    // Repeat button
    const repeatButton = document.getElementById('repeatButton');
    if (repeatButton) {
      repeatButton.onclick = handleRepeatWord;
    }

    // Play again button
    const playAgainButton = document.querySelector('.play-again-button');
    if (playAgainButton) {
      playAgainButton.onclick = playAgain;
    }

    console.log('[APP] Game UI event listeners attached');
  } catch (error) {
    console.error('[APP] Failed to setup game UI:', error);
  }
}

/**
 * Populate lesson dropdown with available lessons
 * @param {Array} lessons - Array of lesson names
 */
function populateLessonDropdown(lessons) {
  try {
    const dropdown = document.getElementById('lessonDropdown');
    if (!dropdown) {
      console.warn('[APP] Lesson dropdown not found in DOM');
      return;
    }

    // Clear existing options except placeholder
    dropdown.innerHTML = '<option value="">Select a lesson...</option>';

    // Add lesson options
    lessons.forEach(lesson => {
      const option = document.createElement('option');
      option.value = lesson;
      option.textContent = lesson;
      dropdown.appendChild(option);
    });

    console.log(`[APP] Populated dropdown with ${lessons.length} lessons`);
  } catch (error) {
    console.error('[APP] Failed to populate lesson dropdown:', error);
  }
}

/**
 * Start selected lesson
 */
async function startSelectedLesson() {
  try {
    const dropdown = document.getElementById('lessonDropdown');
    if (!dropdown || !dropdown.value) {
      showErrorToast('Please select a lesson', 'warning');
      return;
    }

    console.log(`[APP] Starting lesson: ${dropdown.value}`);

    // Build lesson session
    const session = await buildLessonSession(dropdown.value);
    gameState.currentLesson = dropdown.value;
    gameState.currentWords = session.words;
    gameState.currentWordIndex = 0;
    gameState.gameStarted = true;
    gameState.sessionStartTime = Date.now();

    // Show game screen
    showGameScreen();
    updateProgressCounter(1, gameState.currentWords.length);

    // Load first word
    loadNextWord();
  } catch (error) {
    console.error('[APP] Failed to start lesson:', error);
    showErrorToast('Failed to start lesson', 'error');
  }
}

/**
 * Load next word
 */
function loadNextWord() {
  try {
    if (gameState.currentWordIndex >= gameState.currentWords.length) {
      // Lesson complete
      completeLesson();
      return;
    }

    const wordData = gameState.currentWords[gameState.currentWordIndex];
    gameState.currentWord = wordData.word;
    gameState.currentSentence = wordData.sentence;

    console.log(`[APP] Loaded word: "${gameState.currentWord}"`);

    // Speak the word
    speakWord(gameState.currentWord, gameState.currentSentence);
  } catch (error) {
    console.error('[APP] Failed to load next word:', error);
    showErrorToast('Error loading word', 'error');
  }
}

/**
 * Handle input keydown (Enter to submit)
 */
function handleInputKeydown(event) {
  if (event.key === 'Enter') {
    submitGuess();
  }
}

/**
 * Handle input change
 */
function handleInputChange(event) {
  // Optional: add input validation here
}

/**
 * Submit current guess
 */
async function submitGuess() {
  try {
    const guessInput = document.getElementById('guessInput');
    if (!guessInput) return;

    const guess = guessInput.value.trim();

    // Validate input
    const validation = validateGuessInput(guess);
    if (!validation.valid) {
      showErrorToast(validation.message, 'warning');
      return;
    }

    console.log(`[APP] Submitted guess: "${guess}" for word: "${gameState.currentWord}"`);

    // Evaluate guess
    const isCorrect = evaluateGuess(guess, gameState.currentWord);

    if (isCorrect) {
      // Correct!
      showErrorToast('Correct!', 'success', 1000);
      gameState.currentWordIndex++;
      setTimeout(loadNextWord, 500);
    } else {
      // Incorrect - show clue phase
      const feedback = getFeedback(guess, gameState.currentWord);
      console.log('[APP] Feedback:', feedback);
      // TODO: Show clue phase UI
      showErrorToast('Incorrect - try again', 'warning');
    }

    guessInput.value = '';
  } catch (error) {
    console.error('[APP] Failed to submit guess:', error);
    showErrorToast('Error submitting guess', 'error');
  }
}

/**
 * Handle repeat word button
 */
async function handleRepeatWord() {
  try {
    if (gameState.currentWord && gameState.currentSentence) {
      await repeatWord(gameState.currentWord, gameState.currentSentence);
    }
  } catch (error) {
    console.error('[APP] Failed to repeat word:', error);
  }
}

/**
 * Play again (reset lesson)
 */
function playAgain() {
  try {
    gameState.gameStarted = false;
    gameState.currentWords = [];
    gameState.currentWordIndex = 0;
    showWelcomeScreen();
    console.log('[APP] Game reset');
  } catch (error) {
    console.error('[APP] Failed to play again:', error);
  }
}

/**
 * Complete lesson
 */
function completeLesson() {
  try {
    console.log('[APP] Lesson completed!');
    const duration = Math.floor((Date.now() - gameState.sessionStartTime) / 1000);
    const stats = {
      lesson: gameState.currentLesson,
      wordsCount: gameState.currentWords.length,
      duration: duration
    };
    console.log('[APP] Lesson stats:', stats);
    showErrorToast('Lesson complete!', 'success', 2000);
  } catch (error) {
    console.error('[APP] Failed to complete lesson:', error);
  }
}

export default {
  initialize
};
