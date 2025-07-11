# Spelldle

An educational spelling web application inspired by Wordle's letter highlighting mechanics. Spelldle helps users improve their spelling skills through an interactive approach with audio pronunciation and visual feedback.

## Features

- **Audio-First Learning**: Text-to-speech pronunciation of words and example sentences
- **Wordle-Style Feedback**: Color-coded letter boxes showing correct/incorrect positions
- **Lesson-Based Structure**: Multiple lessons with curated word lists
- **Progress Tracking**: Visual progress counter and lesson completion stats
- **Dark Theme**: Classic dark mode interface for comfortable learning
- **Data Export**: Export learning progress and statistics

## Installation

1. Clone this repository or download the files
2. Open `spelldle.html` in a modern web browser
3. No additional installation or setup required

## Usage

### Playing the Game

1. Open `spelldle.html` in your web browser
2. Select a lesson from the dropdown menu
3. Click "Start Lesson" to begin
4. Listen to the word pronunciation and example sentence
5. Type your spelling guess in the input field
6. If incorrect, use the color-coded feedback to improve your next guess:
   - **Green**: Correct letter in correct position
   - **Yellow**: Correct letter in wrong position
   - **Gray**: Letter not in the word
7. Continue until you spell the word correctly
8. Progress through all words in the lesson

### Exporting Data

1. Open `export.html` in your web browser
2. View statistics about your spelling attempts
3. Filter data by lesson, result, or date range
4. Export data in Excel-compatible format or CSV/JSON files

## Project Structure

### Core Files

- **`spelldle.html`** - Main game application (single-file web app)
- **`export.html`** - Data export and statistics viewer
- **`test_spelling_evaluator.html`** - Test suite for spelling evaluation logic

### Documentation

- **`spec.md`** - Complete project specification and requirements
- **`prompt_plan.md`** - Step-by-step development plan and prompts
- **`todo.md`** - Development checklist and task tracking

## Technical Details

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS with dark theme
- **Audio**: Web Speech API with fallback support
- **Data Storage**: localStorage for progress tracking
- **File Format**: Single HTML files for easy deployment

## Browser Compatibility

- Modern browsers with Web Speech API support recommended
- Fallback functionality available for browsers without audio support
- Responsive design works on desktop and mobile devices

## Development

This application was developed using AI LLM models via [Aider](https://aider.chat/), following an incremental development approach with comprehensive testing and documentation.

### Development Process

1. **Specification**: Detailed requirements in `spec.md`
2. **Planning**: Step-by-step implementation plan in `prompt_plan.md`
3. **Task Tracking**: Development checklist in `todo.md`
4. **Testing**: Comprehensive test suite in `test_spelling_evaluator.html`
5. **Implementation**: Single-file application in `spelldle.html`
6. **Data Management**: Export functionality in `export.html`

## License

This project is open source. Feel free to use, modify, and distribute as needed for educational purposes.
