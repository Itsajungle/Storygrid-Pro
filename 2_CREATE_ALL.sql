-- RUN THIS SECOND - Creates everything fresh

CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  youtube_id TEXT,
  duration INTEGER,
  duration_formatted TEXT,
  recorded_date DATE,
  uploaded_date TIMESTAMPTZ,
  status TEXT DEFAULT 'raw' NOT NULL,
  clips_extracted INTEGER DEFAULT 0,
  clips_used INTEGER DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.video_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  status TEXT DEFAULT 'extracted' NOT NULL,
  platform TEXT,
  post_url TEXT,
  posted_date DATE,
  description TEXT,
  hook TEXT,
  tags TEXT[],
  notes TEXT,
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.video_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  relevance_score DECIMAL(3,2),
  timestamp INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select" ON public.videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "videos_insert" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "videos_update" ON public.videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "videos_delete" ON public.videos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "clips_select" ON public.video_clips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clips_insert" ON public.video_clips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clips_update" ON public.video_clips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clips_delete" ON public.video_clips FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "topics_select" ON public.video_topics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.videos WHERE id = video_id AND user_id = auth.uid())
);
