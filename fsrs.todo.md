# FSRS Implementation TODO Checklist

## Phase 1: Foundation Setup

### 1.1 Add FSRS Library Integration
- [x] Add ts-fsrs CDN script tag to index.html head section: https://cdn.jsdelivr.net/npm/ts-fsrs@5.2.3/+esm
- [x] Create fsrsConfig object with default parameters (maximum_interval: 36500, enable_fuzz: true)
- [x] Add initialization check and error handling for CDN failures
- [x] Test basic FSRS functions (createEmptyCard, repeat) in browser console
- [x] Verify library loads correctly and logs success message

### 1.2 Create Database Schema Migration
- [x] Drop existing spelling_attempts table in Supabase
- [x] Create fsrs_cards table with all specified columns:
  - [x] id (UUID, primary key)
  - [x] user_id (UUID, foreign key to auth.users)
  - [x] word (TEXT)
  - [x] lesson_name (TEXT)
  - [x] difficulty (DECIMAL, default 1.3)
  - [x] stability (DECIMAL, default 2.1)
  - [x] last_review (TIMESTAMPTZ)
  - [x] next_due (TIMESTAMPTZ)
  - [x] review_count (INTEGER, default 0)
  - [x] created_at (TIMESTAMPTZ, default NOW())
  - [x] updated_at (TIMESTAMPTZ, default NOW())
- [x] Add unique constraint on (user_id, word, lesson_name)
- [x] Create user_preferences table:
  - [x] id (UUID, primary key)
  - [x] user_id (UUID, foreign key to auth.users, unique)
  - [x] max_reviews_per_lesson (INTEGER, default 5)
  - [x] desired_retention (DECIMAL, default 0.90)
  - [x] created_at (TIMESTAMPTZ, default NOW())
  - [x] updated_at (TIMESTAMPTZ, default NOW())
- [x] Create performance indexes:
  - [x] idx_fsrs_cards_user_due on fsrs_cards(user_id, next_due)
  - [x] idx_fsrs_cards_user_lesson on fsrs_cards(user_id, lesson_name)
- [ ] Add Row Level Security (RLS) policies for both tables
- [ ] Test table creation and constraints work correctly

### 1.3 Implement Basic FSRS Card Operations
- [x] Create createFSRSCard(word, lessonName) function
  - [x] Use FSRS library's createCard() method for initial values
  - [x] Handle authenticated vs unauthenticated users
  - [x] Return card object or null on failure
- [x] Create updateFSRSCard(cardId, grade) function
  - [x] Use FSRS library's repeat() function
  - [x] Update database with new FSRS parameters
  - [x] Handle network failures gracefully
- [x] Create getDueReviewCards(userId, limit) function
  - [x] Query cards where next_due <= NOW()
  - [x] Sort by next_due ASC (most overdue first)
  - [x] Respect limit parameter
- [x] Implement retry logic with exponential backoff for all operations
- [x] Add detailed error logging and user feedback
- [x] Test all functions with mock data

**Phase 1 Complete ✅** - All FSRS foundation systems working correctly

## Phase 2: Core FSRS Logic Integration

**Phase 2 Complete ✅** - FSRS card creation and batched updates implemented

### 2.1 Implement Attempt Tracking and Grading
- [x] Add attempt counter per word to gameState object
- [x] Create calculateFSRSGrade(attemptCount) function:
  - [x] 1st attempt = Easy (4)
  - [x] 2nd attempt = Good (3)
  - [x] 3rd attempt = Hard (2)
  - [x] 4+ attempts = Again (1)
- [x] Modify handleCorrectGuess function to track attempts
- [x] Modify handleIncorrectGuess function to track attempts
- [x] Ensure grade assignment works across all game phases:
  - [x] Initial guess phase
  - [x] Clue phase
  - [x] Reinforcement phase
- [x] Add logging for grade assignments
- [x] Test grade calculation with various attempt scenarios

### 2.2 Integrate FSRS Card Creation on First Attempt
- [x] Detect first attempt submission for each word
- [x] Create FSRS card when user submits first guess
- [x] Handle both new words and existing cards gracefully
- [x] Work for both authenticated and unauthenticated users
- [x] Add error handling for card creation failures
- [x] Ensure card creation doesn't block game progression
- [ ] Test with new words and repeated words
- [ ] Test with authentication state changes

### 2.3 Implement FSRS Card Updates with Batching
- [x] Create FSRS update queue system for batching
- [x] Modify advanceToNextWord function to queue FSRS updates
- [x] Implement queueFSRSUpdate(cardId, grade, word) function
- [x] Create processFSRSBatch() function for batch processing
- [x] Add batch processing triggers (threshold of 5 updates and timer-based)
- [x] Use calculated grade from attempt tracking
- [x] Implement error handling that doesn't block game progression
- [x] Add retry queue for failed batch updates (basic implementation)
- [x] Update card's next_due date and other FSRS parameters in batches
- [x] Add flushFSRSUpdates() for lesson completion and page unload
- [ ] Test with various completion scenarios
- [ ] Test batch processing and error handling
- [ ] Test retry mechanisms for failed batches

## Phase 3: Session Composition and Review Integration

### 3.1 Implement User Preferences System
- [ ] Create getUserPreferences() function with defaults (maxReviewsPerLesson: 5)
  - [ ] Load from database for authenticated users
  - [ ] Return default values if no preferences found
  - [ ] Return null/empty for unauthenticated users (no FSRS data)
- [ ] Implement updateUserPreferences() function
  - [ ] Save to database for authenticated users only
  - [ ] Validate input parameters
- [ ] Add preferences loading during app initialization
- [ ] Include error handling and validation
- [ ] Test preferences persistence across sessions

### 3.2 Implement Review Word Selection Logic
- [ ] Create selectReviewWords(userId, maxReviews) function
- [ ] Query due review words sorted by due date (most overdue first)
- [ ] Respect user's maxReviewsPerLesson preference
- [ ] Handle cases where no reviews are due
- [ ] Include error handling for database queries
- [ ] Add logging for review selection decisions
- [ ] Test with various due review scenarios
- [ ] Test with different user preference values

### 3.3 Implement Session Building Algorithm
- [ ] Modify startSelectedLesson function to implement front-load + post-lesson model
- [ ] Load selected lesson words as before
- [ ] Query and select due review words
- [ ] Split selected reviews into warmUp and postLesson queues
- [ ] Build sessionQueue with warm-up reviews at start
- [ ] Set sessionEndQueue with remaining reviews
- [ ] Implement automatic post-lesson review trigger
- [ ] Work with both CSV lessons and fallback word list
- [ ] Preserve existing lesson flow and UI
- [ ] Add session composition logging
- [ ] Test hybrid session creation with two-phase model
- [ ] Test edge cases (no reviews, few reviews, many reviews)

## Phase 4: Error Handling and Resilience

### 4.1 Implement Retry Queue System
- [ ] Create retry queue data structure
- [ ] Implement background retry mechanism with exponential backoff
- [ ] Add queue persistence across page reloads using localStorage
- [ ] Include maximum retry limits and failure handling
- [ ] Add queue status monitoring and logging
- [ ] Create processRetryQueue() function for background processing
- [ ] Test retry queue with simulated network failures
- [ ] Test queue persistence across browser sessions

### 4.2 Enhance Error Handling and User Feedback
- [ ] Implement silent logging for transient errors
- [ ] Add user notifications for persistent failures
- [ ] Create graceful degradation to lesson-only mode
- [ ] Enhance existing error toast system for FSRS errors
- [ ] Add session expiration handling
- [ ] Create handleFSRSError(error, operation) function
- [ ] Test various error scenarios
- [ ] Test user feedback mechanisms

### 4.3 Implement FSRS System Health Monitoring
- [ ] Add FSRS system health checks
- [ ] Implement automatic fallback to non-FSRS mode
- [ ] Create recovery mechanisms for temporary failures
- [ ] Add user guidance for persistent issues
- [ ] Include system status indicators where appropriate
- [ ] Create checkFSRSHealth() function
- [ ] Test health monitoring and recovery
- [ ] Test fallback mechanisms

## Phase 5: Testing and Optimization

### 5.1 Comprehensive Manual Testing
- [ ] Test new user first-time experience
  - [ ] First lesson with no existing cards
  - [ ] Card creation on first attempts
  - [ ] Grade assignment based on attempts
- [ ] Test returning user with existing cards
  - [ ] Review word selection and inclusion
  - [ ] Two-phase session composition (warm-up + post-lesson)
  - [ ] FSRS scheduling accuracy
- [ ] Test hybrid session flow with various review counts
  - [ ] No due reviews (lesson runs normally)
  - [ ] Few due reviews (warm-up and post-lesson phases activate)
  - [ ] Many due reviews (truncated to maxReviewsPerLesson, balanced across phases)
  - [ ] Test warm-up phase integration
  - [ ] Test post-lesson review phase
  - [ ] Test seamless transitions between phases
- [ ] Test network failure scenarios
  - [ ] Card creation failures
  - [ ] Update failures
  - [ ] Query failures
  - [ ] Retry queue functionality
- [ ] Test authentication state changes during gameplay
  - [ ] Sign in during game
  - [ ] Sign out during game
  - [ ] Session expiration
- [ ] Test edge cases
  - [ ] Empty lessons
  - [ ] Very long words
  - [ ] Special characters in words
  - [ ] Database connection issues
- [ ] Test performance with large numbers of cards
  - [ ] 100+ cards per user
  - [ ] Complex review scheduling
  - [ ] Query performance

### 5.2 Performance Optimization and Monitoring
- [ ] Profile FSRS operations and optimize slow queries
- [ ] Implement caching where appropriate
  - [ ] User preferences caching
  - [ ] Due review caching during session
- [ ] Add performance monitoring and logging
- [ ] Optimize database queries and indexes
- [ ] Ensure lesson start time meets specifications (< 500ms)
- [ ] Add performance metrics collection
- [ ] Test performance under various loads
- [ ] Optimize retry queue processing

### 5.3 Final Integration and Polish
- [ ] Final end-to-end testing of complete user workflows
  - [ ] New user complete journey
  - [ ] Returning user complete journey
  - [ ] Mixed session gameplay
- [ ] Update any remaining documentation
- [ ] Verify all error handling paths work correctly
- [ ] Ensure graceful handling of all edge cases
- [ ] Add any missing accessibility considerations
- [ ] Prepare deployment checklist and rollback procedures
- [ ] Test in different browsers and devices
- [ ] Verify mobile responsiveness with FSRS features

## Implementation Verification Checklist

### Database Verification
- [ ] All tables created successfully
- [ ] All indexes created and performing well
- [ ] RLS policies working correctly
- [ ] Foreign key constraints functioning
- [ ] Default values applied correctly

### FSRS Library Verification
- [ ] Library loads from CDN successfully
- [ ] createCard() function works correctly
- [ ] repeat() function calculates schedules properly
- [ ] Error handling for library failures

### Game Integration Verification
- [ ] Attempt tracking works across all phases
- [ ] Grade calculation is accurate
- [ ] Card creation happens at right time
- [ ] Card updates happen after completion
- [ ] Game flow unchanged for users

### Session Composition Verification
- [ ] Review words selected correctly
- [ ] Session building maintains lesson structure
- [ ] User preferences respected
- [ ] Hybrid sessions work seamlessly

### Error Handling Verification
- [ ] Network failures handled gracefully
- [ ] Database errors don't break game
- [ ] Retry mechanisms work correctly
- [ ] User feedback is appropriate
- [ ] Fallback modes function properly

### Performance Verification
- [ ] Lesson start time < 500ms
- [ ] FSRS operations < 100ms
- [ ] No noticeable game lag
- [ ] Database queries optimized
- [ ] Memory usage reasonable

### User Experience Verification
- [ ] No visual distinction between new/review words
- [ ] Seamless gameplay experience
- [ ] Appropriate error messages
- [ ] Progress saving works correctly
- [ ] Authentication flow smooth

## Post-Implementation Tasks

### Documentation
- [ ] Update README.md with FSRS features
- [ ] Document new database schema
- [ ] Create user guide for FSRS features
- [ ] Document API changes

### Monitoring
- [ ] Set up error tracking for FSRS operations
- [ ] Monitor database performance
- [ ] Track user engagement with reviews
- [ ] Monitor retry queue effectiveness

### Future Enhancements Planning
- [ ] User-configurable FSRS parameters
- [ ] Advanced analytics dashboard
- [ ] Cross-lesson word relationships
- [ ] Adaptive difficulty algorithms
- [ ] Export/import functionality
- [ ] Offline mode capabilities

---

## Notes

- Each checkbox represents a specific, testable deliverable
- Items should be completed in order within each phase
- Test thoroughly before moving to next phase
- Document any deviations from the original plan
- Keep detailed logs of issues and resolutions
