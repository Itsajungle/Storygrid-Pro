# AI Trend Summary Feature - Setup Guide

## ✨ **What This Does**

The "Generate AI Summary" button in the Trending page:
- Gathers data from ALL sources for a topic
- Sends it to Claude Sonnet 4 (primary) or OpenAI GPT-4 (fallback)
- Returns a 3-4 sentence actionable summary covering:
  1. What's driving this trend (with specific source)
  2. Why it matters now
  3. One specific content opportunity for Susan

## 🔑 **Setup - BACKEND PROXY ✅**

The system now uses **backend proxy** to avoid CORS issues:
- Frontend calls Management Hub at `/api/ai/summarize-trend`
- Backend tries **Claude Sonnet 4** first (cheaper, better for analysis)
- Falls back to **OpenAI GPT-4o-mini** if Claude unavailable
- API keys are stored securely in Railway environment variables

**No frontend API keys needed!** All AI calls go through the Management Hub backend.

### **How It Works:**

1. User clicks "Generate Summary" on any trending topic
2. Frontend gathers: topic, sources, percentages, audience data, related terms
3. Sends context to Management Hub: `POST /api/ai/summarize-trend`
4. Backend checks for `ANTHROPIC_API_KEY` in environment
5. Calls Claude Sonnet 4 API with formatted prompt
6. If Claude fails, tries OpenAI using `OPENAI_API_KEY`
7. Returns 3-4 sentence summary tailored for Susan

## 💰 **Cost Estimate**

**Claude Sonnet 4 (Primary):**
- ~$0.003 per 1K input tokens
- ~$0.015 per 1K output tokens
- **Cost per summary: ~$0.005** ✅ Very affordable!

**GPT-4o-mini (Fallback):**
- ~$0.015 per 1K input tokens
- ~$0.06 per 1K output tokens
- **Cost per summary: ~$0.01** (still very cheap)

## 🎯 **Example Output**

**Topic:** "Gut Health Supplements"

**AI Summary:**
> This trend is surging (+183%) driven primarily by TikTok (65% of mentions), where wellness creators are sharing personal gut health transformation stories. The timing aligns with growing scientific research on the gut-brain connection and increased awareness of microbiome health. **Content Opportunity:** Create a video series debunking common gut health myths, featuring before/after microbiome test results, and interview gastroenterologists about evidence-based supplement recommendations.

## 🧠 **AI Model Priority**

The system automatically tries:
1. **Claude Sonnet 4** (primary) - Best for analysis, 5x cheaper
2. **GPT-4o-mini** (fallback) - If Claude unavailable

Both models are tuned specifically for Susan's health/wellness content.

## 🚀 **Deployment Required**

### **Step 1: Deploy Backend**
The Management Hub needs to be redeployed with the new AI endpoint:

1. Commit and push changes (done automatically)
2. Railway will auto-deploy the updated backend
3. Wait ~2-3 minutes for deployment

### **Step 2: Verify API Keys in Railway**
Make sure these environment variables are set in Railway:
- `ANTHROPIC_API_KEY` - Your Claude API key (starts with `sk-ant-`)
- `OPENAI_API_KEY` - Your OpenAI key (backup, starts with `sk-`)

### **Step 3: Test It!**
1. **Open Trending page** at `/trending`
2. **Click any trending topic** (e.g., "Gut Health Supplements")
3. **Click "Generate Summary"** button in the AI INSIGHT box
4. **Wait ~2-3 seconds** for Claude to analyze
5. **Read your personalized insight!**

## 🎨 **UI Features**

- ✨ Purple gradient AI Insight box
- 🔘 "Generate Summary" button
- ⏳ Loading spinner while generating
- 📝 Clean, readable summary display
- 🔄 Regenerate button to get new summary

## 💡 **Future Enhancements**

1. **Save summaries** to database for reuse
2. **Batch generate** for all trending topics
3. **Custom prompts** based on Susan's content style
4. **Include actual posts** from Reddit/YouTube in context
5. **Multiple AI models** - compare Claude vs GPT-4
6. **Voice summary** - text-to-speech for listening

---

## 🔐 **Security Benefits**

✅ **No API keys in frontend** - Keys stay secure on backend  
✅ **No CORS issues** - All calls go through your server  
✅ **Rate limiting possible** - Control AI API usage  
✅ **Cost tracking** - Monitor AI spending centrally  

---

**Status:** ✅ Backend Updated | ⚠️ Needs Railway Deployment
