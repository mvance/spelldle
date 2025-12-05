Based on the reference documents, here's a comprehensive compilation of all
planned FSRS features:


1. Core FSRS Integration

Library: ts-fsrs package implementation


const fsrs = new FSRS();
const card = fsrs.createCard();
const schedulingResult = fsrs.repeat(card, new Date());


FSRS Configuration:


new FSRS({
  desiredRetention: 0.9,
  maxInterval: 36500
});



2. Data Storage Structure

FSRS Data Model:


{
  fsrs: {
    "elephant": {
      difficulty: 1.3,
      stability: 2.1,
      lastReview: "2025-05-10T12:20:00Z",
      nextDue: "2025-05-12T12:20:00Z",
      history: [
        {grade: "hard", timestamp: "2025-05-10T12:20:00Z"}
      ]
    }
  }
}


Storage Location: LocalStorage with fallback to sessionStorage


3. Review Word System

Due Review Detection:


function getDueReviews(user) {
  return Object.entries(user.fsrs)
    .filter(([_, data]) => new Date(data.nextDue) <= new Date())
    .sort((a, b) => a[1].nextDue - b[1].nextDue)
    .slice(0, user.preferences.maxReviewsPerLesson);
}


Session Composition:

 • Combine new lesson words with due review words
 • Append review words to end of lesson queue
 • Limit reviews per user preference (maxReviewsPerLesson)


4. Grading System

Performance Grades:

 • "Easy": Correct on 1st attempt
 • "Good": Correct on 2nd attempt
 • "Hard": Correct on 3+ attempts
 • "Again": Surrendered after max attempts

Surrender Logic:

 • Configurable threshold (maxAttemptsBeforeSurrender: 5)
 • Show correct spelling after surrender
 • Play TTS pronunciation
 • Require reinforcement typing


5. FSRS Progress Tracking

Update Function:


export const updateFSRSData = (word, grade) => {
  const user = loadUser();
  const fsrs = initializeFSRS();
  const scheduling = fsrs.repeat(user.fsrsData[word] || fsrs.createCard(),
grade);
  user.fsrsData[word] = scheduling.card;
  saveUser(user);
};


Integration Points:

 • Called after each word completion
 • Updates difficulty, stability, next due date
 • Maintains history of attempts


6. User Interface Features

Review Indicators:


{currentWordIndex + 1} of {totalWords}
{isReviewWord && <span className="review-badge">Review</span>}


Progress Tracking:

 • Show review vs. new word status
 • Display session composition
 • Mark completed reviews


7. User Preferences

Configurable Settings:


preferences: {
  darkMode: true,
  audioEnabled: true,
  maxAttemptsBeforeSurrender: 5,
  maxReviewsPerLesson: 10
}



8. System Flow Integration

Lesson Start Process:

 1 Load lesson words
 2 Fetch due reviews for user
 3 Combine and prioritize word queue
 4 Begin mixed session (new + review)
 5 Track progress for both types
 6 Update FSRS data on completion

Data Flow:


graph TD
  A[Lesson List] --> B[Load Lesson]
  B --> C[Fetch Due Reviews]
  C --> D[Combine New + Review Words]
  D --> E[Spelling Game Flow]
  E --> F[Save Progress]
  F --> G[FSRS Updates]



9. Error Handling

FSRS-Specific Error Cases:

 • Clock changes affecting scheduling
 • Corrupted FSRS data recovery
 • Missing card initialization
 • Invalid grade values


10. Testing Requirements

FSRS Unit Tests:


describe('FSRS Calculations', () => {
  test('Easy rating increases interval', () => {
    const result = calculateNextReview('easy', currentInterval);
    expect(result.newInterval).toBeGreaterThan(currentInterval);
  });
});


Integration Scenarios:

 • Lesson with mixed new/review words
 • Review scheduling across time zones
 • Storage quota with FSRS data
 • Version updates affecting FSRS history


11. Implementation Timeline

Phase 2 Focus (3 weeks):

 • FSRS core setup and integration
 • Review word selection and queuing
 • Grading system implementation
 • Progress tracking with FSRS updates

This comprehensive FSRS system will transform the spelling game from a simple
practice tool into an adaptive learning system that optimizes long-term
retention through scientifically-backed spaced repetition algorithms.

