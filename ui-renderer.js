/**
 * ui-renderer.js
 * DOM manipulation and UI rendering
 * 
 * Handles rendering of game phases, modals, and dynamic UI updates.
 */

import { generateFeedbackBoxesHTML, generateClueInputBoxesHTML } from './game-engine.js';

/**
 * Show welcome screen
 */
export function showWelcomeScreen() {
  try {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const gameContainer = document.getElementById('initialGuessContainer');
    const cluePhase = document.getElementById('cluePhaseContainer');
    const gameComplete = document.getElementById('gameCompleteContainer');

    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
    if (cluePhase) cluePhase.style.display = 'none';
    if (gameComplete) gameComplete.style.display = 'none';

    console.log('[UI] Welcome screen displayed');
  } catch (error) {
    console.error('[UI] Failed to show welcome screen:', error);
  }
}

/**
 * Show game screen (initial guess phase)
 */
export function showGameScreen() {
  try {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const gameContainer = document.getElementById('initialGuessContainer');
    const audioControls = document.getElementById('audioControls');
    const progressCounter = document.getElementById('progressCounter');

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'flex';
    if (audioControls) audioControls.style.display = 'flex';
    if (progressCounter) progressCounter.style.display = 'block';

    // Focus input
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
      guessInput.focus();
      guessInput.value = '';
    }

    console.log('[UI] Game screen displayed');
  } catch (error) {
    console.error('[UI] Failed to show game screen:', error);
  }
}

/**
 * Show clue phase
 */
export function showCluePhase(feedbackHTML, clueHTML) {
  try {
    const cluePhase = document.getElementById('cluePhaseContainer');
    const gameContainer = document.getElementById('initialGuessContainer');

    if (gameContainer) gameContainer.style.display = 'none';
    if (cluePhase) {
      cluePhase.innerHTML = feedbackHTML + clueHTML;
      cluePhase.style.display = 'flex';
    }

    console.log('[UI] Clue phase displayed');
  } catch (error) {
    console.error('[UI] Failed to show clue phase:', error);
  }
}

/**
 * Show game complete screen
 */
export function showGameComplete() {
  try {
    const gameComplete = document.getElementById('gameCompleteContainer');
    const gameContainer = document.getElementById('initialGuessContainer');
    const cluePhase = document.getElementById('cluePhaseContainer');
    const progressCounter = document.getElementById('progressCounter');

    if (gameContainer) gameContainer.style.display = 'none';
    if (cluePhase) cluePhase.style.display = 'none';
    if (progressCounter) progressCounter.style.display = 'none';
    if (gameComplete) gameComplete.style.display = 'flex';

    console.log('[UI] Game complete screen displayed');
  } catch (error) {
    console.error('[UI] Failed to show game complete:', error);
  }
}

/**
 * Show modal
 * @param {string} modalId - Modal element ID
 */
export function showModal(modalId) {
  try {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      console.log(`[UI] Modal ${modalId} displayed`);
    }
  } catch (error) {
    console.error(`[UI] Failed to show modal ${modalId}:`, error);
  }
}

/**
 * Hide modal
 * @param {string} modalId - Modal element ID
 */
export function hideModal(modalId) {
  try {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      console.log(`[UI] Modal ${modalId} hidden`);
    }
  } catch (error) {
    console.error(`[UI] Failed to hide modal ${modalId}:`, error);
  }
}

/**
 * Update progress counter
 * @param {number} current - Current word index (1-based)
 * @param {number} total - Total words in lesson
 */
export function updateProgressCounter(current, total) {
  try {
    const counter = document.getElementById('progressCounter');
    if (counter) {
      counter.textContent = `Word ${current} of ${total}`;
      console.log(`[UI] Progress updated: ${current}/${total}`);
    }
  } catch (error) {
    console.error('[UI] Failed to update progress counter:', error);
  }
}

/**
 * Display feedback boxes
 * @param {Object} feedbackData - Feedback from game-engine
 */
export function displayFeedback(feedbackData) {
  try {
    const feedbackHTML = generateFeedbackBoxesHTML(feedbackData);
    const cluePhase = document.getElementById('cluePhaseContainer');

    if (cluePhase) {
      cluePhase.innerHTML = feedbackHTML;
      cluePhase.style.display = 'flex';
    }

    console.log('[UI] Feedback displayed');
  } catch (error) {
    console.error('[UI] Failed to display feedback:', error);
  }
}

/**
 * Display clue input boxes
 * @param {string} word - Target word
 */
export function displayClueInputs(word) {
  try {
    const clueHTML = generateClueInputBoxesHTML(word);
    const cluePhase = document.getElementById('cluePhaseContainer');

    if (cluePhase) {
      cluePhase.innerHTML += clueHTML;
    }

    console.log('[UI] Clue inputs displayed');
  } catch (error) {
    console.error('[UI] Failed to display clue inputs:', error);
  }
}

/**
 * Update lesson stats modal
 * @param {Object} stats - Stats object
 */
export function updateLessonStats(stats) {
  try {
    const statsDisplay = document.getElementById('lessonStats');
    if (statsDisplay) {
      let html = '';
      if (stats.accuracy !== undefined) {
        html += `<div><strong>Accuracy:</strong> ${stats.accuracy}%</div>`;
      }
      if (stats.duration !== undefined) {
        const mins = Math.floor(stats.duration / 60);
        const secs = stats.duration % 60;
        html += `<div><strong>Time:</strong> ${mins}:${secs.toString().padStart(2, '0')}</div>`;
      }
      if (stats.correctGuesses !== undefined) {
        html += `<div><strong>Correct Guesses:</strong> ${stats.correctGuesses}</div>`;
      }
      
      statsDisplay.innerHTML = html;
    }
  } catch (error) {
    console.error('[UI] Failed to update lesson stats:', error);
  }
}

export default {
  showWelcomeScreen,
  showGameScreen,
  showCluePhase,
  showGameComplete,
  showModal,
  hideModal,
  updateProgressCounter,
  displayFeedback,
  displayClueInputs,
  updateLessonStats
};
