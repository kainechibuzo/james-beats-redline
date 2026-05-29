-- 1. Extend songs for YouTube playback
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS thumbnail text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'upload';

ALTER TABLE public.songs ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE public.songs ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS songs_youtube_video_id_key
  ON public.songs (youtube_video_id)
  WHERE youtube_video_id IS NOT NULL;

-- Public can view YouTube songs even without a user_id (ingested by the system)
DROP POLICY IF EXISTS "Public songs are viewable" ON public.songs;
CREATE POLICY "Public songs are viewable"
ON public.songs FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- 2. Ingestion sources table
CREATE TABLE IF NOT EXISTS public.ingestion_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('trending', 'search', 'playlist')),
  value text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT 'US',
  max_results integer NOT NULL DEFAULT 10,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingestion_sources TO authenticated;
GRANT ALL ON public.ingestion_sources TO service_role;

ALTER TABLE public.ingestion_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ingestion sources"
ON public.ingestion_sources FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ingestion_sources_updated_at
BEFORE UPDATE ON public.ingestion_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Extensions for the daily job
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;