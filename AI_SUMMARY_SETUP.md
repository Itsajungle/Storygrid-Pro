# AI Trend Summary Feature - Setup Guide

## ✨ **What This Does**

The "Generate AI Summary" button in the Trending page:
- Gathers data from ALL sources for a topic
- Sends it to OpenAI GPT-4
- Returns a 3-4 sentence actionable summary covering:
  1. What's driving this trend
  2. Why it matters now
  3. Content opportunity for Susan

## 🔑 **Setup Required**

### **Option 1: User Sets Their Own API Key (Recommended for Now)**

1. User clicks "Generate Summary" button
2. If no API key, shows error message
3. User adds OpenAI API key to browser localStorage:
   ```javascript
   localStorage.setItem('openai_api_key', 'sk-...')
   ```

### **Option 2: Backend Proxy (More Secure)**

Create an endpoint in Management Hub that proxies OpenAI requests:

```python
# In management-hub/main.py

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

@app.post("/api/ai/summarize-trend")
async def summarize_trend(
    topic: str,
    context: dict
):
    """Generate AI summary of trend data"""
    import openai
    
    openai.api_key = OPENAI_API_KEY
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "You are a health & wellness trend analyst..."
        }, {
            "role": "user",
            "content": f"Analyze this trend: {json.dumps(context)}"
        }],
        max_tokens=200,
        temperature=0.7
    )
    
    return {
        "summary": response.choices[0].message.content
    }
```

Then update frontend to call this endpoint instead.

## 💰 **Cost Estimate**

**GPT-4 Pricing:**
- ~$0.03 per 1K input tokens
- ~$0.06 per 1K output tokens
- Each summary: ~500 input tokens + 200 output tokens
- **Cost per summary: ~$0.03**

**Claude Sonnet 4 Alternative (Cheaper):**
- ~$0.003 per 1K input tokens
- ~$0.015 per 1K output tokens
- **Cost per summary: ~$0.005**

## 🎯 **Example Output**

**Topic:** "Gut Health Supplements"

**AI Summary:**
> This trend is surging (+183%) driven primarily by TikTok (65% of mentions), where wellness creators are sharing personal gut health transformation stories. The timing aligns with growing scientific research on the gut-brain connection and increased awareness of microbiome health. **Content Opportunity:** Create a video series debunking common gut health myths, featuring before/after microbiome test results, and interview gastroenterologists about evidence-based supplement recommendations.

## 🔄 **Alternative: Use Claude Instead of OpenAI**

Update the `generateAISummary` function to use Anthropic Claude:

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': localStorage.getItem('anthropic_api_key') || '',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Analyze this health/wellness trend...`
    }]
  })
});
```

## 🚀 **Next Steps**

1. **Decide which approach:**
   - Quick: User provides own API key
   - Secure: Backend proxy endpoint

2. **Get API key:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

3. **Test it:**
   - Open Trending page
   - Click any topic
   - Click "Generate Summary"
   - See AI-powered insights!

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

**Status:** Frontend ✅ Ready | Backend ⚠️ API Key Needed
