# Spelldle Implementation Prompt Plan

## Overview
This document contains a series of prompts for implementing Spelldle incrementally. Each step builds on the previous one, ensuring a working application at each stage.

## Step 1: Basic HTML Structure and Dark Theme

```
Create the basic HTML structure for Spelldle with dark theme styling. 

Requirements:
- Create `spelldle.html` as a single-file application
- Implement a classic dark theme (dark background, light text)
- Add a progress counter at the top that shows "Word 1 of 12"
- Include basic CSS reset and typography
- Add a main game container with proper spacing
- Use the color scheme from the specification:
  - Green: #6aaa64
  - Yellow: #c9b458  
  - Gray: #787c7e
- Ensure the page is responsive and centered
- Add basic JavaScript structure with game state variables

The page should display the progress counter and be ready for additional game elements.
```

## Step 2: Word List and Game State Management

```
Add the word list and basic game state management to the existing spelldle.html.

Requirements:
- Add the hardcoded array of 12 words with example sentences as specified in spec.md
- Create a game state object to track:
  - Current word index (starting at 0)
  - Current phase ('initial' or 'clue')
  - Current word and sentence
- Add functions to:
  - Initialize the game
  - Get current word data
  - Update progress counter display
  - Advance to next word
- Update the progress counter to show actual current word number
- Add a simple "Start Game" button that initializes the first word

The page should now show "Word 1 of 12" and display the start button. Clicking start should update to show the current word being practiced.
```

## Step 3: Text-to-Speech System

```
Implement the text-to-speech system with fallback handling.

Requirements:
- Add Web Speech API integration with browser compatibility check
- Display fallback message if TTS is not supported: "Audio not supported in this browser"
- Create a function to speak text with slight pause between word and sentence
- Add "Repeat Word" button that replays the same audio
- Implement audio caching so "Repeat Word" plays identical audio
- Auto-play the word and sentence when a new word starts
- Use browser default voice at normal speech rate
- Handle TTS errors gracefully

The page should now automatically speak the first word and sentence when started, with a working "Repeat Word" button. If TTS isn't supported, show the fallback message but keep the game playable.
```

## Step 4: Initial Guess Phase Input

```
Implement the Initial Guess Phase input system.

Requirements:
- Add a single text input field for the initial guess
- Style the input field to match the dark theme
- Disable browser spell-checking and autocomplete (spellcheck="false", autocomplete="off")
- Auto-focus the input field when a new word starts
- Add a "Submit" button next to the input
- Handle Enter key submission
- Prevent empty submissions
- Add input validation and feedback
- Text should default to lowercase unless Caps Lock/Shift are used
- Clear the input field when starting a new word

The page should now allow users to type their initial guess and submit it. The input should be properly styled and focused automatically.
```

## Step 5: Initial Guess Phase Logic and Transitions

```
Implement the logic for handling initial guess submissions and game transitions.

Requirements:
- Add case-sensitive word comparison for initial guesses
- If guess is correct:
  - Play "Correct!" via text-to-speech
  - Advance to next word after a brief delay
  - Reset to Initial Guess Phase for new word
- If guess is incorrect:
  - Transition to Clue Phase (don't clear screen)
  - Keep the "Repeat Word" button visible
- Update progress counter when advancing words
- Handle game completion (after word 12):
  - Show "Game Complete!" message
  - Add "Play Again" button that resets to word 1

The game should now handle correct initial guesses by advancing to the next word, and incorrect guesses by preparing for the Clue Phase.
```

## Step 6: SpellingEvaluator Integration

```
Extract and integrate the SpellingEvaluator from test_spelling_evaluator.html into spelldle.html.

Requirements:
- Copy the complete SpellingEvaluator object from test_spelling_evaluator.html
- Ensure all methods are properly included:
  - evaluate(guess, target)
  - isWin(guess, target)
  - All private helper methods
- Test the integration by adding a simple console.log test
- Verify the evaluator works with the existing word list

The SpellingEvaluator should now be available in the game and ready to provide Wordle-style feedback for incorrect guesses.
```

## Step 7: Clue Phase Feedback Display

```
Implement the Wordle-style feedback display for the Clue Phase.

Requirements:
- Create CSS classes for letter boxes matching the test file styling:
  - Square boxes with proper dimensions
  - Green, yellow, gray backgrounds
  - Solid light gray borders for normal letters (#d3d6da)
  - Dotted light gray borders for extraneous letters
  - Empty boxes with solid light gray borders for missing letters
- Add function to render feedback boxes from SpellingEvaluator results
- Display the user's incorrect guess as colored feedback boxes
- Handle extraneous letters (dotted light gray outline) and missing letters (empty boxes)
- Ensure boxes align in a grid layout
- Position feedback row above where the new input will go

When a user makes an incorrect initial guess, the game should now display their guess as colored Wordle-style boxes with light gray borders showing which letters were correct, wrong position, or not in the word.
```

## Step 8: Clue Phase Input System

```
Implement the individual letter input boxes for the Clue Phase.

Requirements:
- Create individual input fields (one per target word letter)
- Style input boxes to match the feedback boxes (square, same size)
- Implement sequential left-to-right input:
  - Auto-focus moves to next box when letter is entered
  - Backspace moves to previous box when current is empty
  - Prevent typing more than one character per box
- Position input row below the feedback row
- Add submit functionality that validates letter count
- Prevent submission if not all boxes are filled
- Convert input to match case handling (lowercase default)

The Clue Phase should now show the feedback boxes and provide individual input boxes below for the next guess attempt.
```

## Step 9: Clue Phase Logic and Multiple Attempts

```
Implement the complete Clue Phase logic with multiple guess attempts.

Requirements:
- Handle submission of letter box guesses
- Use SpellingEvaluator to check new guesses
- If guess is correct:
  - Play "Correct!" via text-to-speech
  - Advance to next word
- If guess is incorrect:
  - Add new feedback row showing the latest guess
  - Add new input row below for next attempt
  - Keep all previous attempts visible
  - Clear the input boxes for next attempt
- Maintain proper spacing between multiple guess rows
- Ensure "Repeat Word" button stays visible and functional

Users should now be able to make multiple attempts in the Clue Phase, with each attempt showing feedback and allowing another guess until they spell the word correctly.
```

## Step 10: Final Integration and Polish

```
Complete the game integration and add final polish.

Requirements:
- Ensure smooth transitions between all game phases
- Verify progress counter updates correctly throughout the game
- Test complete game flow from start to finish
- Add proper error handling for edge cases
- Ensure "Play Again" functionality resets all game state properly
- Verify text-to-speech works correctly for "Correct!" announcements
- Test with all 12 words in the word list
- Ensure responsive design works on different screen sizes
- Add any missing visual polish for the dark theme
- Verify no console errors or warnings

The complete Spelldle game should now be fully functional with all features working together seamlessly.
```

## Implementation Notes

Each step should be implemented and tested before moving to the next. The prompts are designed to:

1. Build incrementally without breaking existing functionality
2. Maintain a working application at each stage
3. Integrate new features with previous work
4. Follow the specification requirements exactly
5. Use best practices for vanilla JavaScript and CSS

The final result will be a complete, single-file Spelldle game that matches all requirements in the specification.
