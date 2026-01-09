-- RUN THIS FIRST - Drops everything
DROP TABLE IF EXISTS public.video_topics CASCADE;
DROP TABLE IF EXISTS public.video_clips CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
