# API Key Troubleshooting Guide

## Issue: API Keys Not Showing in Ideas Lab

### What I Fixed

1. **Enhanced `useIdeateApiKeys` Hook**:
   - Now actively loads keys from Supabase on mount
   - Syncs Supabase keys to localStorage automatically
   - Added better error handling and fallback to localStorage
   - Added `isLoading` state and `refreshKeys` function

2. **Added "Refresh Keys" Button**:
   - Manual button in Ideas Lab to refresh API key detection
   - Automatically refreshes when API Key dialog closes
   - Shows loading state while checking keys

3. **Better User Feedback**:
   - Warning message when no API keys are detected
   - Loading state indicator
   - Console logs for debugging

### How to Test

1. **Open the App**: Navigate to Ideas Lab
2. **Check Console**: Open browser DevTools (F12) and look for:
   - `🔧 useIdeateApiKeys - Starting API Key Check`
   - `✅ Loaded keys from Supabase:` or `⚠️ Supabase query error`
   - Key validation results

3. **Try These Steps**:
   - Click "Refresh Keys" button
   - Click "Configure API Keys" and save a key
   - Check if AI assistants show "Ready" or "No API Key"

### Possible Root Causes

#### 1. **Supabase Table Doesn't Exist**
The `api_keys` table might not be created in your Supabase project.

**Solution**: Create the table manually:
```sql
CREATE TABLE IF NOT EXISTS api_keys (
  provider TEXT PRIMARY KEY,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own keys
CREATE POLICY "Users can manage API keys" ON api_keys
  FOR ALL USING (true);
```

#### 2. **Row Level Security (RLS) Blocking Access**
If the table exists but RLS is too restrictive, queries will fail silently.

**Check in Supabase Dashboard**:
- Go to Database → Tables → api_keys
- Check "Policies" tab
- Ensure there's a policy allowing SELECT/INSERT/UPDATE

#### 3. **User Not Logged In**
If RLS requires authentication, user must be logged in.

**Solution**: Make sure you're logged in with `itsajungletv@gmail.com`

#### 4. **Keys Only in localStorage**
If keys were saved before Supabase integration, they might only exist in localStorage.

**Current Fix**: The updated code now handles this - it will use localStorage keys even if Supabase fails.

### Quick Fix: Manual localStorage Setup

If you want to bypass Supabase entirely for now:

1. Open browser DevTools Console (F12)
2. Run these commands (replace with your actual keys):

```javascript
localStorage.setItem('VITE_OPENAI_API_KEY', 'sk-your-key-here');
localStorage.setItem('VITE_ANTHROPIC_API_KEY', 'sk-ant-your-key-here');
localStorage.setItem('VITE_GEMINI_API_KEY', 'your-key-here');
localStorage.setItem('VITE_PERPLEXITY_API_KEY', 'pplx-your-key-here');

// Trigger refresh
window.dispatchEvent(new CustomEvent('apiKeyUpdated'));
```

3. Refresh the page or click "Refresh Keys"

### Check Current Keys

Run this in console to see what keys are currently stored:

```javascript
console.log({
  openai: localStorage.getItem('VITE_OPENAI_API_KEY')?.substring(0, 15) + '...',
  claude: localStorage.getItem('VITE_ANTHROPIC_API_KEY')?.substring(0, 15) + '...',
  gemini: localStorage.getItem('VITE_GEMINI_API_KEY')?.substring(0, 15) + '...',
  perplexity: localStorage.getItem('VITE_PERPLEXITY_API_KEY')?.substring(0, 15) + '...'
});
```

### What Changed in the Code

**Before**: Keys only checked localStorage on mount, might miss Supabase-stored keys

**After**: 
- Actively loads from Supabase first
- Syncs to localStorage as backup
- Provides refresh functionality
- Better error handling and user feedback

### Need More Help?

Check the browser console for these specific error messages:
- `❌ Error loading keys from Supabase:` - Database issue
- `⚠️ Supabase query error, falling back to localStorage:` - RLS or table issue
- `❌ Error checking API keys:` - General error

The app will now work with localStorage even if Supabase fails, so your keys should persist across sessions.

