# Video Library Setup Instructions

## 📋 **Overview**
The Video Library system uses Supabase for data storage, providing a robust database-backed solution for tracking all video content.

---

## 🗄️ **Step 1: Create Database Schema in Supabase**

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase_video_library_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ `videos` table
- ✅ `video_clips` table  
- ✅ `video_topics` table
- ✅ Indexes for fast searching
- ✅ Row Level Security (RLS) policies
- ✅ Full-text search functionality
- ✅ YouTube ID extraction
- ✅ Analytics views

---

## ✅ **Step 2: Verify Tables Created**

1. In Supabase dashboard, go to **Table Editor**
2. You should see three new tables:
   - `videos`
   - `video_clips`
   - `video_topics`

---

## 🔑 **Step 3: Environment Variables (Already Set)**

Your `.env` should already have:
```env
VITE_SUPABASE_URL=https://yljdgsywqombavyzxhqj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ These are already configured in your app!

---

## 📊 **Database Schema Overview**

### **videos table**
Stores all video content with:
- Basic info (title, description, YouTube URL)
- Metadata (duration, recorded date)
- Status tracking (raw, edited, published, clipped)
- Clips tracking (extracted/used counts)
- Tags array for organization
- Notes for production details

### **video_clips table**
Tracks individual clips extracted from videos:
- Linked to parent video
- Start/end timestamps
- Usage status (extracted, edited, posted)
- Platform tracking (Instagram, TikTok, YouTube Shorts)
- Performance metrics (views, engagement)

### **video_topics table**
AI-generated topic analysis:
- Detected topics in videos
- Relevance scores
- Timestamps for topic mentions

---

## 🔍 **Search Features**

The schema includes:
1. **Full-text search** - Search across titles, descriptions, notes
2. **Tag filtering** - Filter by multiple tags
3. **Status filtering** - Filter by video status
4. **Date range** - Filter by recorded date
5. **Ranked results** - Results sorted by relevance

---

## 🎯 **Next Steps**

After running the SQL schema:
1. ✅ Database is ready
2. ✅ Frontend component is updated (VideoLibrary.tsx)
3. ✅ Search functionality is integrated
4. 🚀 Start adding videos!

---

## 📱 **Features Available**

- ✅ Add/Edit/Delete videos
- ✅ Full-text search
- ✅ Filter by status
- ✅ Filter by tags
- ✅ Track clips extracted/used
- ✅ YouTube integration
- ✅ Notes and production details
- ✅ Auto-extract YouTube IDs
- ✅ Analytics dashboard

---

## 🔧 **Troubleshooting**

**If tables don't appear:**
1. Check SQL Editor for errors
2. Make sure you're in the correct Supabase project
3. Verify RLS policies are enabled

**If search doesn't work:**
1. Check that full-text search index was created
2. Verify `search_videos` function exists
3. Check browser console for errors

---

## 🎉 **You're Ready!**

The Video Library is now fully integrated with Supabase!
