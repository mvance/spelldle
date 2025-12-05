/**
 * error-handler.js
 * Centralized error handling, logging, and user notifications
 * 
 * Manages error toasts, persistent errors, database operation logging, and retry logic.
 */

import { setInLocalStorage, getFromLocalStorage } from './storage-manager.js';

/**
 * Show temporary error/success/info toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'error', 'success', 'warning', 'info'
 * @param {number} duration - Display duration in milliseconds
 * @param {Function} retryCallback - Optional retry callback function
 */
export function showErrorToast(message, type = 'error', duration = 3000, retryCallback = null) {
  if (!message) return;

  try {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `error-toast ${type}`;
    
    // Build toast content
    let content = `<span>${message}</span>`;
    if (retryCallback) {
      content += '<button class="toast-retry">Retry</button>';
    }
    content += '<button class="toast-close">&times;</button>';
    
    toast.innerHTML = content;

    // Add to page
    toastContainer.appendChild(toast);

    // Setup close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
      toast.style.animation = 'slideOutTop 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    };

    // Setup retry button if provided
    if (retryCallback) {
      const retryBtn = toast.querySelector('.toast-retry');
      retryBtn.onclick = async () => {
        try {
          await retryCallback();
          toast.style.animation = 'slideOutTop 0.3s ease-out';
          setTimeout(() => toast.remove(), 300);
        } catch (error) {
          console.error('Retry failed:', error);
        }
      };
    }

    // Auto-close after duration
    if (duration > 0) {
      const timeout = setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'slideOutTop 0.3s ease-out';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);

      // Clear timeout on manual close
      closeBtn.onclick = () => {
        clearTimeout(timeout);
        toast.style.animation = 'slideOutTop 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      };
    }

    console.log(`[${type.toUpperCase()}]`, message);
  } catch (error) {
    console.error('Failed to show error toast:', error);
  }
}

/**
 * Show persistent error modal that requires user interaction
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Function} retryCallback - Optional retry callback
 */
export function showPersistentError(title, message, retryCallback = null) {
  try {
    // Check if error modal already exists
    let errorModal = document.getElementById('errorModal');
    if (!errorModal) {
      console.warn('Error modal not found in DOM');
      // Fallback to alert
      alert(`${title}\n\n${message}`);
      return;
    }

    // Set error content
    const errorTitle = errorModal.querySelector('h2');
    const errorDetails = errorModal.querySelector('#errorDetails');
    
    if (errorTitle) {
      errorTitle.textContent = title;
    }
    if (errorDetails) {
      errorDetails.textContent = message;
    }

    // Show modal
    errorModal.style.display = 'flex';

    // Setup retry button if callback provided
    if (retryCallback) {
      const retryButton = errorModal.querySelector('button');
      if (retryButton) {
        retryButton.onclick = async () => {
          try {
            await retryCallback();
            errorModal.style.display = 'none';
          } catch (error) {
            console.error('Retry failed:', error);
            showErrorToast('Retry failed: ' + error.message, 'error');
          }
        };
      }
    }

    console.error(`[PERSISTENT ERROR] ${title}: ${message}`);
  } catch (error) {
    console.error('Failed to show persistent error:', error);
  }
}

/**
 * Log database operation for monitoring
 * @param {string} operation - Operation name
 * @param {boolean} success - Success status
 * @param {*} data - Operation data for logging
 */
export function logDatabaseOperation(operation, success, data = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    success,
    data
  };

  try {
    // Log to console
    if (success) {
      console.log(`[DB_OP SUCCESS] ${operation}`, data);
    } else {
      console.error(`[DB_OP FAILED] ${operation}`, data);
    }

    // Store in localStorage for debugging
    const maxLogs = 50;
    const logs = getFromLocalStorage('spelldle_db_logs', []);
    logs.push(logEntry);

    // Keep only recent logs
    if (logs.length > maxLogs) {
      logs.splice(0, logs.length - maxLogs);
    }

    setInLocalStorage('spelldle_db_logs', logs);
  } catch (error) {
    console.error('Failed to log database operation:', error);
  }
}

/**
 * Log general error
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
export function logError(message, error) {
  console.error(message, error);

  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message,
      stack: error?.stack || '',
      name: error?.name || 'UnknownError'
    };

    // Store in localStorage
    const maxErrors = 20;
    const errors = getFromLocalStorage('spelldle_errors', []);
    errors.push(errorLog);

    if (errors.length > maxErrors) {
      errors.splice(0, errors.length - maxErrors);
    }

    setInLocalStorage('spelldle_errors', errors);
  } catch (storageError) {
    console.error('Failed to log error to storage:', storageError);
  }
}

/**
 * Handle storage errors with user feedback
 * @param {Error} error - Storage error
 * @param {string} context - Context where error occurred
 * @param {Function} retryCallback - Optional retry callback
 */
export function handleStorageError(error, context, retryCallback = null) {
  console.error(`[STORAGE ERROR] ${context}:`, error);

  const message = `Storage error in ${context}: ${error.message}`;

  if (error.name === 'QuotaExceededError') {
    showErrorToast(
      'Storage quota exceeded. Please clear some data.',
      'error',
      5000
    );
  } else if (retryCallback) {
    showErrorToast(
      message,
      'warning',
      5000,
      retryCallback
    );
  } else {
    showErrorToast(message, 'error', 5000);
  }

  logError(context, error);
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delayMs - Initial delay in milliseconds
 * @returns {*} Result of operation
 */
export async function retryOperation(operation, maxAttempts = 3, delayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[RETRY] Attempt ${attempt}/${maxAttempts}`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`[RETRY] Attempt ${attempt} failed:`, error.message);

      if (attempt === maxAttempts) {
        // Last attempt failed
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`[RETRY] Waiting ${delay}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
}

/**
 * Get all logged errors for debugging
 * @returns {Array} Array of logged errors
 */
export function getErrorLogs() {
  return getFromLocalStorage('spelldle_errors', []);
}

/**
 * Get all logged database operations for debugging
 * @returns {Array} Array of logged operations
 */
export function getDatabaseLogs() {
  return getFromLocalStorage('spelldle_db_logs', []);
}

/**
 * Clear all error logs
 */
export function clearErrorLogs() {
  try {
    localStorage.removeItem('spelldle_errors');
    localStorage.removeItem('spelldle_db_logs');
    console.log('Error logs cleared');
  } catch (error) {
    console.error('Failed to clear error logs:', error);
  }
}

export default {
  showErrorToast,
  showPersistentError,
  logDatabaseOperation,
  logError,
  handleStorageError,
  retryOperation,
  getErrorLogs,
  getDatabaseLogs,
  clearErrorLogs
};
