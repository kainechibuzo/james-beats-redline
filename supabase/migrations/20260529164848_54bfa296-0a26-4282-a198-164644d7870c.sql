DROP INDEX IF EXISTS public.songs_youtube_video_id_key;
ALTER TABLE public.songs ADD CONSTRAINT songs_youtube_video_id_key UNIQUE (youtube_video_id);