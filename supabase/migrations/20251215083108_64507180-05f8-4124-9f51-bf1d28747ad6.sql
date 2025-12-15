-- Create table for auto-generated playlists (Discover Weekly, Release Radar, Daily Mixes, Daylist)
CREATE TABLE IF NOT EXISTS public.generated_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discover_weekly', 'release_radar', 'daily_mix', 'daylist', 'ai_generated', 'blend', 'wrapped')),
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  songs JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for song lyrics
CREATE TABLE IF NOT EXISTS public.lyrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  synced BOOLEAN NOT NULL DEFAULT false,
  behind_the_lyrics TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for collaborative playlists
CREATE TABLE IF NOT EXISTS public.playlist_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'admin')),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Jam Sessions (real-time listening)
CREATE TABLE IF NOT EXISTS public.jam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  current_song_id UUID REFERENCES public.songs(id),
  current_position INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  participants JSONB DEFAULT '[]'::jsonb,
  queue JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for friend activity (what friends are listening to)
CREATE TABLE IF NOT EXISTS public.listening_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create table for Spotify Wrapped-style data
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER,
  top_songs JSONB DEFAULT '[]'::jsonb,
  top_artists JSONB DEFAULT '[]'::jsonb,
  top_genres JSONB DEFAULT '[]'::jsonb,
  total_minutes INTEGER DEFAULT 0,
  total_songs INTEGER DEFAULT 0,
  listening_personality TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Blend playlists
CREATE TABLE IF NOT EXISTS public.blends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  songs JSONB DEFAULT '[]'::jsonb,
  taste_match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.generated_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_activity
CREATE POLICY "Friends can view activity" ON public.listening_activity FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.followers WHERE follower_id = auth.uid() AND following_id = user_id)
  OR auth.uid() = user_id
);
CREATE POLICY "Users can insert own activity" ON public.listening_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own activity" ON public.listening_activity FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for blends
CREATE POLICY "Participants can view blends" ON public.blends FOR SELECT USING (
  participants::text LIKE '%' || auth.uid()::text || '%'
);
CREATE POLICY "Users can create blends" ON public.blends FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update blends" ON public.blends FOR UPDATE USING (
  participants::text LIKE '%' || auth.uid()::text || '%'
);

-- Enable realtime for jam sessions and listening activity
ALTER PUBLICATION supabase_realtime ADD TABLE public.jam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listening_activity;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_playlists_user ON public.generated_playlists(user_id, type);
CREATE INDEX IF NOT EXISTS idx_generated_playlists_expires ON public.generated_playlists(expires_at);
CREATE INDEX IF NOT EXISTS idx_lyrics_song ON public.lyrics(song_id);
CREATE INDEX IF NOT EXISTS idx_listening_activity_user ON public.listening_activity(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_jam_sessions_invite ON public.jam_sessions(invite_code);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_year ON public.user_stats(user_id, year);

-- Trigger for updated_at (use IF NOT EXISTS pattern)
DROP TRIGGER IF EXISTS update_generated_playlists_updated_at ON public.generated_playlists;
CREATE TRIGGER update_generated_playlists_updated_at BEFORE UPDATE ON public.generated_playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_jam_sessions_updated_at ON public.jam_sessions;
CREATE TRIGGER update_jam_sessions_updated_at BEFORE UPDATE ON public.jam_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blends_updated_at ON public.blends;
CREATE TRIGGER update_blends_updated_at BEFORE UPDATE ON public.blends FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();