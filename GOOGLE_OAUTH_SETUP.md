# Google OAuth Setup Guide

## Problem
You're getting "Can't continue with google.com. Something went wrong" error when trying to sign in with Google.

## Root Cause
The application needs a proper Google OAuth Client ID configured for localhost development.

## Solution Steps

### 1. Go to Google Cloud Console
- Visit: https://console.developers.google.com/
- Sign in with your Google account

### 2. Create or Select a Project
- Click "Select a project" at the top
- Either create a new project or select an existing one
- Note: Project name can be anything (e.g., "Dr Mimu Medical App")

### 3. Enable Required APIs
- Go to "APIs & Services" > "Library"
- Search for and enable:
  - **Google Identity Services API**
  - **Google+ API** (if available)

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "+ CREATE CREDENTIALS" > "OAuth client ID"
- Choose "Web application" as application type
- Give it a name (e.g., "Dr Mimu Web Client")

### 5. Configure Authorized Origins and Redirect URIs
Add these URLs to your OAuth client:

**Authorized JavaScript origins:**
- `http://localhost:5173`
- `http://127.0.0.1:5173`

**Authorized redirect URIs:**
- `http://localhost:5173`
- `http://127.0.0.1:5173`

### 6. Copy Your Client ID
- After creating, you'll see your Client ID (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- Copy this Client ID

### 7. Update Your .env File
- Open the `.env` file in your project root
- Replace the `VITE_GOOGLE_CLIENT_ID` value with your actual Client ID:
```
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### 8. Restart Development Server
- Stop the current server (Ctrl+C)
- Run `npm run dev` again
- The Google sign-in should now work

## Alternative Quick Fix (Temporary)
If you want to test immediately, you can:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run: `localStorage.setItem('google_client_id', 'your-client-id-here')`
4. Refresh the page

## Verification
- Open browser developer tools (F12)
- Go to Console tab
- Look for "Initializing Google Sign-In with Client ID:" message
- The Client ID should not be "YOUR_GOOGLE_CLIENT_ID"

## Common Issues
1. **"This app isn't verified"** - Normal for development, click "Advanced" > "Go to [app] (unsafe)"
2. **"redirect_uri_mismatch"** - Make sure localhost:5173 is in authorized redirect URIs
3. **"origin_mismatch"** - Make sure localhost:5173 is in authorized origins

## Need Help?
If you're still having issues:
1. Check the browser console for error messages
2. Verify your Client ID is correctly set in .env
3. Make sure the development server restarted after changing .env
4. Ensure localhost:5173 is added to Google OAuth settings