# AI Summary Debugging Guide

## ⚠️ Error: "Unable to generate AI summary. Please check your API keys in Settings."

### **Quick Fix Steps:**

#### **Step 1: Check if API Keys are Set**

Open browser console (F12 or Right-click → Inspect → Console) and run:

```javascript
console.log('OpenAI:', localStorage.getItem('VITE_OPENAI_API_KEY'));
console.log('Claude:', localStorage.getItem('VITE_ANTHROPIC_API_KEY'));
```

**Expected output:**
- Should show `sk-...` for OpenAI
- Should show `sk-ant-...` for Claude
- If both show `null`, keys aren't saved

---

#### **Step 2: Go to Settings and Add Keys**

1. Navigate to **Settings → API Keys** in Story Grid Pro
2. Add your API keys:
   - **OpenAI API Key**: Get from https://platform.openai.com/api-keys
   - **Claude API Key**: Get from https://console.anthropic.com/
3. Click **Save**
4. **Refresh the page** (important!)

---

#### **Step 3: Try Again**

1. Go back to Trending page
2. Click any topic
3. Click "Generate Summary"
4. Check browser console for debug logs:
   - `🔑 Checking API keys...`
   - `✅ Using Claude API...` or `✅ Using OpenAI API...`

---

### **Common Issues:**

#### **Issue 1: Keys Not Saving to localStorage**

**Symptom:** Console shows `null` for both keys

**Fix:**
1. Check if you're logged in to Story Grid Pro
2. Try saving keys in Settings again
3. Hard refresh page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check browser console for Supabase errors

**Workaround (temporary):**
Run this in browser console to manually set keys:

```javascript
localStorage.setItem('VITE_OPENAI_API_KEY', 'sk-your-actual-key-here');
// or
localStorage.setItem('VITE_ANTHROPIC_API_KEY', 'sk-ant-your-actual-key-here');
```

Then refresh and try again.

---

#### **Issue 2: API Key Invalid**

**Symptom:** Keys are in localStorage but API call fails

**Fix:**
1. Verify key is correct (no extra spaces)
2. Check key hasn't expired in OpenAI/Anthropic dashboard
3. For OpenAI: Key should start with `sk-proj-` or `sk-`
4. For Claude: Key should start with `sk-ant-`

---

#### **Issue 3: CORS or Network Error**

**Symptom:** Console shows CORS error or network error

**Fix:**
This is expected! The API calls go directly from browser to OpenAI/Anthropic.

If you see CORS errors, we need to add a backend proxy. Let me know and I'll implement it.

---

### **Debug Console Output**

When you click "Generate Summary", you should see:

```
🔑 Checking API keys...
OpenAI key found: Yes (sk-proj...)
Claude key found: No
✅ Using OpenAI API for trend summary
```

Or if Claude is available:

```
🔑 Checking API keys...
OpenAI key found: No
Claude key found: Yes (sk-ant-api...)
✅ Using Claude API for trend summary
```

---

### **Still Not Working?**

1. Open browser console (F12)
2. Go to Trending page
3. Click topic → "Generate Summary"
4. Screenshot the console output
5. Share with me so I can debug further

The console will now show:
- Which keys were found
- Which API is being used
- Any error messages from the API
