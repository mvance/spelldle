/**
 * error-handler.js
 * Error management and user notifications
 * 
 * Handles error toasts, logging, and user-facing error messages.
 * (Phase 3: Will be fully implemented)
 */

export function showErrorToast(message, type = 'error', duration = 3000) {
  console.log(`[${type.toUpperCase()}]`, message);
}

export function showPersistentError(title, message, retryCallback) {
  console.error(`[PERSISTENT ERROR] ${title}: ${message}`);
}

export function logDatabaseOperation(operation, success, data) {
  console.log(`[DB_OP] ${operation}: ${success ? 'SUCCESS' : 'FAILED'}`, data);
}

export function logError(message, error) {
  console.error(message, error);
}

export function handleStorageError(error, context, retryCallback) {
  console.error(`[STORAGE ERROR] ${context}:`, error);
}

export async function retryOperation(operation, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
}

export default {
  showErrorToast,
  showPersistentError,
  logDatabaseOperation,
  logError,
  handleStorageError,
  retryOperation
};
