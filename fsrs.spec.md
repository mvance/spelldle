# FSRS Implementation Specification for Spelldle

## Overview

This specification outlines the implementation of FSRS (Free Spaced Repetition Scheduler) into the existing Spelldle spelling game. The implementation will transform Spelldle from a simple lesson-based practice tool into an adaptive learning system that optimizes long-term retention through scientifically-backed spaced repetition algorithms.

## Core Integration Strategy

### Hybrid Session Approach
- **Primary Method**: Mix new lesson words with due review words in each session
- **User Experience**: Seamless integration where users don't distinguish between new and review words
- **Session Composition**: Configurable balance between new learning and review reinforcement

## Database Schema Changes

### Migration Strategy: Clean Slate
- **Approach**: Drop existing `spelling_attempts` table and implement new FSRS-based schema
- **Justification**: Existing data is minimal test data; clean implementation preferred over migration complexity

### New Database Tables

#### 1. `fsrs_cards` Table
```sql
CREATE TABLE fsrs_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    lesson_name TEXT NOT NULL,
    difficulty DECIMAL(10,6) NOT NULL DEFAULT 1.3,
    stability DECIMAL(10,6) NOT NULL DEFAULT 2.1,
    last_review TIMESTAMPTZ,
    next_due TIMESTAMPTZ NOT NULL,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word, lesson_name)
);

-- Indexes for performance
CREATE INDEX idx_fsrs_cards_user_due ON fsrs_cards(user_id, next_due);
CREATE INDEX idx_fsrs_cards_user_lesson ON fsrs_cards(user_id, lesson_name);
```

#### 2. `user_preferences` Table
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    max_reviews_per_lesson INTEGER NOT NULL DEFAULT 4,
    desired_retention DECIMAL(3,2) NOT NULL DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## FSRS Library Integration

### Implementation Method: CDN Integration
- **Library**: ts-fsrs via CDN (matching existing architecture with Papa Parse, Canvas Confetti)
- **CDN URL**: `https://cdn.jsdelivr.net/npm/ts-fsrs@latest/dist/fsrs.min.js`
- **Integration Point**: Add to `index.html` head section alongside existing CDN libraries

### FSRS Configuration
```javascript
const fsrsConfig = {
    desiredRetention: 0.9,        // 90% retention rate
    maxInterval: 36500,           // ~100 years maximum interval
    // Additional standard FSRS parameters as defaults
};
```

## Grading System

### Performance Mapping to FSRS Grades
Based on attempt count within the current game flow:

- **Easy (4)**: Correct on 1st attempt (initial guess phase)
- **Good (3)**: Correct on 2nd attempt (first clue phase guess)  
- **Hard (2)**: Correct on 3rd attempt (second clue phase guess)
- **Again (1)**: Requires 4+ attempts (third+ clue phase guess)

### Implementation Notes
- No "give up" button required
- Natural progression through existing game phases
- Automatic grade assignment based on attempt tracking

## Session Composition Logic

### Review Word Selection
- **Strategy**: Strict due date adherence (`next_due <= current_time`)
- **Ordering**: Most overdue words first, sorted by `next_due` ascending
- **Integration**: Append review words to end of lesson word list

### User Preference System
- **Setting**: `maxReviewsPerLesson` (default: 4)
- **Storage**: `user_preferences` table
- **Behavior**: Limit review words per session to user's preference
- **Fallback**: Use default value for unauthenticated users

### Session Building Algorithm
```
1. Load selected lesson words (e.g., 12 words)
2. Query due review words for user (WHERE next_due <= NOW())
3. Sort reviews by next_due ASC (most overdue first)
4. Take MIN(due_review_count, user.max_reviews_per_lesson) reviews
5. Replace last N lesson words with selected reviews
6. Final session: [lesson_words[0...(12-review_count)], review_words]
```

## User Interface Integration

### Visual Approach: Minimal/Seamless
- **Philosophy**: No visual distinction between new words and reviews
- **Progress Counter**: Standard format ("Word 3 of 12") without type indicators
- **User Experience**: Seamless learning without cognitive overhead of categorization

### Lesson Completion Stats
- **Display**: Transparent combined statistics
- **Format**: "12 words completed, 85% accuracy, 2:34 duration"
- **Approach**: No separation between new word vs. review performance

## FSRS Data Management

### Card Creation Timing
- **Trigger**: First attempt submission (when user submits their first guess)
- **Initial State**: Use FSRS library's `createCard()` method for default values
- **Data**: Store in `fsrs_cards` table with user_id, word, lesson_name

### Update Timing
- **When**: After each word completion (immediate update after final attempt)
- **Method**: Call FSRS `repeat()` function with performance grade
- **Error Handling**: Continue game flow even if update fails

### Review Word Loading
- **Timing**: Lesson start time (when user clicks "Start Lesson")
- **Query**: `SELECT * FROM fsrs_cards WHERE user_id = ? AND next_due <= NOW() ORDER BY next_due ASC LIMIT ?`
- **Caching**: Load once per session, no real-time updates during gameplay

## Error Handling Strategy

### Hybrid Approach for FSRS Failures
1. **Silent Logging**: Log all FSRS errors for debugging without user interruption
2. **Retry Queue**: Queue failed FSRS updates for background retry attempts
3. **Graceful Degradation**: Continue with lesson-only mode if FSRS completely unavailable
4. **User Notification**: Only notify users of persistent FSRS failures (not transient errors)

### Implementation Details
```javascript
async function updateFSRSCard(word, grade) {
    try {
        // Attempt FSRS update
        await saveFSRSUpdate(word, grade);
    } catch (error) {
        // Log silently
        console.error('FSRS update failed:', error);
        
        // Queue for retry
        queueFailedUpdate(word, grade);
        
        // Continue game flow regardless
    }
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Add FSRS library via CDN
- Create new database tables
- Implement basic FSRS card creation and updates
- Add user preferences system

### Phase 2: Session Integration (Week 2)  
- Implement review word selection logic
- Modify lesson start flow to include reviews
- Add session composition algorithm
- Implement grading system based on attempts

### Phase 3: Error Handling & Polish (Week 3)
- Implement comprehensive error handling
- Add retry queue for failed updates
- Performance optimization and testing
- Documentation and deployment

## Technical Implementation Notes

### Database Considerations
- Use UUID primary keys for scalability
- Add appropriate indexes for query performance
- Implement soft deletes if data retention needed
- Consider partitioning for large user bases

### Performance Optimizations
- Cache user preferences for session duration
- Batch FSRS updates where possible
- Use database transactions for consistency
- Implement connection pooling for Supabase

### Security Considerations
- Row Level Security (RLS) on all new tables
- Validate user ownership of FSRS cards
- Sanitize all user inputs
- Rate limiting on FSRS update operations

## Testing Strategy

### Unit Tests
- FSRS grade calculation logic
- Session composition algorithms
- Error handling scenarios
- Database operations

### Integration Tests
- End-to-end lesson flow with reviews
- Authentication integration
- Error recovery scenarios
- Performance under load

### User Acceptance Testing
- Seamless user experience validation
- Learning effectiveness measurement
- Performance impact assessment
- Cross-device compatibility

## Success Metrics

### Learning Effectiveness
- Improved long-term retention rates
- Reduced time to mastery
- Optimal review scheduling accuracy

### User Experience
- Seamless integration (no user confusion)
- Maintained game flow and engagement
- Performance impact < 100ms per operation

### Technical Performance
- 99.9% FSRS update success rate
- < 500ms lesson start time with reviews
- Graceful handling of all error scenarios

## Future Enhancements

### Potential Additions (Post-MVP)
- User-configurable FSRS parameters
- Advanced analytics and progress tracking
- Cross-lesson word relationship tracking
- Adaptive difficulty based on user performance
- Export/import of FSRS data
- Offline mode with sync capabilities

## Migration and Deployment

### Database Migration
```sql
-- Drop existing table
DROP TABLE IF EXISTS spelling_attempts;

-- Create new tables (as specified above)
-- Run table creation scripts
-- Set up RLS policies
-- Create indexes
```

### Code Deployment
- Feature flag for FSRS system
- Gradual rollout to user segments
- Monitoring and rollback procedures
- Performance baseline establishment

---

This specification provides a comprehensive roadmap for implementing FSRS into Spelldle while maintaining the existing user experience and adding powerful spaced repetition capabilities for enhanced learning outcomes.
