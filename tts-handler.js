/**
 * tts-handler.js
 * Text-to-Speech integration using Web Speech API
 * 
 * Provides speech synthesis with fallback for unsupported browsers.
 */

import { showErrorToast } from './error-handler.js';

// Speech synthesis API setup
let synthesis = null;
let currentUtterance = null;
let isSupported = false;

/**
 * Initialize speech synthesis
 * @returns {boolean} True if speech synthesis is supported
 */
export function initializeSpeechSynthesis() {
  try {
    const synth = window.speechSynthesis || window.webkitSpeechSynthesis;
    
    if (!synth) {
      console.warn('[TTS] Speech synthesis not supported in this browser');
      isSupported = false;
      showAudioFallback();
      return false;
    }

    synthesis = synth;
    isSupported = true;
    console.log('[TTS] Speech synthesis initialized');
    return true;
  } catch (error) {
    console.error('[TTS] Failed to initialize speech synthesis:', error);
    isSupported = false;
    return false;
  }
}

/**
 * Check if speech synthesis is supported
 * @returns {boolean} True if supported
 */
export function isSpeechSupported() {
  if (isSupported !== false && isSupported !== true) {
    const synth = window.speechSynthesis || window.webkitSpeechSynthesis;
    isSupported = !!synth;
  }
  return isSupported;
}

/**
 * Speak text with word and sentence
 * @param {string} word - The word to pronounce
 * @param {string} sentence - Example sentence
 * @returns {Promise<void>}
 */
export async function speakWord(word, sentence) {
  if (!isSpeechSupported()) {
    console.warn('[TTS] Speech synthesis not supported');
    return;
  }

  try {
    // Ensure synthesis is initialized
    if (!synthesis) {
      initializeSpeechSynthesis();
    }

    if (!synthesis) {
      console.error('[TTS] Speech synthesis initialization failed');
      return;
    }

    // Cancel any existing speech
    stopSpeech();

    // Create utterance for word
    const wordUtterance = new SpeechSynthesisUtterance(word);
    wordUtterance.rate = 0.8;
    wordUtterance.pitch = 1;
    wordUtterance.volume = 1;

    // Create utterance for sentence
    const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
    sentenceUtterance.rate = 0.8;
    sentenceUtterance.pitch = 1;
    sentenceUtterance.volume = 0.8;

    // Speak word first
    return new Promise((resolve) => {
      wordUtterance.onend = () => {
        // Wait 500ms pause between word and sentence
        setTimeout(() => {
          synthesis.speak(sentenceUtterance);
          sentenceUtterance.onend = () => {
            currentUtterance = null;
            resolve();
          };
          sentenceUtterance.onerror = (event) => {
            console.error('[TTS] Speech synthesis error:', event.error);
            currentUtterance = null;
            resolve();
          };
        }, 500);
      };

      wordUtterance.onerror = (event) => {
        console.error('[TTS] Speech synthesis error:', event.error);
        currentUtterance = null;
        resolve();
      };

      currentUtterance = wordUtterance;
      synthesis.speak(wordUtterance);

      console.log(`[TTS] Speaking: "${word}" - "${sentence}"`);
    });
  } catch (error) {
    console.error('[TTS] Failed to speak:', error);
    showErrorToast('Text-to-speech error: ' + error.message, 'warning');
  }
}

/**
 * Repeat the last spoken word/sentence
 * @param {string} word - The word to repeat
 * @param {string} sentence - Example sentence to repeat
 * @returns {Promise<void>}
 */
export async function repeatWord(word, sentence) {
  if (!isSpeechSupported()) {
    console.warn('[TTS] Speech synthesis not supported');
    return;
  }

  try {
    stopSpeech();
    await speakWord(word, sentence);
  } catch (error) {
    console.error('[TTS] Failed to repeat word:', error);
  }
}

/**
 * Stop current speech
 */
export function stopSpeech() {
  if (!synthesis) {
    return;
  }

  try {
    synthesis.cancel();
    currentUtterance = null;
    console.log('[TTS] Speech stopped');
  } catch (error) {
    console.error('[TTS] Failed to stop speech:', error);
  }
}

/**
 * Get current utterance volume
 * @returns {number} Volume level (0-1)
 */
export function getVolume() {
  if (currentUtterance) {
    return currentUtterance.volume;
  }
  return 1;
}

/**
 * Set speech volume
 * @param {number} volume - Volume level (0-1)
 */
export function setVolume(volume) {
  if (currentUtterance) {
    currentUtterance.volume = Math.max(0, Math.min(1, volume));
    console.log(`[TTS] Volume set to ${currentUtterance.volume}`);
  }
}

/**
 * Set speech rate
 * @param {number} rate - Speech rate (0.5-2)
 */
export function setRate(rate) {
  const validRate = Math.max(0.5, Math.min(2, rate));
  if (currentUtterance) {
    currentUtterance.rate = validRate;
  }
  console.log(`[TTS] Rate set to ${validRate}`);
}

/**
 * Check if currently speaking
 * @returns {boolean} True if speech is active
 */
export function isSpeaking() {
  return synthesis ? synthesis.speaking : false;
}

/**
 * Show audio fallback message in UI
 */
function showAudioFallback() {
  try {
    const fallback = document.getElementById('audioFallback');
    if (fallback) {
      fallback.style.display = 'block';
      console.log('[TTS] Audio fallback displayed');
    }
  } catch (error) {
    console.error('[TTS] Failed to show audio fallback:', error);
  }
}

/**
 * Announce text (for feedback like "Correct!" or "Incorrect")
 * @param {string} text - Text to announce
 * @returns {Promise<void>}
 */
export async function announce(text) {
  if (!isSpeechSupported()) {
    return;
  }

  try {
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    return new Promise((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      synthesis.speak(utterance);
    });
  } catch (error) {
    console.error('[TTS] Failed to announce:', error);
  }
}

export default {
  initializeSpeechSynthesis,
  isSpeechSupported,
  speakWord,
  repeatWord,
  stopSpeech,
  getVolume,
  setVolume,
  setRate,
  isSpeaking,
  announce
};
