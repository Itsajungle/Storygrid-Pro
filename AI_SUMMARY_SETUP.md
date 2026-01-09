# AI Trend Summary Feature - Setup Guide

## ✨ **What This Does**

The "Generate AI Summary" button in the Trending page:
- Gathers data from ALL sources for a topic
- Sends it to Claude Sonnet 4 (primary) or OpenAI GPT-4 (fallback)
- Returns a 3-4 sentence actionable summary covering:
  1. What's driving this trend (with specific source)
  2. Why it matters now
  3. One specific content opportunity for Susan

## 🔑 **Setup - ALREADY DONE! ✅**

The system uses your **existing API keys** from the Story Grid Pro API Key Manager:
- Tries **Claude Sonnet 4** first (cheaper, better for analysis)
- Falls back to **OpenAI GPT-4o-mini** if Claude unavailable
- Keys stored in: `localStorage.getItem('VITE_OPENAI_API_KEY')` and `localStorage.getItem('VITE_ANTHROPIC_API_KEY')`

**No additional setup needed!** The keys are already managed through Settings → API Keys.

### **How It Works:**

1. User clicks "Generate Summary" on any trending topic
2. System gathers: topic, sources, percentages, audience data, related terms
3. Checks for Claude API key in localStorage
4. Sends formatted prompt to Claude Sonnet 4
5. If Claude unavailable, falls back to GPT-4o-mini
6. Returns 3-4 sentence summary tailored for Susan

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

## 🚀 **Ready to Use!**

1. **Open Trending page** at `/trending`
2. **Click any trending topic** (e.g., "Gut Health Supplements")
3. **Click "Generate Summary"** button in the AI INSIGHT box
4. **Wait ~2-3 seconds** for Claude to analyze
5. **Read your personalized insight!**

That's it! No extra setup needed.

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

**Status:** ✅ READY TO USE - Uses existing API keys from Settings!
