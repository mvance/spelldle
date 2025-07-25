# Supabase Configuration Guide for Spelldle

This guide walks you through setting up Supabase authentication and data storage for the Spelldle application.

## Overview

Spelldle uses Supabase for:
- **Authentication**: Email-based login with OTP (One-Time Password) verification
- **Data Storage**: Saving spelling attempts and progress tracking
- **User Management**: Secure user sessions and data isolation

## Step 1: Create Supabase Account & Organization

### Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email

### Create Organization (if needed)
1. After signing up, you'll be prompted to create an organization
2. Choose a name for your organization (e.g., "Spelldle" or your name)
3. Select the free tier for development

## Step 2: Create New Project

### Project Setup
1. Click "New Project" in your Supabase dashboard
2. Choose your organization
3. Enter project details:
   - **Name**: `spelldle` (or your preferred name)
   - **Database Password**: Generate a strong password and **save it securely**
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait 1-2 minutes for project setup to complete

## Step 3: Get Your Project Credentials

### Locate API Settings
1. Once your project is ready, click the **gear icon (⚙️)** in the left sidebar
2. Select **"API"** from the settings menu

### Copy Your Credentials
You'll need these two values:

1. **Project URL**: 
   - Copy the URL (format: `https://your-project-id.supabase.co`)
   - Example: `https://kgnqutpeerhmlddhjoza.supabase.co`

2. **Anon Key**: 
   - Copy the `anon` `public` key (long string starting with `eyJ...`)
   - This key is safe to use in client-side code

### Update Spelldle Configuration
Replace the placeholder values in your `index.html` file:

```javascript
// Replace these lines:
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// With your actual values:
const SUPABASE_URL = 'https://your-actual-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
```

## Step 4: Set Up Database Table

### Create the Spelling Attempts Table

#### Option A: Using Table Editor (Visual)
1. Click **"Table Editor"** in the left sidebar
2. Click **"Create a new table"**
3. Configure the table:
   - **Name**: `spelling_attempts`
   - **Description**: "Stores user spelling attempts and results"

4. Add these columns:
   | Column Name | Type | Default | Constraints |
   |-------------|------|---------|-------------|
   | `id` | `int8` | auto-increment | Primary Key |
   | `created_at` | `timestamptz` | `now()` | Not Null |
   | `user_id` | `uuid` | - | Foreign Key to `auth.users(id)` |
   | `lesson_name` | `text` | - | Not Null |
   | `word_target` | `text` | - | Not Null |
   | `spelling_guess` | `text` | - | Not Null |
   | `result` | `text` | - | Check: `result IN ('correct', 'incorrect')` |

#### Option B: Using SQL Editor (Recommended)
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Run this SQL:

```sql
CREATE TABLE spelling_attempts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_name TEXT NOT NULL,
  word_target TEXT NOT NULL,
  spelling_guess TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect'))
);
```

## Step 5: Configure Row Level Security (RLS)

### Why RLS is Important
Row Level Security ensures users can only access their own data, making your anon key safe to use in client-side code.

### Enable RLS
Run this SQL in the SQL Editor:

```sql
ALTER TABLE spelling_attempts ENABLE ROW LEVEL SECURITY;
```

### Create Security Policies
Run these SQL commands to create policies:

```sql
-- Users can insert their own attempts
CREATE POLICY "Users can insert own spelling attempts" 
ON spelling_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own attempts
CREATE POLICY "Users can view own spelling attempts" 
ON spelling_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own attempts (optional)
CREATE POLICY "Users can update own spelling attempts" 
ON spelling_attempts 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own attempts (optional)
CREATE POLICY "Users can delete own spelling attempts" 
ON spelling_attempts 
FOR DELETE 
USING (auth.uid() = user_id);
```

### Verify Policies
1. Go to **"Authentication"** → **"Policies"** in the sidebar
2. You should see your policies listed for the `spelling_attempts` table

## Step 6: Configure Authentication Settings

### Email Configuration
1. Go to **"Authentication"** → **"Settings"** in the sidebar
2. Configure these settings:

#### Site URL
- Add your domain: `https://yourdomain.com`
- For local development: `http://localhost:3000` or `file://` (for direct HTML files)

#### Redirect URLs
- Add your domain to the allowed redirect URLs list
- Include both production and development URLs

### Email Templates (Optional)
1. Go to **"Authentication"** → **"Email Templates"**
2. Customize the magic link email template if desired
3. The default template works fine for testing

## Step 7: Test Your Setup

### Verify Configuration
1. Open your Spelldle application
2. Check the browser console for: `"Supabase client initialized successfully"`
3. You should no longer see placeholder credential warnings

### Test Authentication Flow
1. Try the email authentication in your app
2. Check that OTP emails are received
3. Verify successful login completes
4. Test that spelling attempts are saved to the database

### Check Data Storage
1. Play the game while authenticated
2. Go to **"Table Editor"** → **"spelling_attempts"** in Supabase
3. Verify that your spelling attempts appear in the table

## Step 8: Production Considerations

### Security Best Practices
- **Anon Key**: Safe to expose in client-side code (designed for this)
- **Service Role Key**: Never expose this in client-side code
- **Database Password**: Only needed for direct database connections
- **Always enable RLS** for tables containing user data

### Performance Optimization
- Consider adding database indexes for frequently queried columns
- Monitor usage in the Supabase dashboard
- Set up database backups for production

### Email Delivery
- **Development**: Supabase provides basic email service
- **Production**: Configure custom SMTP provider for better deliverability
- Go to **"Authentication"** → **"Settings"** → **"SMTP Settings"**

### Custom Domain (Optional)
1. Configure a custom domain in Supabase settings
2. Update `SUPABASE_URL` to use your custom domain
3. Update CORS and redirect URL settings accordingly

## Troubleshooting

### Common Issues

#### "Invalid URL" Error
- Ensure your `SUPABASE_URL` includes `https://` and ends with `.supabase.co`
- Check for typos in the project ID

#### Authentication Not Working
- Verify your anon key is correct
- Check that RLS policies are properly configured
- Ensure redirect URLs include your domain

#### Data Not Saving
- Verify the user is authenticated (`authState.isAuthenticated`)
- Check that the `spelling_attempts` table exists
- Ensure RLS policies allow INSERT operations

#### Email Not Received
- Check spam/junk folders
- Verify email address is correct
- Try a different email provider (Gmail, etc.)

### Getting Help
- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review browser console for error messages

## Environment Variables (Advanced)

For production deployments, consider using environment variables:

```javascript
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'your-fallback-url';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-fallback-key';
```

**Never commit real credentials to version control.**

---

## Summary

After completing this setup:
- ✅ Users can sign in with email + OTP verification
- ✅ Spelling attempts are securely stored per user
- ✅ Data is isolated between users via RLS
- ✅ The application works offline for unauthenticated users
- ✅ All data is backed up and accessible across devices

Your Spelldle application now has enterprise-grade authentication and data storage powered by Supabase!
