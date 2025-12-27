-- Add liked_albums table for liking albums
CREATE TABLE public.liked_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, album_id)
);

-- Enable Row Level Security
ALTER TABLE public.liked_albums ENABLE ROW LEVEL SECURITY;

-- RLS policies for liked_albums
CREATE POLICY "Users can like albums"
ON public.liked_albums
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike albums"
ON public.liked_albums
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own liked albums"
ON public.liked_albums
FOR SELECT
USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for lyrics table (missing)
CREATE POLICY "Song owners can update lyrics"
ON public.lyrics
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM songs
  WHERE songs.id = lyrics.song_id AND songs.user_id = auth.uid()
));

CREATE POLICY "Song owners can delete lyrics"
ON public.lyrics
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM songs
  WHERE songs.id = lyrics.song_id AND songs.user_id = auth.uid()
));