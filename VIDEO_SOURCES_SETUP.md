# Video Library - Multiple Video Sources

## ✨ **New Feature: Support for Multiple Video Sources**

The Video Library now supports 4 different video source types:

### **Supported Sources:**

1. **📺 YouTube** - Public or unlisted YouTube videos
   - Example: `https://youtube.com/watch?v=dQw4w9WgXcQ`

2. **🎬 Vimeo** - Vimeo hosted videos
   - Example: `https://vimeo.com/123456789`

3. **💾 Local (Hard Drive)** - Videos stored on local computer
   - Example: `/Users/susan/Videos/gut-health-episode-05.mp4`
   - Example (Windows): `C:\Users\Susan\Videos\episode-05.mp4`

4. **🗄️ NAS (Network Storage)** - Videos on network-attached storage
   - Example: `//NAS-SERVER/Videos/raw-footage/episode-05.mp4`
   - Example (Mac): `smb://nas.local/Videos/episode-05.mp4`

---

## 🔄 **Database Migration Required**

### **Step 1: Run SQL Migration in Supabase**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open and run: `3_ADD_VIDEO_SOURCES.sql`
3. This adds:
   - `video_source` column (youtube/vimeo/local/nas)
   - `video_url` column (universal URL/path field)
   - Migrates existing YouTube URLs

---

## 🎨 **UI Changes:**

### **Add/Edit Video Form:**
- **Video Source dropdown**: Choose between YouTube, Vimeo, Local, or NAS
- **Dynamic URL field**: Label and placeholder change based on selected source
  - YouTube → "YouTube URL"
  - Vimeo → "Vimeo URL"
  - Local → "File Path (Local)"
  - NAS → "File Path (NAS)"

### **Video List:**
- **Color-coded buttons**:
  - YouTube: Red
  - Vimeo: Blue
  - Local/NAS: Gray
- **Dynamic icons**: Each source has its own icon
- **Smart links**: 
  - YouTube/Vimeo open in new tab
  - Local/NAS open in same tab (file system)

---

## 📋 **How to Use:**

### **Adding a YouTube Video:**
1. Click "Add Video"
2. Select "📺 YouTube" from dropdown
3. Paste YouTube URL: `https://youtube.com/watch?v=...`
4. Fill in other details
5. Save

### **Adding a Local Video:**
1. Click "Add Video"
2. Select "💾 Local (Hard Drive)"
3. Enter file path: `/Users/susan/Videos/episode-05.mp4`
4. Fill in other details
5. Save

### **Adding a NAS Video:**
1. Click "Add Video"
2. Select "🗄️ NAS (Network Storage)"
3. Enter network path: `//NAS/Videos/episode-05.mp4`
4. Fill in other details
5. Save

---

## 🔍 **Backward Compatibility:**

- ✅ Existing videos automatically migrated to `video_source: 'youtube'`
- ✅ Old `youtube_url` field preserved for compatibility
- ✅ New videos populate both `video_url` and `youtube_url` (if YouTube)

---

## 💡 **Use Cases:**

### **For Susan:**

**YouTube Videos (Published Content):**
- Track all published episodes
- Monitor performance
- Extract clips for social media

**Vimeo Videos (Private/Client Content):**
- Store private videos not yet on YouTube
- Share with team or clients
- Track unlisted content

**Local Videos (Unreleased Footage):**
- Track raw footage on editing workstation
- Organize footage before upload
- Plan content pipeline

**NAS Videos (Archive & Backup):**
- Central storage for all video team
- Archived episodes
- Raw B-roll library

---

## 🎯 **Next Steps:**

1. **Run migration** in Supabase (`3_ADD_VIDEO_SOURCES.sql`)
2. **Deploy frontend** (Netlify auto-deploys on push)
3. **Test adding videos** from each source type
4. **Organize existing library** by source

---

## 🚀 **Future Enhancements:**

- **Dropbox/Google Drive** integration
- **Automatic file discovery** (scan local folders)
- **Thumbnail extraction** from local files
- **Batch import** from NAS directories
- **Cloud storage** (S3, Cloudflare R2)

---

**Status:** ✅ Ready for Supabase Migration
