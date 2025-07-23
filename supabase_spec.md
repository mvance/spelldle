# Spelldle Supabase Integration Specification

## Overview

This specification outlines the integration of Supabase authentication and persistent storage into the existing Spelldle spelling game application. The implementation will add email-based OTP authentication and cloud storage of user spelling attempts while maintaining backward compatibility for unauthenticated users.

## Project Context

**Current State:**
- Single-page HTML application with embedded JavaScript
- Local storage for spelling attempts using `spelldle_attempts` key
- Lesson data loaded from GitHub Gist CSV
- No user authentication or persistent storage

**Target State:**
- Supabase email OTP authentication
- Cloud storage of spelling attempts for authenticated users
- Graceful degradation for unauthenticated users (no data storage)
- Persistent login sessions across browser visits

## Authentication Requirements

### 1. Authentication Flow

#### Initial Visit
- **Trigger**: User visits site for the first time or after logout
- **UI**: Modal overlay on welcome screen
- **Behavior**: Authentication required before accessing game features

#### Email Input Phase
- **UI Components**:
  - Email input field (type="email", required)
  - Submit button
  - Explanatory text about benefits of signing in
  - Close/skip option (leads to unauthenticated play)
- **Validation**: Email format validation before submission
- **Loading State**: Show spinner/loading indicator during email submission

#### OTP Verification Phase
- **Trigger**: After successful email submission
- **UI Components**:
  - Message: "Check your email for a verification code"
  - 6-digit OTP input field
  - Submit button
  - Resend OTP option (with cooldown timer)
  - Back to email input option
- **Behavior**: Auto-focus OTP input, accept numeric input only

#### Success State
- **Trigger**: Valid OTP entered
- **Behavior**: 
  - Hide authentication modal
  - Show welcome screen with lesson selector
  - Display logout link in header
  - Enable data persistence

### 2. Session Management

#### Persistent Login
- **Requirement**: Users remain logged in across browser sessions
- **Implementation**: Use Supabase session management with localStorage
- **Duration**: No automatic expiration

#### Logout Functionality
- **UI**: Small "Logout" link in header area (top-right recommended)
- **Behavior**: 
  - Clear Supabase session
  - Redirect to authentication screen
  - Clear any cached user data
  - Disable data persistence

### 3. Unauthenticated Experience

#### Fallback Behavior
- **Data Storage**: Completely disabled (no localStorage usage)
- **Game Access**: Full game functionality available
- **UI Indicators**: Optional subtle indication that data is not being saved

## Data Architecture

### 1. Database Schema

#### Table: `spelling_attempts`
```sql
CREATE TABLE spelling_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    lesson_name TEXT NOT NULL,
    word_target TEXT NOT NULL,
    spelling_guess TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_spelling_attempts_user_id ON spelling_attempts(user_id);
CREATE INDEX idx_spelling_attempts_timestamp ON spelling_attempts(timestamp);
CREATE INDEX idx_spelling_attempts_lesson ON spelling_attempts(lesson_name);
```

#### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE spelling_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own attempts" ON spelling_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON spelling_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON spelling_attempts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attempts" ON spelling_attempts
    FOR DELETE USING (auth.uid() = user_id);
```

### 2. Data Migration Strategy

#### No Migration Required
- **Rationale**: Start fresh for authenticated users
- **Existing Data**: Leave localStorage data untouched for reference
- **Implementation**: Disable localStorage writes after authentication

### 3. Data Synchronization

#### Write Strategy
- **Timing**: Save attempts immediately after each guess
- **Method**: Direct Supabase insert operations
- **Fallback**: If write fails, show error but continue game

#### Read Strategy
- **Usage**: For future analytics/progress tracking features
- **Implementation**: Query user's attempts by lesson/date ranges

## Technical Implementation

### 1. Dependencies

#### Supabase Client
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

#### Environment Configuration
```javascript
const SUPABASE_URL = 'your-project-url'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

### 2. Authentication Integration

#### Supabase Client Setup
```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

#### Email OTP Flow
```javascript
// Send OTP
const { error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    shouldCreateUser: true
  }
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  email: userEmail,
  token: otpCode,
  type: 'email'
})
```

#### Session Management
```javascript
// Check existing session on page load
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle successful login
  } else if (event === 'SIGNED_OUT') {
    // Handle logout
  }
})
```

### 3. Data Persistence Integration

#### Save Spelling Attempt
```javascript
async function saveSpellingAttempt(guess, isCorrect) {
  if (!isAuthenticated()) return;
  
  const { error } = await supabase
    .from('spelling_attempts')
    .insert({
      lesson_name: gameState.currentLesson || 'Fallback Word List',
      word_target: gameState.currentWord,
      spelling_guess: guess,
      result: isCorrect ? 'correct' : 'incorrect'
    })
    
  if (error) {
    console.error('Failed to save attempt:', error)
    // Show user-friendly error message
  }
}
```

### 4. UI Components

#### Authentication Modal HTML
```html
<div class="auth-modal-overlay" id="authModal" style="display: none;">
  <div class="auth-modal-content">
    <div class="auth-email-phase" id="authEmailPhase">
      <h2>Sign in to Spelldle</h2>
      <p>Save your progress and track your spelling improvement over time.</p>
      <input type="email" id="authEmail" placeholder="Enter your email" required>
      <button id="authEmailSubmit">Send Verification Code</button>
      <button id="authSkip" class="auth-skip">Continue Without Saving</button>
    </div>
    
    <div class="auth-otp-phase" id="authOtpPhase" style="display: none;">
      <h2>Check Your Email</h2>
      <p>Enter the 6-digit code sent to <span id="authEmailDisplay"></span></p>
      <input type="text" id="authOtp" placeholder="000000" maxlength="6" pattern="[0-9]{6}">
      <button id="authOtpSubmit">Verify Code</button>
      <button id="authResendOtp">Resend Code</button>
      <button id="authBackToEmail">Change Email</button>
    </div>
    
    <div class="auth-error" id="authError" style="display: none;"></div>
  </div>
</div>
```

#### Logout Link
```html
<div class="header-controls" style="position: absolute; top: 20px; right: 20px;">
  <a href="#" id="logoutLink" class="logout-link" style="display: none;">Logout</a>
</div>
```

### 5. CSS Styling

#### Authentication Modal Styles
```css
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.auth-modal-content {
  background-color: var(--dark-bg);
  color: var(--dark-text);
  border: 2px solid var(--dark-border);
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.auth-modal-content h2 {
  color: var(--blue);
  margin-bottom: 15px;
}

.auth-modal-content input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 2px solid var(--dark-border);
  border-radius: 6px;
  background-color: var(--dark-bg);
  color: var(--dark-text);
  font-size: 16px;
}

.auth-modal-content button {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-modal-content button:not(.auth-skip) {
  background-color: var(--blue);
  color: white;
}

.auth-skip {
  background-color: transparent;
  color: var(--gray);
  border: 1px solid var(--gray);
}

.logout-link {
  color: var(--blue);
  text-decoration: none;
  font-size: 14px;
}

.logout-link:hover {
  text-decoration: underline;
}

.auth-error {
  background-color: #d73a49;
  color: white;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
}
```

## Error Handling

### 1. Authentication Errors

#### Email Submission Errors
- **Network Error**: "Unable to connect. Please check your internet connection and try again."
- **Invalid Email**: "Please enter a valid email address."
- **Rate Limiting**: "Too many requests. Please wait before trying again."
- **Service Unavailable**: "Authentication service is temporarily unavailable. Please try again later."

#### OTP Verification Errors
- **Invalid Code**: "Invalid verification code. Please check your email and try again."
- **Expired Code**: "Verification code has expired. Please request a new one."
- **Too Many Attempts**: "Too many failed attempts. Please request a new verification code."

### 2. Data Storage Errors

#### Write Failures
- **Network Error**: Log error, show toast notification, continue game
- **Permission Error**: Log error, attempt re-authentication
- **Service Unavailable**: Log error, show notification, continue game

#### Error Recovery
- **Retry Logic**: Implement exponential backoff for transient failures
- **User Notification**: Non-blocking toast messages for storage failures
- **Graceful Degradation**: Game continues even if storage fails

### 3. Error UI Components

#### Toast Notifications
```javascript
function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
```

## Security Considerations

### 1. Content Security Policy Updates

#### Required CSP Changes
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.skypack.dev https://esm.sh https://unpkg.com; 
  style-src 'self' 'unsafe-inline'; 
  connect-src 'self' https://gist.githubusercontent.com https://*.supabase.co;
">
```

### 2. Data Protection

#### User Data Handling
- **Minimal Data**: Only store necessary spelling attempt data
- **Encryption**: Rely on Supabase's built-in encryption
- **Access Control**: Strict RLS policies prevent cross-user data access

#### Privacy Considerations
- **Email Storage**: Handled by Supabase Auth, not stored in custom tables
- **Data Retention**: No automatic deletion policy (user-controlled)
- **Analytics**: No tracking beyond spelling attempts

## Testing Plan

### 1. Authentication Testing

#### Manual Test Cases
1. **Email OTP Flow**
   - [ ] Enter valid email, receive OTP
   - [ ] Enter invalid email, see error message
   - [ ] Enter valid OTP, successfully authenticate
   - [ ] Enter invalid OTP, see error message
   - [ ] Test OTP expiration (wait 10+ minutes)
   - [ ] Test resend OTP functionality

2. **Session Management**
   - [ ] Login, close browser, reopen - should remain logged in
   - [ ] Logout, verify session cleared
   - [ ] Test logout redirect to auth screen

3. **Unauthenticated Flow**
   - [ ] Skip authentication, verify game works
   - [ ] Verify no localStorage writes occur
   - [ ] Verify no Supabase calls made

### 2. Data Persistence Testing

#### Functional Tests
1. **Data Storage**
   - [ ] Make spelling attempts, verify saved to Supabase
   - [ ] Test both correct and incorrect attempts
   - [ ] Verify lesson names stored correctly
   - [ ] Test with different lesson types

2. **Error Handling**
   - [ ] Disconnect internet, make attempt, verify graceful handling
   - [ ] Test with invalid Supabase credentials
   - [ ] Test database connection failures

### 3. UI/UX Testing

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Android Chrome)

#### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Accessibility Testing
- [ ] Keyboard navigation through auth flow
- [ ] Screen reader compatibility
- [ ] Color contrast compliance

### 4. Performance Testing

#### Load Testing
- [ ] Test with slow network connections
- [ ] Test OTP delivery timing
- [ ] Test concurrent user sessions

#### Error Recovery Testing
- [ ] Test network interruption during auth
- [ ] Test Supabase service downtime scenarios
- [ ] Test browser refresh during auth flow

## Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Configure email authentication
- [ ] Create `spelling_attempts` table
- [ ] Set up RLS policies
- [ ] Configure email templates (optional)
- [ ] Test authentication in Supabase dashboard

### 2. Application Configuration
- [ ] Add Supabase credentials to application
- [ ] Update CSP headers
- [ ] Test authentication flow
- [ ] Verify data storage functionality
- [ ] Test error handling scenarios

### 3. Production Deployment
- [ ] Deploy to GitHub Pages
- [ ] Test production authentication
- [ ] Verify HTTPS requirements met
- [ ] Monitor error logs
- [ ] Test cross-browser compatibility

## Future Enhancements

### 1. Analytics Dashboard
- User progress tracking
- Lesson completion rates
- Common spelling mistakes analysis

### 2. Social Features
- Leaderboards
- Progress sharing
- Teacher/student accounts

### 3. Advanced Authentication
- Social login options (Google, Apple)
- Multi-factor authentication
- Account recovery options

## Support and Maintenance

### 1. Monitoring
- Supabase dashboard for database health
- Browser console for client-side errors
- User feedback collection

### 2. Backup Strategy
- Supabase automatic backups
- Export functionality for user data
- Regular database health checks

### 3. Updates and Patches
- Monitor Supabase client library updates
- Security patch deployment process
- Feature rollback procedures

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-23  
**Next Review**: 2025-02-23
