-- Add UPDATE policy for playlist_songs to allow reordering
CREATE POLICY "Users can update playlist song positions"
ON public.playlist_songs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);