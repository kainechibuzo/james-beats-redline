
-- Radio stations table
CREATE TABLE public.radio_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  cover_url TEXT,
  genre TEXT,
  is_live BOOLEAN NOT NULL DEFAULT true,
  listener_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.radio_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Radio stations are publicly viewable" ON public.radio_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage radio stations" ON public.radio_stations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can create stations" ON public.radio_stations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host TEXT,
  cover_url TEXT,
  rss_url TEXT,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Podcasts are publicly viewable" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Admins can manage podcasts" ON public.podcasts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Podcast episodes table
CREATE TABLE public.podcast_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  play_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Episodes are publicly viewable" ON public.podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage episodes" ON public.podcast_episodes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Live streams table (sports commentary, news, etc.)
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  host_name TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams are publicly viewable" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Admins can manage live streams" ON public.live_streams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can create streams" ON public.live_streams FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
