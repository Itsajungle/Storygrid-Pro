# External Apps - Back Button Implementation

## ✅ **Completed:**

### **Story Grid Pro** (`/app` route)
- ✅ Added "Back to Content Hub" button to `StageNavigation.tsx`
- Location: Top-right of navigation bar
- Styled consistently with other nav buttons
- Orange theme to match other back buttons

---

## ⚠️ **External Apps (Hosted on Railway):**

The following apps are hosted externally on Railway and are **not part of this codebase**:

### **1. AI Agent Training**
- URL: `https://web-production-29982.up.railway.app/api/agent-training`
- **Codebase Location:** Unknown/Separate repository
- **Action Needed:** Add back button in the external codebase
- **How:** Add a link/button with: `<a href="https://storygrid-pro.netlify.app/">← Back to Content Hub</a>`

### **2. Social Studio**
- URL: `https://web-production-29982.up.railway.app/api/social-studio/dashboard`
- **Codebase Location:** Unknown/Separate repository  
- **Action Needed:** Add back button in the external codebase
- **How:** Add a link/button with: `<a href="https://storygrid-pro.netlify.app/">← Back to Content Hub</a>`

---

## 📝 **Recommendations:**

### **Option 1: Modify External Apps (Best)**
1. Access the Railway-hosted codebase
2. Add a back button in the header/navigation
3. Link to: `https://storygrid-pro.netlify.app/`
4. Match styling with Story Grid Pro

### **Option 2: Query Parameters (Workaround)**
Add a query parameter when navigating from Content Hub:
```typescript
link: 'https://web-production-29982.up.railway.app/api/agent-training?returnUrl=https://storygrid-pro.netlify.app/'
```

Then in the external app, check for `returnUrl` and show back button if present.

### **Option 3: Browser Back Button**
Users can always use browser back, but this is not ideal UX.

---

## 🔍 **To Find the External Codebase:**

1. Check Railway dashboard for deployment source
2. Look for GitHub repository linked to Railway service
3. Search for: `IAJ Social Media` or `AI Agent Training` repositories
4. May be in separate repo: `github.com/Itsajungle/...`

---

## ✨ **Styling Guide (For External Apps):**

To match the Story Grid Pro back button:

```html
<button 
  onclick="window.location.href='https://storygrid-pro.netlify.app/'"
  style="
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(234, 88, 12, 0.1);
    color: #EA580C;
    border: 1px solid rgba(234, 88, 12, 0.2);
    padding: 10px 16px;
    border-radius: 9999px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  "
  onmouseover="this.style.transform='scale(1.02)'"
  onmouseout="this.style.transform='scale(1)'"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
  Back to Content Hub
</button>
```

---

**Status:**
- ✅ Story Grid Pro - Complete
- ⚠️ AI Agent Training - Requires external codebase access
- ⚠️ Social Studio - Requires external codebase access
