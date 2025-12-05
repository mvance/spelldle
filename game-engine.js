/**
 * game-engine.js
 * Pure spelling evaluation and feedback generation
 * 
 * Provides core game logic for evaluating guesses, generating feedback,
 * and managing letter-box display.
 */

/**
 * Evaluate a guess against the target word
 * @param {string} guess - The user's guess
 * @param {string} target - The target word
 * @returns {boolean} True if guess is correct
 */
export function evaluateGuess(guess, target) {
  if (!guess || !target) {
    return false;
  }
  return guess === target;
}

/**
 * Generate feedback for an incorrect guess
 * Returns array of feedback objects with type and letter for each position
 * @param {string} guess - The user's guess
 * @param {string} target - The target word
 * @returns {Object} Feedback object with detailed analysis
 */
export function getFeedback(guess, target) {
  if (!guess || !target) {
    return { feedback: [], isCorrect: false };
  }

  const feedback = [];
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  const used = new Array(target.length).fill(false);

  // First pass: mark green (correct position) letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = { letter: guessLetters[i], type: 'green', position: i };
      used[i] = true;
    }
  }

  // Second pass: mark yellow and gray letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (feedback[i]) {
      // Already marked as green, skip
      continue;
    }

    let found = false;

    // Check if letter exists in target at different position
    for (let j = 0; j < targetLetters.length; j++) {
      if (
        !used[j] &&
        guessLetters[i] === targetLetters[j] &&
        i !== j
      ) {
        feedback[i] = { letter: guessLetters[i], type: 'yellow', position: i };
        used[j] = true;
        found = true;
        break;
      }
    }

    // If not found, mark as gray
    if (!found) {
      feedback[i] = { letter: guessLetters[i], type: 'gray', position: i };
    }
  }

  // Handle extraneous letters (guess longer than target)
  if (guessLetters.length > target.length) {
    for (let i = target.length; i < guessLetters.length; i++) {
      feedback[i] = { letter: guessLetters[i], type: 'extraneous', position: i };
    }
  }

  // Determine if guess is correct
  const isCorrect = guess === target;

  return {
    feedback,
    isCorrect,
    guessLength: guessLetters.length,
    targetLength: target.length
  };
}

/**
 * Get missing letters (letters in target but not in guess)
 * @param {string} guess - The user's guess
 * @param {string} target - The target word
 * @returns {Array} Array of missing letters with their correct positions
 */
export function getMissingLetters(guess, target) {
  if (!guess || !target) {
    return [];
  }

  const missing = [];
  const guessLetters = new Set(guess.split(''));

  target.split('').forEach((letter, index) => {
    if (!guessLetters.has(letter)) {
      missing.push({ letter, position: index });
    }
  });

  return missing;
}

/**
 * Generate HTML for feedback boxes
 * @param {Object} feedbackData - Feedback object from getFeedback()
 * @returns {string} HTML string for feedback row
 */
export function generateFeedbackBoxesHTML(feedbackData) {
  const { feedback } = feedbackData;

  if (!feedback || feedback.length === 0) {
    return '';
  }

  let html = '<div class="feedback-row">';

  feedback.forEach((item) => {
    let classList = `letter-box ${item.type}`;
    html += `<div class="${classList}">${item.letter.toUpperCase()}</div>`;
  });

  html += '</div>';
  return html;
}

/**
 * Generate HTML for missing letter boxes in clue phase
 * @param {string} target - The target word
 * @returns {string} HTML string for input row with missing letters
 */
export function generateClueInputBoxesHTML(target) {
  if (!target) {
    return '';
  }

  let html = '<div class="input-row-clue">';

  target.split('').forEach(() => {
    html += '<input type="text" class="letter-input" maxlength="1" />';
  });

  html += '</div>';
  return html;
}

/**
 * Validate input length for clue phase
 * @param {number} inputLength - Length of user input
 * @param {number} targetLength - Length of target word
 * @returns {Object} Validation result
 */
export function validateClueInput(inputLength, targetLength) {
  if (inputLength === 0) {
    return { valid: false, message: 'Please enter your guess' };
  }

  if (inputLength !== targetLength) {
    return {
      valid: false,
      message: `Your guess should have ${targetLength} letters, but has ${inputLength}`
    };
  }

  return { valid: true, message: '' };
}

/**
 * Check if input is valid for initial guess
 * @param {string} input - User input
 * @returns {Object} Validation result
 */
export function validateGuessInput(input) {
  if (!input || input.trim().length === 0) {
    return { valid: false, message: 'Please enter a guess' };
  }

  return { valid: true, message: '' };
}

/**
 * Attempt count to FSRS grade mapping
 * @param {number} attemptCount - Number of attempts taken
 * @returns {number} FSRS grade (1-4: Again, Hard, Good, Easy)
 */
export function calculateFSRSGrade(attemptCount) {
  if (attemptCount === 1) {
    return 4; // Easy - correct on first try
  } else if (attemptCount === 2) {
    return 3; // Good - correct on second try
  } else if (attemptCount === 3) {
    return 2; // Hard - correct on third try
  } else {
    return 1; // Again - required 4+ attempts
  }
}

export default {
  evaluateGuess,
  getFeedback,
  getMissingLetters,
  generateFeedbackBoxesHTML,
  generateClueInputBoxesHTML,
  validateClueInput,
  validateGuessInput,
  calculateFSRSGrade
};
