# Spelldle Development Todo Checklist

## Step 1: Basic HTML Structure and Dark Theme
- [ ] Create `spelldle.html` file
- [ ] Add HTML5 doctype and basic structure
- [ ] Implement CSS reset and typography
- [ ] Add classic dark theme styling (dark background, light text)
- [ ] Create main game container with proper spacing
- [ ] Add progress counter element showing "Word 1 of 12"
- [ ] Include color scheme variables:
  - [ ] Green: #6aaa64
  - [ ] Yellow: #c9b458
  - [ ] Gray: #787c7e
- [ ] Ensure responsive design and centering
- [ ] Add basic JavaScript structure with game state variables
- [ ] Test: Page displays progress counter correctly

## Step 2: Word List and Game State Management
- [ ] Add hardcoded array of 12 words with example sentences:
  - [ ] friend - "She is my best friend."
  - [ ] bright - "The sun is very bright today."
  - [ ] school - "I walk to school every morning."
  - [ ] enough - "We have enough food for dinner."
  - [ ] through - "The ball went through the window."
  - [ ] because - "I stayed home because I was sick."
  - [ ] different - "Each snowflake is different."
  - [ ] beautiful - "The sunset was beautiful tonight."
  - [ ] important - "It's important to brush your teeth."
  - [ ] knowledge - "Reading books increases your knowledge."
  - [ ] rhythm - "The music has a steady rhythm."
  - [ ] necessary - "Sleep is necessary for good health."
- [ ] Create game state object tracking:
  - [ ] Current word index (starting at 0)
  - [ ] Current phase ('initial' or 'clue')
  - [ ] Current word and sentence
- [ ] Add functions:
  - [ ] Initialize the game
  - [ ] Get current word data
  - [ ] Update progress counter display
  - [ ] Advance to next word
- [ ] Add "Start Game" button
- [ ] Test: Progress counter updates, start button works

## Step 3: Text-to-Speech System
- [ ] Add Web Speech API integration
- [ ] Implement browser compatibility check
- [ ] Display fallback message: "Audio not supported in this browser"
- [ ] Create function to speak text with pause between word and sentence
- [ ] Add "Repeat Word" button
- [ ] Implement audio caching for identical replay
- [ ] Auto-play word and sentence when new word starts
- [ ] Use browser default voice at normal speech rate
- [ ] Handle TTS errors gracefully
- [ ] Test: Audio plays automatically, repeat button works, fallback shows if needed

## Step 4: Initial Guess Phase Input
- [ ] Add single text input field for initial guess
- [ ] Style input field to match dark theme
- [ ] Disable browser features:
  - [ ] spellcheck="false"
  - [ ] autocomplete="off"
- [ ] Auto-focus input field when new word starts
- [ ] Add "Submit" button next to input
- [ ] Handle Enter key submission
- [ ] Prevent empty submissions
- [ ] Add input validation and feedback
- [ ] Implement case handling (lowercase default unless Caps Lock/Shift)
- [ ] Clear input field when starting new word
- [ ] Test: Input field works, styling correct, validation prevents empty submissions

## Step 5: Initial Guess Phase Logic and Transitions
- [ ] Add case-sensitive word comparison
- [ ] Handle correct guess:
  - [ ] Play "Correct!" via text-to-speech
  - [ ] Advance to next word after brief delay
  - [ ] Reset to Initial Guess Phase for new word
- [ ] Handle incorrect guess:
  - [ ] Transition to Clue Phase (don't clear screen)
  - [ ] Keep "Repeat Word" button visible
- [ ] Update progress counter when advancing words
- [ ] Handle game completion (after word 12):
  - [ ] Show "Game Complete!" message
  - [ ] Add "Play Again" button that resets to word 1
- [ ] Test: Correct guesses advance, incorrect guesses transition to clue phase

## Step 6: SpellingEvaluator Integration
- [ ] Copy complete SpellingEvaluator object from test_spelling_evaluator.html
- [ ] Ensure all methods included:
  - [ ] evaluate(guess, target)
  - [ ] isWin(guess, target)
  - [ ] _markLengthDifferences()
  - [ ] _processExactMatches()
  - [ ] _processWrongPositions()
- [ ] Add console.log test for integration
- [ ] Verify evaluator works with existing word list
- [ ] Test: SpellingEvaluator functions correctly in console

## Step 7: Clue Phase Feedback Display
- [ ] Create CSS classes for letter boxes:
  - [ ] Square boxes with proper dimensions
  - [ ] Green, yellow, gray backgrounds
  - [ ] Solid black borders for normal letters
  - [ ] Dotted borders for extraneous letters
  - [ ] Empty boxes with solid borders for missing letters
- [ ] Add function to render feedback boxes from SpellingEvaluator results
- [ ] Display user's incorrect guess as colored feedback boxes
- [ ] Handle extraneous letters (dotted outline)
- [ ] Handle missing letters (empty boxes)
- [ ] Ensure boxes align in grid layout
- [ ] Position feedback row above input area
- [ ] Test: Feedback boxes display correctly with proper colors and styling

## Step 8: Clue Phase Input System
- [ ] Create individual input fields (one per target word letter)
- [ ] Style input boxes to match feedback boxes (square, same size)
- [ ] Implement sequential left-to-right input:
  - [ ] Auto-focus moves to next box when letter entered
  - [ ] Backspace moves to previous box when current is empty
  - [ ] Prevent typing more than one character per box
- [ ] Position input row below feedback row
- [ ] Add submit functionality with letter count validation
- [ ] Prevent submission if not all boxes filled
- [ ] Convert input to match case handling (lowercase default)
- [ ] Test: Individual input boxes work, sequential navigation functions

## Step 9: Clue Phase Logic and Multiple Attempts
- [ ] Handle submission of letter box guesses
- [ ] Use SpellingEvaluator to check new guesses
- [ ] Handle correct guess in clue phase:
  - [ ] Play "Correct!" via text-to-speech
  - [ ] Advance to next word
- [ ] Handle incorrect guess in clue phase:
  - [ ] Add new feedback row showing latest guess
  - [ ] Add new input row below for next attempt
  - [ ] Keep all previous attempts visible
  - [ ] Clear input boxes for next attempt
- [ ] Maintain proper spacing between multiple guess rows
- [ ] Ensure "Repeat Word" button stays visible and functional
- [ ] Test: Multiple attempts work, feedback accumulates correctly

## Step 10: Final Integration and Polish
- [ ] Ensure smooth transitions between all game phases
- [ ] Verify progress counter updates correctly throughout game
- [ ] Test complete game flow from start to finish
- [ ] Add proper error handling for edge cases
- [ ] Ensure "Play Again" functionality resets all game state properly
- [ ] Verify text-to-speech works correctly for "Correct!" announcements
- [ ] Test with all 12 words in word list
- [ ] Ensure responsive design works on different screen sizes
- [ ] Add any missing visual polish for dark theme
- [ ] Verify no console errors or warnings
- [ ] Test: Complete game functions flawlessly end-to-end

## Final Testing Checklist
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test with text-to-speech enabled and disabled
- [ ] Test all 12 words from start to finish
- [ ] Test edge cases:
  - [ ] Very short guesses
  - [ ] Very long guesses
  - [ ] Mixed case input
  - [ ] Special characters (if any)
- [ ] Test responsive design on mobile
- [ ] Verify dark theme consistency
- [ ] Check for any console errors
- [ ] Validate HTML and CSS
- [ ] Test "Play Again" functionality multiple times

## Deployment Checklist
- [ ] Final code review
- [ ] Minify CSS and JavaScript (optional for MVP)
- [ ] Test final build
- [ ] Deploy to static hosting
- [ ] Test deployed version
- [ ] Document any known issues
