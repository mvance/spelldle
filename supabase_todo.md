# Supabase Integration TODO Checklist

## Phase 1: Foundation Setup

### Step 1: Environment Setup
- [ ] Add Supabase JavaScript client library via CDN in HTML head
- [ ] Create SUPABASE_URL configuration constant (placeholder)
- [ ] Create SUPABASE_ANON_KEY configuration constant (placeholder)
- [ ] Initialize Supabase client in JavaScript section
- [ ] Create authState object to track authentication state
- [ ] Add console logging to confirm Supabase client initialization
- [ ] Verify application continues to work as before

### Step 2: CSP Updates
- [ ] Locate existing CSP meta tag in HTML head
- [ ] Add https://*.supabase.co to connect-src directive
- [ ] Maintain all existing CSP permissions
- [ ] Verify CSP format and structure remains correct
- [ ] Test that application can connect to Supabase domains

### Step 3: Authentication State Management
- [ ] Create isAuthenticated() function that returns boolean
- [ ] Create updateAuthState(session) function to update authState object
- [ ] Create checkExistingSession() function for page load session check
- [ ] Create setupAuthStateListener() function for auth state changes
- [ ] Call checkExistingSession() in DOMContentLoaded event
- [ ] Call setupAuthStateListener() in DOMContentLoaded event
- [ ] Add console logging for authentication state changes
- [ ] Ensure functions are non-blocking and don't interfere with game

## Phase 2: Authentication UI

### Step 4: Authentication Modal Structure
- [ ] Add auth modal overlay div after existing error modal
- [ ] Create email input phase with proper form elements
- [ ] Create OTP verification phase with proper form elements
- [ ] Add error display area for authentication errors
- [ ] Include explanatory text about benefits of signing in
- [ ] Use correct class names (auth-modal-overlay, auth-modal-content, etc.)
- [ ] Set proper input types (email, text with pattern)
- [ ] Set maxlength="6" and pattern="[0-9]{6}" for OTP input
- [ ] Add placeholder text for all inputs
- [ ] Add proper button IDs for JavaScript event handling
- [ ] Initially hide modal with style="display: none;"
- [ ] Initially hide OTP phase within modal

### Step 5: Authentication Modal Styling
- [ ] Style modal overlay with full screen coverage and dark background
- [ ] Style modal content box to match existing modal styling
- [ ] Style form inputs to match existing .guess-input styling
- [ ] Style primary buttons with --blue background
- [ ] Style secondary buttons as transparent with border
- [ ] Add hover and focus states for interactive elements
- [ ] Include responsive design for mobile devices
- [ ] Style error messages with red background (#d73a49)
- [ ] Ensure modal content is scrollable if needed
- [ ] Use existing CSS custom properties consistently

### Step 6: Email Input Phase
- [ ] Create showAuthModal() function to display modal
- [ ] Create hideAuthModal() function to hide modal
- [ ] Create validateEmail(email) function for email format validation
- [ ] Create sendOTP(email) async function using supabase.auth.signInWithOtp()
- [ ] Add event listener for email submit button
- [ ] Add event listener for skip button
- [ ] Add event listener for Enter key in email input
- [ ] Show loading state on submit button during OTP sending
- [ ] Display success message on successful OTP send
- [ ] Transition to OTP phase on successful OTP send
- [ ] Display error messages for validation failures
- [ ] Display error messages for API errors
- [ ] Add email to display span in OTP phase

### Step 7: OTP Verification Phase
- [ ] Create validateOTP(otp) function for 6-digit numeric validation
- [ ] Create verifyOTP(email, otp) async function using supabase.auth.verifyOtp()
- [ ] Create resendOTP() function with 60-second cooldown timer
- [ ] Add event listener for OTP submit button
- [ ] Add event listener for resend button
- [ ] Add event listener for back to email button
- [ ] Auto-focus OTP input when phase is shown
- [ ] Show loading states on buttons during verification
- [ ] Display countdown timer on resend button during cooldown
- [ ] Update auth state on successful verification
- [ ] Hide modal on successful verification
- [ ] Show error on verification failure and allow retry
- [ ] Add keyboard support (Enter key to submit)

## Phase 3: Authentication Logic

### Step 8: Supabase Auth Integration
- [ ] Update SUPABASE_URL with configurable placeholder value
- [ ] Update SUPABASE_ANON_KEY with configurable placeholder value
- [ ] Create signInWithEmail(email) function using supabase.auth.signInWithOtp()
- [ ] Create verifyEmailOTP(email, token) function using supabase.auth.verifyOtp()
- [ ] Create signOut() function using supabase.auth.signOut()
- [ ] Create getCurrentSession() function using supabase.auth.getSession()
- [ ] Set up supabase.auth.onAuthStateChange() listener
- [ ] Handle authentication errors with user-friendly messages
- [ ] Add proper async/await error handling with try-catch blocks
- [ ] Log authentication events for debugging

### Step 9: Session Management
- [ ] Modify checkExistingSession() to restore authenticated state from Supabase
- [ ] Create handleSignOut() function that calls Supabase signOut
- [ ] Create updateUIForAuthState(isAuthenticated) function
- [ ] Add logic to show auth modal on page load if not authenticated
- [ ] Add logic to skip auth modal if user is already authenticated
- [ ] Handle session expiration gracefully
- [ ] Clear cached user data on logout
- [ ] Redirect to appropriate screen after logout

### Step 10: Authentication Flow Wiring
- [ ] Modify DOMContentLoaded event to check auth before showing welcome screen
- [ ] Show authentication modal immediately if user not authenticated
- [ ] Allow users to skip authentication and play without data storage
- [ ] Update initializeLessons() to work with or without authentication
- [ ] Ensure welcome screen shows only after authentication decision
- [ ] Add authentication status indicator to UI
- [ ] Handle authentication modal close/skip for unauthenticated experience
- [ ] Ensure all existing game functionality works regardless of auth status

## Phase 4: Data Persistence

### Step 11: Data Storage Functions
- [ ] Create saveSpellingAttemptToSupabase(guess, isCorrect) async function
- [ ] Use supabase.from('spelling_attempts').insert() to save data
- [ ] Include all required fields: lesson_name, word_target, spelling_guess, result
- [ ] Add proper error handling with try-catch blocks
- [ ] Create getSpellingAttemptsFromSupabase() function for future use
- [ ] Add database operation logging for debugging
- [ ] Handle network errors gracefully
- [ ] Return success/failure status from save operations
- [ ] Keep existing localStorage functions unchanged for now

### Step 12: Authentication-Aware Storage
- [ ] Modify existing saveSpellingAttempt(guess, isCorrect) function
- [ ] Check authentication status before deciding storage method
- [ ] Call saveSpellingAttemptToSupabase() if authenticated
- [ ] Skip all storage (no localStorage writes) if not authenticated
- [ ] Add console logging to indicate which storage method is used
- [ ] Handle storage failures gracefully without breaking game flow
- [ ] Keep existing localStorage read functions for reference/migration
- [ ] Add optional user feedback for storage failures (non-blocking)
- [ ] Ensure game continues normally regardless of storage success/failure

### Step 13: Error Handling
- [ ] Create showErrorToast(message) function for non-blocking error notifications
- [ ] Create showAuthError(message) function for authentication modal errors
- [ ] Add specific error messages for network errors
- [ ] Add specific error messages for invalid email
- [ ] Add specific error messages for invalid OTP
- [ ] Add specific error messages for expired OTP
- [ ] Add specific error messages for rate limiting
- [ ] Implement exponential backoff retry for transient storage failures
- [ ] Handle Supabase service unavailable scenarios
- [ ] Add error recovery options (retry buttons, alternative flows)
- [ ] Ensure errors don't break game functionality
- [ ] Add error logging for debugging
- [ ] Style error toasts to match application design
- [ ] Auto-dismiss error toasts after 5 seconds

## Phase 5: Integration & Polish

### Step 14: Header Controls
- [ ] Add logout link HTML to header area (top-right position)
- [ ] Style logout link to match application design
- [ ] Show logout link only when user is authenticated
- [ ] Hide logout link when user is not authenticated
- [ ] Add click event listener for logout link
- [ ] Call handleSignOut() function on logout click
- [ ] Add confirmation dialog for logout (optional but recommended)
- [ ] Update header layout to accommodate logout link
- [ ] Ensure logout link is accessible and responsive
- [ ] Add proper spacing and positioning for header controls

### Step 15: Authentication Flow Integration
- [ ] Show authentication modal immediately on page load if not authenticated
- [ ] Hide welcome screen until authentication decision is made
- [ ] Show welcome screen after successful authentication or skip
- [ ] Add subtle indicator when playing without authentication
- [ ] Ensure lesson loading works regardless of authentication status
- [ ] Handle authentication modal close/escape key
- [ ] Add loading states during authentication checks
- [ ] Ensure proper focus management in authentication flow
- [ ] Handle browser back/forward navigation gracefully
- [ ] Test authentication flow with existing game functionality

### Step 16: Final Testing & Cleanup
- [ ] Test complete authentication flow: email → OTP → login → game → logout
- [ ] Test skip authentication flow: skip → game (no data storage)
- [ ] Test error scenarios: invalid email, invalid OTP, network errors
- [ ] Verify spelling attempts save to Supabase when authenticated
- [ ] Verify no localStorage writes when unauthenticated
- [ ] Test session persistence across browser refresh
- [ ] Test responsive design on mobile devices
- [ ] Clean up excessive console.log statements (keep important ones)
- [ ] Verify all buttons and inputs work properly
- [ ] Test keyboard navigation and accessibility
- [ ] Ensure all existing game functionality still works
- [ ] Add final documentation comments for key functions

## Supabase Backend Setup

### Database Setup
- [ ] Create Supabase project
- [ ] Configure email authentication in Supabase dashboard
- [ ] Create `spelling_attempts` table with proper schema
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create indexes for performance optimization
- [ ] Test database operations in Supabase dashboard

### Authentication Setup
- [ ] Configure email OTP settings in Supabase Auth
- [ ] Set up email templates (optional)
- [ ] Configure authentication providers
- [ ] Test authentication flow in Supabase dashboard
- [ ] Verify email delivery works

### Security Setup
- [ ] Review and configure RLS policies
- [ ] Set up proper user permissions
- [ ] Configure API keys and security settings
- [ ] Review authentication settings
- [ ] Test security policies

## Production Deployment

### Pre-Deployment
- [ ] Add actual Supabase credentials to application
- [ ] Update CSP headers for production
- [ ] Test authentication flow in staging environment
- [ ] Verify data storage functionality works
- [ ] Test error handling scenarios
- [ ] Verify responsive design on multiple devices

### Deployment
- [ ] Deploy to GitHub Pages
- [ ] Test production authentication
- [ ] Verify HTTPS requirements are met
- [ ] Monitor error logs
- [ ] Test cross-browser compatibility
- [ ] Verify all functionality works in production

### Post-Deployment
- [ ] Monitor Supabase dashboard for errors
- [ ] Check authentication success rates
- [ ] Monitor data storage operations
- [ ] Collect user feedback
- [ ] Monitor performance metrics

## Testing Checklist

### Authentication Testing
- [ ] Valid email input and OTP receipt
- [ ] Invalid email format handling
- [ ] Valid OTP verification
- [ ] Invalid OTP handling
- [ ] OTP expiration testing (wait 10+ minutes)
- [ ] Resend OTP functionality
- [ ] Session persistence across browser sessions
- [ ] Logout functionality
- [ ] Skip authentication flow

### Data Storage Testing
- [ ] Spelling attempts save to Supabase when authenticated
- [ ] Both correct and incorrect attempts are saved
- [ ] Lesson names are stored correctly
- [ ] Different lesson types work properly
- [ ] No localStorage writes when unauthenticated
- [ ] Storage failure handling

### UI/UX Testing
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Mobile browsers (iOS Safari, Android Chrome)
- [ ] Desktop responsive design (1920x1080)
- [ ] Tablet responsive design (768x1024)
- [ ] Mobile responsive design (375x667)
- [ ] Keyboard navigation through auth flow
- [ ] Screen reader compatibility
- [ ] Color contrast compliance

### Error Handling Testing
- [ ] Network disconnection during authentication
- [ ] Invalid Supabase credentials
- [ ] Database connection failures
- [ ] Supabase service downtime scenarios
- [ ] Browser refresh during auth flow
- [ ] Network interruption during auth

### Performance Testing
- [ ] Slow network connections
- [ ] OTP delivery timing
- [ ] Concurrent user sessions
- [ ] Large number of spelling attempts
- [ ] Memory usage monitoring

## Documentation

### Code Documentation
- [ ] Add JSDoc comments to all new functions
- [ ] Document authentication flow
- [ ] Document data storage functions
- [ ] Document error handling procedures
- [ ] Update existing function documentation

### User Documentation
- [ ] Update README with authentication information
- [ ] Document new features for users
- [ ] Create troubleshooting guide
- [ ] Document privacy and data handling

### Developer Documentation
- [ ] Document Supabase setup process
- [ ] Create deployment guide
- [ ] Document configuration options
- [ ] Create maintenance procedures

---

**Total Items**: 150+
**Estimated Time**: 2-3 weeks for full implementation
**Priority**: Complete phases in order for best results
**Testing**: Test each step before moving to the next

**Notes**:
- Each checkbox represents a specific, testable deliverable
- Items should be completed in the order presented
- Some items may be completed in parallel within the same phase
- All existing functionality must continue to work throughout the process
- Regular testing and validation is essential for success
