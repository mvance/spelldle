# FSRS Implementation Prompt Plan for Spelldle

## Project Blueprint

### Architecture Overview
- **Client-side FSRS Integration**: Add ts-fsrs library via CDN for spaced repetition calculations
- **Database Schema Migration**: Replace `spelling_attempts` with `fsrs_cards` and `user_preferences` tables
- **Hybrid Session Logic**: Mix new lesson words with due review words seamlessly
- **Performance-based Grading**: Map attempt count to FSRS grades (1-4 scale)
- **Error-resilient Storage**: Continue game flow even if FSRS operations fail

### Key Data Structures
```javascript
// FSRS Card State
{
  id: UUID,
  user_id: UUID,
  word: string,
  lesson_name: string,
  difficulty: number,
  stability: number,
  last_review: timestamp,
  next_due: timestamp,
  review_count: number
}

// User Preferences
{
  user_id: UUID,
  max_reviews_per_lesson: number (default: 4),
  desired_retention: number (default: 0.9)
}

// Session Composition
{
  lessonWords: Array<WordData>,
  reviewWords: Array<WordData>,
  totalWords: number,
  sessionQueue: Array<WordData>
}
```

### Non-Goals
- Cross-device synchronization beyond Supabase auth
- Advanced FSRS parameter customization in MVP
- Offline FSRS calculations
- Historical analytics dashboard
- Import/export of FSRS data
- Multi-language support for FSRS

### Risks and Assumptions
- **CDN Availability**: ts-fsrs library must be accessible via CDN
- **Database Migration**: Assumes clean slate approach is acceptable
- **User Acceptance**: Users won't notice seamless review integration
- **Performance**: FSRS calculations won't impact game responsiveness
- **Network Resilience**: Retry logic will handle most connectivity issues

## Phase 1: Foundation Setup
**Goal**: Establish FSRS library integration and database schema
**Exit Criteria**: FSRS library loads successfully, new database tables created, basic FSRS operations functional

### 1.1 Add FSRS Library Integration
```
Add the ts-fsrs library via CDN to index.html and create basic FSRS configuration object. Verify the library loads correctly and basic FSRS functions are accessible. Include error handling for CDN failures.

Context: The application currently uses Papa Parse and Canvas Confetti via CDN. Follow the same pattern for ts-fsrs integration.

Requirements:
- Add CDN script tag in head section: https://cdn.jsdelivr.net/npm/ts-fsrs@latest/dist/fsrs.min.js
- Create fsrsConfig object with default parameters (desiredRetention: 0.9, maxInterval: 36500)
- Add initialization check and error handling
- Test basic FSRS functions (createCard, repeat)
```

### 1.2 Create Database Schema Migration
```
Create the new database tables (fsrs_cards and user_preferences) to replace the existing spelling_attempts table. Include all necessary indexes and constraints as specified in the FSRS specification.

Context: The application currently uses a simple spelling_attempts table. We need to implement the new schema with proper relationships and performance optimizations.

Requirements:
- Drop existing spelling_attempts table
- Create fsrs_cards table with all specified columns and indexes
- Create user_preferences table with default values
- Add Row Level Security (RLS) policies for both tables
- Verify table creation and constraints work correctly
```

### 1.3 Implement Basic FSRS Card Operations
```
Create JavaScript functions for basic FSRS card operations: creating new cards, updating existing cards, and querying due cards. Include comprehensive error handling and retry logic.

Context: These will be the core functions that interface between the game logic and the FSRS system. They should handle network failures gracefully.

Requirements:
- createFSRSCard(word, lessonName) function
- updateFSRSCard(cardId, grade) function  
- getDueReviewCards(userId, limit) function
- Include retry logic with exponential backoff
- Add detailed error logging and user feedback
```

## Phase 2: Core FSRS Logic Integration
**Goal**: Integrate FSRS grading system with existing game flow
**Exit Criteria**: Game tracks attempts correctly, assigns FSRS grades, and updates cards after each word completion

### 2.1 Implement Attempt Tracking and Grading
```
Modify the existing game logic to track attempt counts per word and automatically assign FSRS grades based on the specification (1st attempt = Easy, 2nd = Good, 3rd = Hard, 4+ = Again).

Context: The game currently tracks guesses for statistics but doesn't map them to FSRS grades. We need to integrate this mapping into the existing game flow.

Requirements:
- Add attempt counter per word to gameState
- Implement grade calculation function based on attempt count
- Modify handleCorrectGuess and handleIncorrectGuess functions
- Ensure grade assignment works across all game phases (initial, clue, reinforcement)
- Add logging for grade assignments
```

### 2.2 Integrate FSRS Card Creation on First Attempt
```
Modify the game to create FSRS cards when a user submits their first guess for a word. Handle both new words and existing cards gracefully.

Context: Cards should be created at the moment of first engagement (first attempt submission) as specified. This needs to work for both lesson words and review words.

Requirements:
- Detect first attempt submission for each word
- Create FSRS card with initial values from ts-fsrs library
- Handle duplicate card creation attempts gracefully
- Work for both authenticated and unauthenticated users
- Add error handling for card creation failures
```

### 2.3 Implement FSRS Card Updates with Batching
```
Modify the word completion flow to queue FSRS updates for batched processing. Implement batching system for better performance and error handling.

Context: This integrates with the existing advanceToNextWord function and should queue updates during session, processing them in batches.

Requirements:
- Queue FSRS updates after word completion instead of immediate processing
- Use calculated grade from attempt tracking
- Implement batched update processing with threshold of 5 updates and timer-based triggers
- Implement error handling that doesn't block game progression
- Add retry queue for failed batch updates
- Update card's next_due date and other FSRS parameters in batches
```

## Phase 3: Session Composition and Review Integration
**Goal**: Implement hybrid sessions that mix lesson words with due reviews
**Exit Criteria**: Sessions seamlessly include review words, user preferences control review count, session building works correctly

### 3.1 Implement User Preferences System
```
Create the user preferences management system that allows users to configure their maximum reviews per lesson. Include default values and persistence.

Context: This system will control how many review words are included in each session. Only applies to authenticated users since unauthenticated users have no FSRS data.

Requirements:
- Create getUserPreferences() function with defaults (maxReviewsPerLesson: 5)
- Implement updateUserPreferences() function
- Add preferences loading during app initialization
- Handle authenticated users only (unauthenticated users have no reviews)
- Include error handling and validation
```

### 3.2 Implement Review Word Selection Logic
```
Create the system that queries due review words and selects them for inclusion in sessions based on user preferences and due dates.

Context: This implements the core session composition logic that determines which review words to include in each lesson.

Requirements:
- Query due review words sorted by due date (most overdue first)
- Respect user's maxReviewsPerLesson preference
- Handle cases where no reviews are due
- Include error handling for database queries
- Add logging for review selection decisions
```

### 3.3 Implement Session Building Algorithm
```
Modify the lesson start flow to build hybrid sessions using the front-load + post-lesson model. Implement warm-up reviews at start and micro-reviews at end.

Context: This modifies the existing startSelectedLesson function to create the two-phase hybrid session while maintaining the current user experience.

Requirements:
- Modify startSelectedLesson to include warm-up reviews at start
- Add post-lesson review queue for session end
- Split selected reviews between warm-up and post-lesson phases
- Maintain natural lesson flow without UI distinction
- Work with both CSV lessons and fallback word list
- Preserve existing lesson flow and UI
- Add session composition logging
- Implement automatic post-lesson review trigger
```

## Phase 4: Error Handling and Resilience
**Goal**: Implement comprehensive error handling and retry mechanisms
**Exit Criteria**: Game continues smoothly despite FSRS failures, users receive appropriate feedback, retry mechanisms work correctly

### 4.1 Implement Retry Queue System
```
Create a retry queue system that handles failed FSRS operations and attempts to retry them in the background without disrupting gameplay.

Context: Network issues or temporary database problems shouldn't break the game experience. Failed operations should be queued and retried automatically.

Requirements:
- Create retry queue data structure
- Implement background retry mechanism with exponential backoff
- Add queue persistence across page reloads
- Include maximum retry limits and failure handling
- Add queue status monitoring and logging
```

### 4.2 Enhance Error Handling and User Feedback
```
Improve error handling throughout the FSRS system to provide appropriate user feedback while ensuring game continuity. Implement the hybrid error handling approach from the specification.

Context: Users should be informed of issues without having their game experience disrupted. Different types of errors require different handling strategies.

Requirements:
- Implement silent logging for transient errors
- Add user notifications for persistent failures
- Create graceful degradation to lesson-only mode
- Enhance existing error toast system for FSRS errors
- Add session expiration handling
```

### 4.3 Implement FSRS System Health Monitoring
```
Add monitoring and health checks for the FSRS system to detect and handle various failure modes. Include recovery mechanisms and user guidance.

Context: The system should be able to detect when FSRS is unavailable and guide users appropriately while maintaining game functionality.

Requirements:
- Add FSRS system health checks
- Implement automatic fallback to non-FSRS mode
- Create recovery mechanisms for temporary failures
- Add user guidance for persistent issues
- Include system status indicators where appropriate
```

## Phase 5: Testing and Optimization
**Goal**: Comprehensive testing and performance optimization
**Exit Criteria**: All manual test scenarios pass, performance meets specifications, edge cases handled correctly

### 5.1 Comprehensive Manual Testing
```
Conduct thorough manual testing of all FSRS functionality including edge cases, error scenarios, and user workflows. Document and fix any issues found.

Context: Test all aspects of the FSRS integration to ensure it works correctly in various scenarios and user states.

Test Scenarios:
- New user first-time experience
- Returning user with existing cards
- Session composition with various review counts
- Network failure scenarios
- Authentication state changes during gameplay
- Edge cases (no due reviews, all reviews due, etc.)
- Performance with large numbers of cards
```

### 5.2 Performance Optimization and Monitoring
```
Optimize FSRS operations for performance and add monitoring to ensure the system meets the specified performance targets (< 100ms per operation, < 500ms lesson start).

Context: The FSRS system should not noticeably impact game performance. Operations should be fast and responsive.

Requirements:
- Profile FSRS operations and optimize slow queries
- Implement caching where appropriate
- Add performance monitoring and logging
- Optimize database queries and indexes
- Ensure lesson start time meets specifications
- Add performance metrics collection
```

### 5.3 Final Integration and Polish
```
Complete the FSRS integration with final polish, documentation updates, and preparation for deployment. Ensure all systems work together seamlessly.

Context: Final integration phase to ensure everything works together and the system is ready for production use.

Requirements:
- Final end-to-end testing of complete user workflows
- Update any remaining documentation
- Verify all error handling paths work correctly
- Ensure graceful handling of all edge cases
- Add any missing accessibility considerations
- Prepare deployment checklist and rollback procedures
```

## Implementation Notes

### Development Approach
- Each prompt builds incrementally on previous work
- No orphaned functionality - every step results in working code
- Error handling integrated from the beginning, not added later
- Manual testing included throughout, automated testing deferred to end
- Accessibility considerations built into core implementation

### Context for AI Assistant
- Application is a single-page HTML file with embedded JavaScript
- Uses Supabase for authentication and data storage
- Current architecture uses CDN libraries (Papa Parse, Canvas Confetti)
- Existing game flow: initial guess → clue phase → reinforcement phase
- User experience should remain seamless throughout implementation

### Success Metrics
- Learning effectiveness: Improved retention through spaced repetition
- User experience: No noticeable disruption to existing game flow
- Technical performance: All operations under specified time limits
- Reliability: 99.9% success rate for FSRS operations with graceful fallbacks
