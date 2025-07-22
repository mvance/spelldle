Here’s the idea:
Spelldle is intended to be an educational spelling web application inspired by Wordle's letter highlighting mechanics. The game helps users improve their spelling skills through an interactive approach with audio pronunciation.

Throughout the development process, I want to prioritize a **WORKING** game. Ideally, I would like to one-shot a working minimum viable game including everything seen below. That way I can test and detect bug before getting too far off track.

The guess evaluation and clue algorithm has proven difficult to get correct, so I created a reference implementation and test suite (`test_spelling_evaluator.html`).

## Technical Stack

- **Frontend**: Vanilla JavaScript (no React or TypeScript)
- **State Management**: To be determined (via CDN)
- **Text-to-Speech**: Web Speech API
- **Styling**: CSS (with dark mode as default)
- **Deployment**: Static hosting (no backend required initially)

## Core Features
- Generate 12 word list and sample sentences to start
- Automatic text-to-speech during initial guess phase
- Lesson progress counter (e.g., "Word 1 of 28")
- **CASE-SENSITIVE** spelling verification

## Gameplay Phases

### Initial Guess Phase
- Automatically play text-to-speech (<WORD>: <EXAMPLE SENTENCE.>), ex: "spin: Give the wheel a spin."
- "Repeat Word" button available for manual re-hearing of word and example sentence (buttons stays visible throughout Initial and Clue)
- User enters first spelling attempt into a single blank text field WITHOUT any visual clues or feedback
- Browser spell-checking and autocomplete disabled
- Cursor automatically placed in input field
- Submit button and Enter key functionality
- If word is entered correctly on first attempt, text-to-speech announces, "Correct!", then skip Clue phase and move to next word

### Clue Phase (Only if Initial Guess is Incorrect)
- DO NOT clear screen between Initial Guess Phase and Clue Phase
- Display Wordle-style boxes on a grid with colored backgrounds
- Show black-outlined boxes matching correct word length
- Extraneous guessed letters: colored background boxes with dotted line outline
  - Green: correct letter, correct position
  - Yellow: correct letter, wrong position
  - Gray: incorrect letter
- Provide a new row of individual black-outlined boxes (one box for each letter in the target word) **BELOW** the clue row for typing in the next guess
- Number of boxes corresponds to the number of letters in the target word
- Allow multiple guesses until correct spelling achieved

#### User Interface
- Uniform-sized square letter boxes, layed out on a grid so boxes align both vertically and horizontally
- Move focus to next box as letters are entered
- Prevent submissions with incorrect letter count during CLUE phase
- User must keep guessing until they successfully spell the target word before moving on to the next word

## Input Handling
- Auto-focus on first box of each new input row
- Submit guesses with Enter key or Submit button
- Do not allow empty submissions
