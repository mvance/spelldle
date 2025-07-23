# Supabase Integration Prompt Plan

## Overview

This document provides a step-by-step implementation plan for integrating Supabase authentication and data persistence into the Spelldle application. Each step builds incrementally on the previous ones, ensuring safe and manageable progress.

## Implementation Blueprint

### Phase 1: Foundation Setup
1. **Environment Setup**: Add Supabase client library and configuration
2. **CSP Updates**: Update Content Security Policy for Supabase domains
3. **Authentication State Management**: Create core auth state tracking

### Phase 2: Authentication UI
4. **Authentication Modal Structure**: Create HTML structure for auth modal
5. **Authentication Modal Styling**: Add CSS styling for auth components
6. **Email Input Phase**: Implement email collection functionality
7. **OTP Verification Phase**: Implement OTP verification functionality

### Phase 3: Authentication Logic
8. **Supabase Auth Integration**: Connect to Supabase authentication
9. **Session Management**: Handle login/logout and session persistence
10. **Authentication Flow Wiring**: Connect UI to authentication logic

### Phase 4: Data Persistence
11. **Data Storage Functions**: Create functions to save spelling attempts
12. **Authentication-Aware Storage**: Modify existing storage to use Supabase when authenticated
13. **Error Handling**: Add comprehensive error handling for storage operations

### Phase 5: Integration & Polish
14. **Header Controls**: Add logout functionality to header
15. **Authentication Flow Integration**: Wire authentication into game initialization
16. **Final Testing & Cleanup**: Ensure all components work together

---

## Step-by-Step Implementation Prompts

### Step 1: Environment Setup

**Context**: We need to add the Supabase client library and create the basic configuration structure for authentication and data persistence.

**Prompt**:
```
Add Supabase client library integration to the Spelldle application. You need to:

1. Add the Supabase JavaScript client library via CDN in the HTML head section
2. Create placeholder configuration constants for SUPABASE_URL and SUPABASE_ANON_KEY
3. Initialize the Supabase client in the JavaScript section
4. Add a basic authentication state tracking object

Requirements:
- Use Supabase JS v2 from CDN
- Place configuration constants near the top of the script section
- Initialize the client after the constants
- Create an authState object to track: isAuthenticated, user, session
- Add console logging to confirm Supabase client initialization

The application should continue to work exactly as before, but now have Supabase available for future steps.
```

### Step 2: CSP Updates

**Context**: The Content Security Policy needs to be updated to allow connections to Supabase domains.

**Prompt**:
```
Update the Content Security Policy (CSP) in the HTML head to allow connections to Supabase domains. You need to:

1. Locate the existing CSP meta tag
2. Add Supabase domains to the connect-src directive
3. Ensure the CSP allows connections to *.supabase.co domains

Requirements:
- Keep all existing CSP permissions intact
- Add https://*.supabase.co to the connect-src directive
- Maintain the existing format and structure of the CSP

The CSP should now allow the application to make requests to Supabase while maintaining security for other domains.
```

### Step 3: Authentication State Management

**Context**: We need core functions to manage authentication state and check if users are authenticated.

**Prompt**:
```
Create authentication state management functions for the Spelldle application. You need to:

1. Add functions to check authentication status
2. Add functions to update authentication state
3. Add session checking on page load
4. Add authentication state change listeners

Requirements:
- Create isAuthenticated() function that returns boolean
- Create updateAuthState(session) function to update authState object
- Create checkExistingSession() function to check for existing Supabase session on page load
- Create setupAuthStateListener() function to listen for auth state changes
- Call checkExistingSession() and setupAuthStateListener() in the DOMContentLoaded event
- Add console logging for authentication state changes
- Ensure all functions are non-blocking and don't interfere with existing game functionality

The application should continue to work as before, but now track authentication state in the background.
```

### Step 4: Authentication Modal Structure

**Context**: We need to create the HTML structure for the authentication modal with email input and OTP verification phases.

**Prompt**:
```
Create the HTML structure for the authentication modal in the Spelldle application. You need to:

1. Add a modal overlay div after the existing error modal
2. Create email input phase with email field, submit button, and skip option
3. Create OTP verification phase with OTP input, verify button, resend option, and back button
4. Add error display area for authentication errors
5. Include explanatory text about the benefits of signing in

Requirements:
- Place the modal HTML after the existing errorModal div
- Use class names that match the CSS specification: auth-modal-overlay, auth-modal-content, etc.
- Include proper input types (email for email, text with pattern for OTP)
- Set maxlength="6" and pattern="[0-9]{6}" for OTP input
- Include placeholder text for inputs
- Add proper button IDs for JavaScript event handling
- Initially hide the modal with style="display: none;"
- Hide the OTP phase initially within the modal

The modal should be structurally complete but not yet functional - that comes in later steps.
```

### Step 5: Authentication Modal Styling

**Context**: We need to add CSS styling for the authentication modal to match the existing dark theme and design patterns.

**Prompt**:
```
Add CSS styling for the authentication modal in the Spelldle application. You need to:

1. Style the modal overlay to cover the full screen with dark background
2. Style the modal content box to match existing modal styling
3. Style form inputs to match existing input styling
4. Style buttons with primary and secondary variants
5. Style error messages and responsive design

Requirements:
- Use existing CSS custom properties (--dark-bg, --dark-text, --blue, etc.)
- Make modal overlay position: fixed with full screen coverage and high z-index (2000)
- Center modal content using flexbox
- Style inputs to match existing .guess-input styling
- Primary buttons should use --blue background, secondary buttons should be transparent with border
- Add hover and focus states for interactive elements
- Include responsive design for mobile devices
- Style error messages with red background (#d73a49)
- Ensure modal content is scrollable if needed

The modal should look polished and consistent with the existing application design.
```

### Step 6: Email Input Phase

**Context**: We need to implement the functionality for the email input phase of authentication.

**Prompt**:
```
Implement the email input phase functionality for the authentication modal. You need to:

1. Create functions to show/hide the authentication modal
2. Create functions to handle email input and validation
3. Create function to send OTP via Supabase
4. Add event listeners for email phase interactions
5. Handle loading states and basic error display

Requirements:
- Create showAuthModal() function to display the modal
- Create hideAuthModal() function to hide the modal
- Create validateEmail(email) function for email format validation
- Create sendOTP(email) async function that calls supabase.auth.signInWithOtp()
- Add event listeners for email submit button, skip button, and Enter key
- Show loading state on submit button during OTP sending
- Display success message and transition to OTP phase on successful OTP send
- Display error messages for validation failures and API errors
- Add email to display span in OTP phase when transitioning

The email phase should be fully functional, allowing users to enter email and receive OTP codes.
```

### Step 7: OTP Verification Phase

**Context**: We need to implement the OTP verification functionality and related UI interactions.

**Prompt**:
```
Implement the OTP verification phase functionality for the authentication modal. You need to:

1. Create functions to handle OTP input and validation
2. Create function to verify OTP via Supabase
3. Create resend OTP functionality with cooldown timer
4. Add navigation between email and OTP phases
5. Handle successful authentication

Requirements:
- Create validateOTP(otp) function for 6-digit numeric validation
- Create verifyOTP(email, otp) async function that calls supabase.auth.verifyOtp()
- Create resendOTP() function with 60-second cooldown timer
- Add event listeners for OTP submit, resend, and back buttons
- Auto-focus OTP input when phase is shown
- Show loading states on buttons during verification
- Display countdown timer on resend button during cooldown
- On successful verification, update auth state and hide modal
- On verification failure, show error and allow retry
- Add keyboard support (Enter key to submit)

The OTP phase should be fully functional, allowing users to verify their email and complete authentication.
```

### Step 8: Supabase Auth Integration

**Context**: We need to properly integrate with Supabase authentication services and handle the authentication lifecycle.

**Prompt**:
```
Integrate Supabase authentication services into the Spelldle application. You need to:

1. Implement proper Supabase client configuration
2. Create authentication service functions
3. Handle authentication events and session management
4. Add proper error handling for authentication operations

Requirements:
- Update SUPABASE_URL and SUPABASE_ANON_KEY with placeholder values that can be configured
- Create signInWithEmail(email) function using supabase.auth.signInWithOtp()
- Create verifyEmailOTP(email, token) function using supabase.auth.verifyOtp()
- Create signOut() function using supabase.auth.signOut()
- Create getCurrentSession() function using supabase.auth.getSession()
- Set up supabase.auth.onAuthStateChange() listener to update authState
- Handle authentication errors with user-friendly messages
- Add proper async/await error handling with try-catch blocks
- Log authentication events for debugging

The application should now properly communicate with Supabase for all authentication operations.
```

### Step 9: Session Management

**Context**: We need to implement session persistence and logout functionality.

**Prompt**:
```
Implement session management and logout functionality for the Spelldle application. You need to:

1. Add session persistence checking on page load
2. Create logout functionality
3. Handle authentication state transitions
4. Manage UI state based on authentication status

Requirements:
- Modify checkExistingSession() to properly restore authenticated state from Supabase session
- Create handleSignOut() function that calls Supabase signOut and updates UI
- Create updateUIForAuthState(isAuthenticated) function to show/hide auth-dependent elements
- Add logic to show authentication modal on page load if not authenticated
- Add logic to skip authentication modal if user is already authenticated
- Handle session expiration gracefully
- Clear any cached user data on logout
- Redirect to appropriate screen after logout

The application should maintain login state across browser sessions and handle logout properly.
```

### Step 10: Authentication Flow Wiring

**Context**: We need to connect the authentication UI to the authentication logic and integrate it with the game flow.

**Prompt**:
```
Wire the authentication flow into the main game initialization and user interface. You need to:

1. Integrate authentication check into game startup
2. Connect authentication modal to game access
3. Handle skip authentication option
4. Update game initialization based on auth status

Requirements:
- Modify the DOMContentLoaded event to check authentication before showing welcome screen
- Show authentication modal immediately if user is not authenticated
- Allow users to skip authentication and play without data storage
- Update initializeLessons() to work with or without authentication
- Ensure welcome screen only shows after authentication decision is made
- Add authentication status indicator to UI (subtle indication if not authenticated)
- Handle authentication modal close/skip to continue with unauthenticated experience
- Ensure all existing game functionality works regardless of authentication status

The authentication flow should be seamlessly integrated into the game startup process.
```

### Step 11: Data Storage Functions

**Context**: We need to create functions to save spelling attempts to Supabase when users are authenticated.

**Prompt**:
```
Create Supabase data storage functions for spelling attempts in the Spelldle application. You need to:

1. Create functions to save spelling attempts to Supabase
2. Create database interaction utilities
3. Add error handling for database operations
4. Prepare for integration with existing storage logic

Requirements:
- Create saveSpellingAttemptToSupabase(guess, isCorrect) async function
- Use supabase.from('spelling_attempts').insert() to save data
- Include all required fields: lesson_name, word_target, spelling_guess, result
- Add proper error handling with try-catch blocks
- Create getSpellingAttemptsFromSupabase() function for future use
- Add database operation logging for debugging
- Handle network errors gracefully
- Return success/failure status from save operations
- Don't modify existing localStorage functions yet - that's the next step

The application should have working Supabase storage functions ready for integration.
```

### Step 12: Authentication-Aware Storage

**Context**: We need to modify the existing storage logic to use Supabase when authenticated and disable localStorage for unauthenticated users.

**Prompt**:
```
Modify the existing storage logic to be authentication-aware in the Spelldle application. You need to:

1. Update saveSpellingAttempt() function to use Supabase when authenticated
2. Disable localStorage writes for unauthenticated users
3. Maintain backward compatibility
4. Add storage status feedback

Requirements:
- Modify the existing saveSpellingAttempt(guess, isCorrect) function
- Check authentication status before deciding storage method
- If authenticated, call saveSpellingAttemptToSupabase() instead of localStorage
- If not authenticated, skip all storage (no localStorage writes)
- Add console logging to indicate which storage method is being used
- Handle storage failures gracefully without breaking game flow
- Keep existing localStorage read functions for reference/migration
- Add optional user feedback for storage failures (non-blocking)
- Ensure game continues normally regardless of storage success/failure

The application should now save data to Supabase for authenticated users and not save data for unauthenticated users.
```

### Step 13: Error Handling

**Context**: We need to add comprehensive error handling for authentication and storage operations.

**Prompt**:
```
Add comprehensive error handling for authentication and storage operations in the Spelldle application. You need to:

1. Create user-friendly error messages for common scenarios
2. Add toast notifications for non-blocking errors
3. Implement retry logic for transient failures
4. Handle edge cases and network issues

Requirements:
- Create showErrorToast(message) function for non-blocking error notifications
- Create showAuthError(message) function for authentication modal errors
- Add specific error messages for: network errors, invalid email, invalid OTP, expired OTP, rate limiting
- Implement exponential backoff retry for transient storage failures
- Handle Supabase service unavailable scenarios
- Add error recovery options (retry buttons, alternative flows)
- Ensure errors don't break game functionality
- Add error logging for debugging
- Style error toasts to match application design
- Auto-dismiss error toasts after 5 seconds

The application should handle all error scenarios gracefully with helpful user feedback.
```

### Step 14: Header Controls

**Context**: We need to add logout functionality to the header and manage authentication-related UI elements.

**Prompt**:
```
Add header controls for authentication management in the Spelldle application. You need to:

1. Add logout link to the header area
2. Show/hide authentication controls based on auth status
3. Handle logout interaction
4. Update header styling

Requirements:
- Add logout link HTML to header area (top-right position)
- Style logout link to match application design (small, blue, hover effects)
- Show logout link only when user is authenticated
- Hide logout link when user is not authenticated
- Add click event listener for logout link
- Call handleSignOut() function on logout click
- Add confirmation dialog for logout (optional but recommended)
- Update header layout to accommodate logout link
- Ensure logout link is accessible and responsive
- Add proper spacing and positioning for header controls

The header should now show appropriate controls based on authentication status.
```

### Step 15: Authentication Flow Integration

**Context**: We need to fully integrate the authentication flow with game initialization and ensure smooth user experience.

**Prompt**:
```
Complete the authentication flow integration with game initialization in the Spelldle application. You need to:

1. Integrate authentication check with welcome screen display
2. Handle authentication modal timing and flow
3. Ensure smooth transitions between auth and game states
4. Add authentication status indicators

Requirements:
- Show authentication modal immediately on page load if not authenticated
- Hide welcome screen until authentication decision is made (login or skip)
- Show welcome screen after successful authentication or skip
- Add subtle indicator when playing without authentication (optional message)
- Ensure lesson loading works regardless of authentication status
- Handle authentication modal close/escape key
- Add loading states during authentication checks
- Ensure proper focus management in authentication flow
- Handle browser back/forward navigation gracefully
- Test authentication flow with existing game functionality

The authentication flow should be seamlessly integrated and provide a smooth user experience.
```

### Step 16: Final Testing & Cleanup

**Context**: We need to ensure all components work together properly and clean up any remaining issues.

**Prompt**:
```
Perform final testing and cleanup for the Supabase integration in the Spelldle application. You need to:

1. Test all authentication flows end-to-end
2. Verify data storage works correctly
3. Clean up console logging and debug code
4. Ensure error handling works properly
5. Verify responsive design and accessibility

Requirements:
- Test complete authentication flow: email → OTP → login → game → logout
- Test skip authentication flow: skip → game (no data storage)
- Test error scenarios: invalid email, invalid OTP, network errors
- Verify spelling attempts save to Supabase when authenticated
- Verify no localStorage writes when unauthenticated
- Test session persistence across browser refresh
- Test responsive design on mobile devices
- Clean up excessive console.log statements (keep important ones)
- Verify all buttons and inputs work properly
- Test keyboard navigation and accessibility
- Ensure all existing game functionality still works
- Add final documentation comments for key functions

The application should be fully functional with Supabase integration complete and thoroughly tested.
```

---

## Implementation Notes

### Key Principles
- **Incremental Progress**: Each step builds on the previous ones
- **Backward Compatibility**: Existing functionality must continue to work
- **Error Resilience**: Authentication/storage failures shouldn't break the game
- **User Experience**: Smooth transitions and clear feedback

### Testing Strategy
- Test each step individually before moving to the next
- Verify existing functionality after each change
- Test error scenarios and edge cases
- Validate responsive design and accessibility

### Rollback Plan
- Each step is small enough to easily revert if issues arise
- Maintain git commits for each completed step
- Keep existing localStorage functions as fallback

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-23  
**Implementation Status**: Ready for execution
