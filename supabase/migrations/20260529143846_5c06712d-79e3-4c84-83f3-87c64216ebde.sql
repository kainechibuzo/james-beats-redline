CREATE TABLE public.mixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  artist TEXT,
  youtube_video_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  total_duration TEXT,
  tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mixes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mixes TO authenticated;
GRANT ALL ON public.mixes TO service_role;

ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public mixes are viewable"
ON public.mixes FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Admins manage all mixes"
ON public.mixes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users create own mixes"
ON public.mixes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mixes"
ON public.mixes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own mixes"
ON public.mixes FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_mixes_updated_at
BEFORE UPDATE ON public.mixes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mixes_featured ON public.mixes(is_featured) WHERE is_featured = true;
CREATE INDEX idx_mixes_created ON public.mixes(created_at DESC);