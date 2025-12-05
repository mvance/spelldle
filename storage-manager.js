/**
 * storage-manager.js
 * Local and cloud storage abstraction
 * 
 * Manages localStorage operations, CSV/JSON export, and data persistence.
 */

// Storage key constants
const STORAGE_KEYS = {
  RETRY_QUEUE: 'spelldle_fsrs_retry_queue',
  PERMANENT_FAILURES: 'spelldle_permanent_failures',
  LESSON_STATS: 'spelldle_lesson_stats',
  LAST_LESSON: 'spelldle_last_lesson',
  SESSION_DATA: 'spelldle_session_data'
};

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Stored value or default
 */
export function getFromLocalStorage(key, defaultValue = null) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Failed to read from localStorage [${key}]:`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setInLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write to localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Clear all Spelldle-related storage
 * @returns {boolean} Success status
 */
export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Get FSRS retry queue from storage
 * @returns {Array} Retry queue
 */
export function getRetryQueue() {
  return getFromLocalStorage(STORAGE_KEYS.RETRY_QUEUE, []);
}

/**
 * Save FSRS retry queue to storage
 * @param {Array} queue - Retry queue
 * @returns {boolean} Success status
 */
export function saveRetryQueue(queue) {
  return setInLocalStorage(STORAGE_KEYS.RETRY_QUEUE, queue);
}

/**
 * Get permanent failures log
 * @returns {Array} Permanent failures
 */
export function getPermanentFailures() {
  return getFromLocalStorage(STORAGE_KEYS.PERMANENT_FAILURES, []);
}

/**
 * Add permanent failure to log
 * @param {Object} failure - Failure object
 */
export function addPermanentFailure(failure) {
  const failures = getPermanentFailures();
  failures.push(failure);

  // Keep only last 50 failures to prevent storage bloat
  if (failures.length > 50) {
    failures.splice(0, failures.length - 50);
  }

  setInLocalStorage(STORAGE_KEYS.PERMANENT_FAILURES, failures);
}

/**
 * Get lesson statistics
 * @returns {Object} Lesson stats object
 */
export function getLessonStats() {
  return getFromLocalStorage(STORAGE_KEYS.LESSON_STATS, {});
}

/**
 * Save lesson statistics
 * @param {string} lessonName - Lesson name
 * @param {Object} stats - Stats object
 */
export function saveLessonStats(lessonName, stats) {
  const allStats = getLessonStats();
  allStats[lessonName] = {
    ...allStats[lessonName],
    ...stats,
    lastUpdated: new Date().toISOString()
  };
  return setInLocalStorage(STORAGE_KEYS.LESSON_STATS, allStats);
}

/**
 * Export statistics to CSV format
 * @param {Array} data - Array of records
 * @param {Array} headers - Column headers
 * @returns {string} CSV formatted string
 */
export function exportToCSV(data, headers) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',');

  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      const stringValue = value === null || value === undefined ? '' : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Export statistics to JSON format
 * @param {*} data - Data to export
 * @returns {string} JSON formatted string
 */
export function exportToJSON(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export to JSON:', error);
    return '';
  }
}

/**
 * Trigger file download
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV data
 * @param {string} csvContent - CSV content
 * @returns {Object} { headers, rows }
 */
export function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Get all statistics for export
 * @returns {Object} Combined statistics object
 */
export function getAllStatisticsForExport() {
  return {
    lessonStats: getLessonStats(),
    permanentFailures: getPermanentFailures(),
    exportedAt: new Date().toISOString()
  };
}

export default {
  getFromLocalStorage,
  setInLocalStorage,
  removeFromLocalStorage,
  clearAllStorage,
  getRetryQueue,
  saveRetryQueue,
  getPermanentFailures,
  addPermanentFailure,
  getLessonStats,
  saveLessonStats,
  exportToCSV,
  exportToJSON,
  downloadFile,
  parseCSV,
  getAllStatisticsForExport
};
