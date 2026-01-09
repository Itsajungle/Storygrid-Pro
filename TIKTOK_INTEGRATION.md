# TikTok Trends Integration Guide

## ✅ **COMPLETED: Backend Integration**

### 📦 **Dependencies Added**
Added to `management-hub/requirements.txt`:
- `TikTokApi==6.5.2` - Free TikTok scraping library  
- `playwright==1.48.0` - Browser automation (required by TikTokApi)

### 🛠️ **Installation on Railway**

**IMPORTANT:** After pushing these changes, you need to:

1. Go to Railway Dashboard → Management Hub service
2. Click **"Settings" → "Deploy" → "Clear Build Cache and Redeploy"**
3. Wait for deployment to complete (~5 minutes)

After deployment, run playwright setup (only needed once):
```bash
# SSH into Railway container or run locally:
python -m playwright install
```

### 🔌 **New API Endpoints**

#### 1. **GET /api/trends/tiktok**
Get trending TikTok videos and hashtags (US-focused, health & wellness filtered)

**Query Parameters:**
- `count` (int, default=20): Number of trending videos to fetch
- `force_refresh` (bool, default=false): Skip cache and fetch fresh data

**Response:**
```json
{
  "videos": [...],
  "total_videos": 20,
  "trending_hashtags": [...],
  "health_wellness_videos": [...],
  "health_video_count": 8,
  "source": "TikTok (Free API)",
  "region": "US",
  "cached": false,
  "timestamp": "2026-01-09T..."
}
```

**Caching:** Results cached for 1 hour to avoid rate limiting.

#### 2. **GET /api/trends/tiktok/health**
Health check endpoint for monitoring system

**Response:**
```json
{
  "status": "healthy",
  "message": "TikTok API responding normally",
  "timestamp": "2026-01-09T...",
  "cache_age_seconds": 300,
  "library": "davidteather/TikTok-Api"
}
```

**Status values:**
- `healthy` - API working normally
- `degraded` - API accessible but no data
- `unhealthy` - API error (needs attention)
- `offline` - Library not installed

#### 3. **GET /api/trends/tiktok/search**
Search TikTok videos by keyword

**Query Parameters:**
- `query` (string, required): Search term
- `count` (int, default=20): Number of results

**Example:**
```
GET /api/trends/tiktok/search?query=gut%20health&count=15
```

#### 4. **POST /api/trends/tiktok/cache/clear**
Clear TikTok cache (admin endpoint)

---

### 🔍 **Monitoring Integration**

The TikTok API is now integrated into your infrastructure monitoring system:

**GET /api/trends/status** - Now includes TikTok:
```json
{
  "sources": [
    {
      "id": "tiktok",
      "name": "TikTok",
      "status": "online",
      "icon": "🎵",
      "message": "Free TikTok-Api library - may break when TikTok updates",
      "region": "US"
    }
  ]
}
```

**Monitoring Rules:**
1. Check health every hour via `/api/trends/tiktok/health`
2. Alert after 3 consecutive failures
3. If down >24hrs, suggest Apify backup

---

### ⚠️ **Important Notes**

#### **Why This API May Break:**
- TikTok-Api is a **free scraping library** (no official API key)
- When TikTok updates their website, the library breaks
- Usually fixed within days by maintainers
- Check issues: https://github.com/davidteather/TikTok-Api/issues

#### **Backup Plan (Apify):**
If TikTok-Api stays broken >24 hours, switch to Apify TikTok API:
- Cost: $0.001 per 100 results (~$1 for 100,000 videos)
- Official scraping service
- URL: https://apify.com/novi/tiktok-trend-api

#### **Health Keywords Filtered:**
```python
health_keywords = [
    "health", "wellness", "fitness", "nutrition", "gut", "sleep", 
    "hormone", "menopause", "weight", "diet", "mental", "anxiety", 
    "stress", "longevity", "aging", "beauty", "skin", "hair"
]
```

---

## 🎨 **FRONTEND INTEGRATION** (To Be Completed)

### ✅ **Completed:**
- Added TikTok tab button in `src/pages/Trending.tsx` navigation

### 📝 **TODO: Complete Frontend**

You need to add:

1. **State for TikTok data** (around line 800):
```typescript
// TikTok data
const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
const [tiktokHashtags, setTiktokHashtags] = useState<TikTokHashtag[]>([]);
const [tiktokHealthCount, setTiktokHealthCount] = useState(0);
```

2. **Type definitions** (around line 120):
```typescript
interface TikTokVideo {
  id: string;
  description: string;
  author: {
    username: string;
    nickname: string;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  hashtags: string[];
  url: string | null;
  created_at: number | null;
}

interface TikTokHashtag {
  hashtag: string;
  count: number;
  total_views: number;
  total_likes: number;
}
```

3. **Fetch TikTok data** in `fetchRealTrends()` function (around line 940):
```typescript
// Fetch TikTok trends
const tiktokResponse = await fetch(
  `${MANAGEMENT_HUB_URL}/api/trends/tiktok?count=30`
);

if (tiktokResponse.ok) {
  const tiktokData = await tiktokResponse.json();
  if (tiktokData.videos && tiktokData.videos.length > 0) {
    setTiktokVideos(tiktokData.videos);
    setTiktokHashtags(tiktokData.trending_hashtags || []);
    setTiktokHealthCount(tiktokData.health_video_count || 0);
    setUsingRealData(true);
  }
}
```

4. **TikTok tab content** (around line 2100):
```tsx
{activeTab === 'tiktok' && (
  <div>
    <h2 style={{
      fontFamily: "'Outfit', sans-serif",
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#1F2937'
    }}>
      🎵 Trending on TikTok ({tiktokHealthCount} Health/Wellness)
    </h2>

    {/* Trending Hashtags */}
    {tiktokHashtags.length > 0 && (
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
          🔥 Trending Hashtags
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tiktokHashtags.slice(0, 20).map((tag, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.2)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#7C3AED' }}>
                #{tag.hashtag}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {tag.count} videos • {(tag.total_views / 1000000).toFixed(1)}M views
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Video Grid */}
    {tiktokVideos.length > 0 ? (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {tiktokVideos.map((video, idx) => (
          <div
            key={video.id}
            className={mounted ? 'animate-in' : ''}
            style={{
              animationDelay: `${idx * 50}ms`,
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Play size={16} color="#7C3AED" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>
                @{video.author.username}
              </span>
            </div>
            
            <p style={{
              fontSize: '14px',
              color: '#374151',
              marginBottom: '12px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {video.description}
            </p>

            {/* Hashtags */}
            {video.hashtags && video.hashtags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {video.hashtags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: '#7C3AED',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#6B7280'
            }}>
              <div>👁️ {(video.stats.views / 1000).toFixed(1)}K</div>
              <div>❤️ {(video.stats.likes / 1000).toFixed(1)}K</div>
              <div>💬 {video.stats.comments}</div>
              <div>↗️ {video.stats.shares}</div>
            </div>

            {/* View Button */}
            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                <ExternalLink size={14} />
                Watch on TikTok
              </a>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        color: '#6B7280',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px'
      }}>
        <Play size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading TikTok trends...</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          Free API - may take a moment to load
        </p>
      </div>
    )}
  </div>
)}
```

5. **Add TikTok to data sources** (around line 210):
```typescript
{
  id: 'tiktok',
  name: 'TikTok',
  type: 'social',
  icon: '🎵',
  color: '#000000',
  description: 'Viral short-form video trends',
  url: 'https://www.tiktok.com'
},
```

---

## 🚀 **Deployment Steps**

1. **Commit and push** backend changes:
```bash
git add management-hub/requirements.txt management-hub/main.py
git commit -m "Add TikTok Trends API integration"
git push
```

2. **Clear Railway build cache** (Management Hub):
   - Go to Railway Dashboard
   - Management Hub service → Settings → Deploy
   - Click "Clear Build Cache and Redeploy"

3. **Install Playwright** (after deployment):
```bash
# Option A: If you have Railway CLI
railway run python -m playwright install

# Option B: Add to Procfile (recommended):
# Add this line to management-hub/Procfile:
release: python -m playwright install
```

4. **Test the API:**
```bash
curl https://management-hub-production-80d6.up.railway.app/api/trends/tiktok/health
```

5. **Complete frontend integration** (see TODO above)

6. **Monitor health** - Your infrastructure system will automatically:
   - Check TikTok API health every hour
   - Alert if down for 3+ hours
   - Suggest Apify backup if down >24 hours

---

## 📊 **Expected Behavior**

### ✅ **When Working:**
- TikTok tab shows 20-30 trending videos
- Health & wellness videos highlighted
- Hashtags sorted by popularity
- Data cached for 1 hour
- Status shows "🎵 TikTok: Online"

### ⚠️ **When Broken:**
- Status shows "🎵 TikTok: Error"
- Error message with GitHub issues link
- Suggestion to update library or use Apify
- Other sources continue working normally

---

## 🔧 **Troubleshooting**

### Issue: "TikTokApi library not installed"
**Fix:** Clear Railway build cache and redeploy

### Issue: "playwright not installed"
**Fix:** Run `python -m playwright install` in Railway container

### Issue: "TikTok API returning no data"
**Possible causes:**
1. TikTok changed their API structure → Check GitHub issues
2. Rate limiting → Wait and use cached data
3. Library needs update → `pip install --upgrade TikTokApi`

### Issue: "Library broken after TikTok update"
**Your monitoring system will:**
1. Detect failure within 1 hour
2. Send alert with GitHub issues link
3. Suggest update commands
4. If down >24hrs, suggest Apify backup

---

## 💰 **Cost Analysis**

### Current (Free):
- davidteather/TikTok-Api: **FREE**
- Playwright: **FREE**
- May break occasionally
- Good for MVP and testing

### Backup (Apify):
- $0.001 per 100 results
- ~$1 for 100,000 videos
- More reliable
- Official scraping service

---

## 📚 **Resources**

- TikTok-Api GitHub: https://github.com/davidteather/TikTok-Api
- Apify TikTok API: https://apify.com/novi/tiktok-trend-api
- Playwright Docs: https://playwright.dev/python/

---

**Status:** Backend ✅ Complete | Frontend 🚧 In Progress
