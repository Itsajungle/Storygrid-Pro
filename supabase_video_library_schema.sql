-- ============================================
-- Video Library Schema for Story Grid Pro
-- ============================================

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  youtube_id TEXT, -- Extract from URL for easier embedding
  
  -- Video metadata
  duration INTEGER, -- Duration in seconds
  duration_formatted TEXT, -- "45:32" format
  recorded_date DATE,
  uploaded_date TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'raw' CHECK (status IN ('raw', 'edited', 'published', 'clipped', 'archived')),
  
  -- Content tracking
  clips_extracted INTEGER DEFAULT 0,
  clips_used INTEGER DEFAULT 0,
  
  -- Organization
  tags TEXT[], -- Array of tags for easy filtering
  notes TEXT,
  thumbnail_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clips table (for tracking individual clips from videos)
CREATE TABLE IF NOT EXISTS video_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Clip info
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL, -- Start time in seconds
  end_time INTEGER NOT NULL, -- End time in seconds
  duration INTEGER GENERATED ALWAYS AS (end_time - start_time) STORED,
  
  -- Usage tracking
  status TEXT NOT NULL DEFAULT 'extracted' CHECK (status IN ('extracted', 'edited', 'posted', 'archived')),
  platform TEXT, -- Where was it posted: 'instagram', 'tiktok', 'youtube_shorts', etc.
  post_url TEXT,
  posted_date DATE,
  
  -- Content
  description TEXT,
  hook TEXT, -- The attention-grabbing hook
  tags TEXT[],
  notes TEXT,
  
  -- Performance (if posted)
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video_topics table (for AI-generated topic analysis)
CREATE TABLE IF NOT EXISTS video_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  
  -- Topic info
  topic TEXT NOT NULL,
  relevance_score DECIMAL(3,2), -- 0.00 to 1.00
  timestamp INTEGER, -- When in video (seconds)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_videos_recorded_date ON videos(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clips_video_id ON video_clips(video_id);
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON video_clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_status ON video_clips(status);
CREATE INDEX IF NOT EXISTS idx_clips_platform ON video_clips(platform);
CREATE INDEX IF NOT EXISTS idx_clips_tags ON video_clips USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_topics_video_id ON video_topics(video_id);
CREATE INDEX IF NOT EXISTS idx_topics_topic ON video_topics(topic);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clips_updated_at
  BEFORE UPDATE ON video_clips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for videos
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for clips
CREATE POLICY "Users can view their own clips"
  ON video_clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips"
  ON video_clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
  ON video_clips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips"
  ON video_clips FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for topics (read-only for users)
CREATE POLICY "Users can view topics for their videos"
  ON video_topics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = video_topics.video_id
    AND videos.user_id = auth.uid()
  ));

-- Create view for video statistics
CREATE OR REPLACE VIEW video_stats AS
SELECT 
  v.id,
  v.user_id,
  v.title,
  v.status,
  v.clips_extracted,
  v.clips_used,
  COALESCE(ROUND((v.clips_used::DECIMAL / NULLIF(v.clips_extracted, 0)) * 100, 0), 0) as clip_usage_percentage,
  COUNT(DISTINCT vc.id) as total_clips,
  COUNT(DISTINCT CASE WHEN vc.status = 'posted' THEN vc.id END) as posted_clips,
  COALESCE(SUM(vc.views), 0) as total_views,
  COALESCE(AVG(vc.engagement_rate), 0) as avg_engagement_rate,
  ARRAY_AGG(DISTINCT vt.topic) FILTER (WHERE vt.topic IS NOT NULL) as detected_topics
FROM videos v
LEFT JOIN video_clips vc ON v.id = vc.video_id
LEFT JOIN video_topics vt ON v.id = vt.video_id
GROUP BY v.id, v.user_id, v.title, v.status, v.clips_extracted, v.clips_used;

-- Grant access to the view
GRANT SELECT ON video_stats TO authenticated;

-- Create function to extract YouTube ID from URL
CREATE OR REPLACE FUNCTION extract_youtube_id(url TEXT)
RETURNS TEXT AS $$
DECLARE
  youtube_id TEXT;
BEGIN
  -- Handle various YouTube URL formats
  IF url ~ 'youtube\.com/watch\?v=([^&]+)' THEN
    youtube_id := (regexp_matches(url, 'youtube\.com/watch\?v=([^&]+)'))[1];
  ELSIF url ~ 'youtu\.be/([^?]+)' THEN
    youtube_id := (regexp_matches(url, 'youtu\.be/([^?]+)'))[1];
  ELSIF url ~ 'youtube\.com/embed/([^?]+)' THEN
    youtube_id := (regexp_matches(url, 'youtube\.com/embed/([^?]+)'))[1];
  END IF;
  
  RETURN youtube_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-extract YouTube ID
CREATE OR REPLACE FUNCTION set_youtube_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.youtube_url IS NOT NULL AND NEW.youtube_url != '' THEN
    NEW.youtube_id := extract_youtube_id(NEW.youtube_url);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER extract_youtube_id_trigger
  BEFORE INSERT OR UPDATE OF youtube_url ON videos
  FOR EACH ROW
  EXECUTE FUNCTION set_youtube_id();

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_videos_search 
  ON videos USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, ''))
  );

-- Create search function
CREATE OR REPLACE FUNCTION search_videos(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  tags TEXT[],
  recorded_date DATE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.status,
    v.tags,
    v.recorded_date,
    ts_rank(
      to_tsvector('english', COALESCE(v.title, '') || ' ' || COALESCE(v.description, '') || ' ' || COALESCE(v.notes, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM videos v
  WHERE 
    (user_uuid IS NULL OR v.user_id = user_uuid)
    AND (
      to_tsvector('english', COALESCE(v.title, '') || ' ' || COALESCE(v.description, '') || ' ' || COALESCE(v.notes, ''))
      @@ plainto_tsquery('english', search_query)
      OR v.tags && string_to_array(lower(search_query), ' ')
    )
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_videos TO authenticated;

-- Sample data for testing (optional - comment out for production)
-- INSERT INTO videos (user_id, title, description, youtube_url, duration, duration_formatted, recorded_date, status, tags, notes)
-- VALUES 
--   (auth.uid(), 'Gut Health Masterclass', 'Deep dive into gut microbiome', 'https://youtube.com/watch?v=example1', 2732, '45:32', '2024-11-15', 'published', ARRAY['gut health', 'probiotics'], 'Great fermented foods section'),
--   (auth.uid(), 'Hair Loss Solutions', 'Evidence-based approaches', 'https://youtube.com/watch?v=example2', 2325, '38:45', '2024-12-01', 'edited', ARRAY['hair loss', 'supplements'], 'Ready for Vizard');

-- Create analytics view for dashboard
CREATE OR REPLACE VIEW video_analytics AS
SELECT 
  v.user_id,
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE v.status = 'raw') as raw_count,
  COUNT(*) FILTER (WHERE v.status = 'edited') as edited_count,
  COUNT(*) FILTER (WHERE v.status = 'published') as published_count,
  COUNT(*) FILTER (WHERE v.status = 'clipped') as clipped_count,
  SUM(v.clips_extracted) as total_clips_extracted,
  SUM(v.clips_used) as total_clips_used,
  ROUND(AVG(v.duration), 0) as avg_duration_seconds,
  ARRAY_AGG(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) as all_unique_tags
FROM videos v
LEFT JOIN LATERAL unnest(v.tags) AS t(tag) ON true
GROUP BY v.user_id;

GRANT SELECT ON video_analytics TO authenticated;
