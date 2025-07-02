# Spelldle MVP Specification

## Overview
Spelldle is an educational spelling web application inspired by Wordle's letter highlighting mechanics. The game helps users improve their spelling skills through an interactive approach with audio pronunciation.

## Technical Stack
- **Frontend**: Vanilla JavaScript (no React or TypeScript)
- **Styling**: CSS with classic dark theme as default
- **Text-to-Speech**: Web Speech API with fallback message if unsupported
- **File**: Single HTML file named `spelldle.html`
- **State Management**: localStorage only if necessary for core functionality

## Word List
Hardcoded array of 12 words with example sentences:

1. **friend** - "She is my best friend."
2. **bright** - "The sun is very bright today."
3. **school** - "I walk to school every morning."
4. **enough** - "We have enough food for dinner."
5. **through** - "The ball went through the window."
6. **because** - "I stayed home because I was sick."
7. **different** - "Each snowflake is different."
8. **beautiful** - "The sunset was beautiful tonight."
9. **important** - "It's important to brush your teeth."
10. **knowledge** - "Reading books increases your knowledge."
11. **rhythm** - "The music has a steady rhythm."
12. **necessary** - "Sleep is necessary for good health."

## Core Features
- Progress counter at top of page: "Word 1 of 12"
- Automatic text-to-speech during initial guess phase
- "Repeat Word" button (replays same audio)
- **CASE-SENSITIVE** spelling verification
- Text entry defaults to lowercase unless Caps Lock/Shift engaged

## Gameplay Phases

### Initial Guess Phase
1. Display progress counter at top of page
2. Automatically play text-to-speech: "{WORD}: {EXAMPLE SENTENCE}" with slight pause between word and sentence
3. Show "Repeat Word" button (remains visible throughout Initial and Clue phases)
4. Present single text input field with:
   - Browser spell-checking and autocomplete disabled
   - Cursor automatically focused
   - Allow any length input
   - No empty submissions allowed
5. Submit via Enter key or Submit button
6. If correct on first attempt:
   - Text-to-speech announces "Correct!"
   - Advance to next word (skip Clue phase)

### Clue Phase (Only if Initial Guess is Incorrect)
1. **Do not clear screen** - transition from Initial Guess Phase
2. Replace input field with Wordle-style feedback:
   - Display user's guess in colored square boxes
   - Green: correct letter, correct position
   - Yellow: correct letter, wrong position  
   - Gray: incorrect letter
   - Extraneous letters: colored background with dotted light gray outline
   - Missing letters: empty boxes with solid light gray outline
3. Below feedback row, show new input row:
   - Individual input fields (one per target word letter) with light gray borders
   - Sequential left-to-right input only
   - Auto-focus moves to next box as letters entered
   - Prevent submission with incorrect letter count
4. Continue until correct spelling achieved
5. When correct:
   - Text-to-speech announces "Correct!"
   - Advance to next word

## Visual Design

### Layout
- Minimal design with no branding/title
- Progress counter at top as header
- Classic dark theme (dark background, light text)
- Letter boxes styled similar to `test_spelling_evaluator.html`

### Letter Boxes
- Square dimensions with light gray borders (#d3d6da)
- Uniform sizing with proper spacing between boxes and rows
- Sharp corners
- Grid alignment (boxes align vertically and horizontally)
- Font: display letters in entered case (lowercase default)

### Colors
- Green: #6aaa64 (correct position)
- Yellow: #c9b458 (wrong position)  
- Gray: #787c7e (not in word)
- Maintain same colors as test file for dark mode

## Input Handling
- Auto-focus on appropriate input field
- Submit with Enter key or Submit button
- No empty submissions allowed
- Sequential input flow in Clue phase
- No special keyboard shortcuts needed for MVP

## Audio Settings
- Use browser's default voice
- Normal speech rate
- Slight pause between word and example sentence
- "Repeat Word" button replays exact same audio

## Game Flow
- Start with word 1, progress through all 12 words
- After each correct spelling: TTS "Correct!" then advance
- After completing all 12 words: offer "Play Again" option
- If user navigates away/refreshes: allow without warning

## Error Handling
- Browser doesn't support TTS: show fallback message, game remains playable
- Empty submissions: prevent/ignore
- No special error states needed for MVP

## Technical Implementation Notes
- Use SpellingEvaluator from `test_spelling_evaluator.html` for guess evaluation
- Individual input fields for letter boxes (easier styling than single field)
- No animations or transitions needed
- No accessibility features required for MVP
- Stateless design preferred; localStorage only if absolutely necessary
