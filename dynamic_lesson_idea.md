# Dynamic Lesson Functionality - Feature Specification

## Overview

The dynamic lesson functionality aims to enhance Spelldle's existing lesson system by adding intelligent, adaptive lesson options that respond to user progress and learning needs. This feature transforms the static lesson dropdown into a dynamic system that offers personalized learning experiences.

## Core Feature: Dedicated Review Sessions

### What It Is
A dedicated "Review Due Cards" option that appears dynamically in the lesson dropdown, allowing users to practice only their overdue spaced repetition cards without mixing in new lesson content.

### User Experience

#### Discovery
- **Visibility**: The review option only appears when the user is authenticated AND has cards that are due for review
- **Positioning**: Appears at the top of the lesson dropdown, above regular lessons
- **Labeling**: Shows as "Review Due Cards (X available)" where X is the count of due cards

#### Starting a Review Session
1. User sees the dynamic review option in the lesson dropdown
2. Selects "Review Due Cards (X available)"
3. Clicks "Start Review" (button text changes contextually)
4. System builds a session containing only due review cards

#### During Review Session
- **Progress Display**: Shows "Review X of Y" instead of lesson-based progress
- **Game Mechanics**: Identical to regular lessons (initial guess → clues → reinforcement)
- **No Visual Distinction**: Review words look and behave exactly like lesson words
- **Session Size**: Limited to 10-15 cards to prevent fatigue

#### Completing Review Session
- **Completion Modal**: Shows "Review Session Complete!" instead of "Lesson Complete!"
- **Statistics**: Focuses on review performance (accuracy, duration) without lesson context
- **Navigation Options**:
  - "More Reviews" (if additional due cards are available)
  - "Choose Lesson" (return to lesson selection)
  - No "Next Lesson" progression (since reviews are cross-lesson)

### Learning Benefits

#### Focused Practice
- **Pure Review**: No new words mixed in, allowing focused reinforcement of known vocabulary
- **Spaced Repetition**: Cards appear based on scientific FSRS scheduling
- **Prioritization**: Most overdue cards appear first for maximum learning impact

#### User Control
- **On-Demand**: Users can practice reviews whenever they want
- **Flexible**: Can do multiple review sessions in sequence
- **Efficient**: Separates new learning from retention practice

## Technical Behavior

### Session Composition
- **Pure Review Content**: Only contains cards that are due according to FSRS scheduling
- **Deduplication**: If the same word appears in multiple lessons, only the most overdue instance is included
- **Ordering**: Cards sorted by due date (most overdue first)
- **Size Limiting**: Maximum 10-15 cards per session to maintain engagement

### Integration with Existing Systems
- **FSRS Updates**: Review sessions update FSRS cards normally based on performance
- **Authentication**: Only available to authenticated users (requires FSRS data)
- **Error Handling**: Graceful fallback to regular lesson selection if issues occur
- **Performance**: Real-time due card checking without noticeable delay

### Dynamic Behavior
- **Real-Time Updates**: Review option appears/disappears based on current due card status
- **Authentication Responsive**: Option only shows when user is signed in
- **Session Aware**: After completing reviews, checks for additional due cards

## User Interface Design

### Lesson Dropdown Enhancement
- **Dynamic Options**: Dropdown content changes based on user state and data
- **Clear Labeling**: Review option clearly distinguished from regular lessons
- **Count Display**: Shows exact number of available reviews for transparency
- **Loading States**: Smooth loading indicators while checking for due cards

### Progress and Completion
- **Contextual Progress**: Different progress counter format for review sessions
- **Appropriate Completion**: Review-specific completion modal and statistics
- **Smart Navigation**: Context-aware next action options

## Edge Cases and Error Handling

### Authentication States
- **Unauthenticated Users**: Review option never appears (no FSRS data)
- **Session Expiration**: Graceful handling if user loses authentication during review
- **Sign-In During Session**: Proper state management for authentication changes

### Data Availability
- **No Due Cards**: Review option disappears when no cards are due
- **Cards Become Unavailable**: Handle case where due cards change between dropdown load and session start
- **Database Errors**: Fallback to regular lesson selection with appropriate user feedback

### Performance Considerations
- **Large Card Counts**: Efficient handling of users with many due cards
- **Network Issues**: Retry logic for due card queries
- **Caching**: Avoid repeated queries during session

## Future Enhancement Possibilities

### Advanced Review Options
- **Filtering**: Filter reviews by lesson, difficulty level, or date range
- **Custom Batch Sizes**: User preference for review session length
- **Review Scheduling**: Suggested optimal review times based on due cards

### Analytics and Insights
- **Review Streaks**: Track consecutive days with completed reviews
- **Retention Metrics**: Measure improvement in long-term retention
- **Performance Trends**: Show review accuracy over time
- **Learning Insights**: Identify words that need more practice

### Gamification Elements
- **Review Challenges**: Daily review goals or streaks
- **Progress Visualization**: Charts showing retention improvement
- **Achievement System**: Badges for consistent review practice

## Success Criteria

### User Adoption
- Users discover and use the review option when it appears
- High completion rate for started review sessions
- Users return for additional review sessions

### Learning Effectiveness
- Improved long-term retention of previously learned words
- Efficient use of study time through focused review practice
- Positive user feedback on the review experience

### Technical Performance
- Review sessions start quickly (< 500ms)
- Smooth integration with existing game flow
- Reliable due card detection and session building

## Design Philosophy

### Seamless Integration
The dynamic lesson functionality should feel like a natural extension of the existing lesson system, not a separate feature bolted on. Users should intuitively understand how to use it without additional explanation.

### User-Centric Design
The feature should serve the user's learning needs by providing exactly what they need when they need it - focused review practice when cards are due, and regular lessons when they want to learn new content.

### Scientific Foundation
All review scheduling should be based on the proven FSRS algorithm, ensuring that users practice words at scientifically optimal intervals for maximum retention.

---

This dynamic lesson functionality transforms Spelldle from a static lesson system into an adaptive learning platform that responds to individual user progress and optimizes long-term learning outcomes.
