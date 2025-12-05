/**
 * lesson-manager.js
 * Lesson and word list management
 * 
 * (Phase 4: Will be fully implemented)
 */

export async function loadLessons() {
  console.log('[LESSON] Loading lessons');
  return [];
}

export async function buildLessonSession(lessonName) {
  console.log('[LESSON] Building session for:', lessonName);
  return { words: [], lessonName };
}

export async function buildReviewSession(userId) {
  console.log('[LESSON] Building review session');
  return { words: [], isReview: true };
}

export async function getLessonMetadata(lessonName) {
  console.log('[LESSON] Getting metadata for:', lessonName);
  return {};
}

export default {
  loadLessons,
  buildLessonSession,
  buildReviewSession,
  getLessonMetadata
};
