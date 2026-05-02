-- search_history
CREATE TABLE public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own search history" ON public.search_history FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_search_history_user_created ON public.search_history(user_id, created_at DESC);

-- playlist_folders
CREATE TABLE public.playlist_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.playlist_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own folders" ON public.playlist_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own folders" ON public.playlist_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own folders" ON public.playlist_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own folders" ON public.playlist_folders FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_playlist_folders_updated_at BEFORE UPDATE ON public.playlist_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.playlists ADD COLUMN folder_id uuid;

-- liked_radio_stations
CREATE TABLE public.liked_radio_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  station_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, station_id)
);
ALTER TABLE public.liked_radio_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own liked stations" ON public.liked_radio_stations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users like stations" ON public.liked_radio_stations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike stations" ON public.liked_radio_stations FOR DELETE USING (auth.uid() = user_id);

-- followed_podcasts
CREATE TABLE public.followed_podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  podcast_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, podcast_id)
);
ALTER TABLE public.followed_podcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own followed podcasts" ON public.followed_podcasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users follow podcasts" ON public.followed_podcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unfollow podcasts" ON public.followed_podcasts FOR DELETE USING (auth.uid() = user_id);

-- featured radio stations
ALTER TABLE public.radio_stations ADD COLUMN is_featured boolean NOT NULL DEFAULT false;