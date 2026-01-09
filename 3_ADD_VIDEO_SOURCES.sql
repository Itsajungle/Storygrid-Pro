-- Add support for multiple video sources (YouTube, Vimeo, Local/NAS)

ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS video_source TEXT DEFAULT 'youtube' CHECK (video_source IN ('youtube', 'vimeo', 'local', 'nas'));

ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update existing records to use new fields
UPDATE public.videos 
SET video_url = youtube_url,
    video_source = 'youtube'
WHERE youtube_url IS NOT NULL AND video_url IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.videos.video_source IS 'Source type: youtube, vimeo, local (hard drive), or nas (network storage)';
COMMENT ON COLUMN public.videos.video_url IS 'Universal video URL or file path';
COMMENT ON COLUMN public.videos.youtube_url IS 'Legacy field - kept for backward compatibility';
