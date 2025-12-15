-- RLS Policies for generated_playlists
CREATE POLICY "Users can view own generated playlists" ON public.generated_playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create generated playlists" ON public.generated_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own generated playlists" ON public.generated_playlists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lyrics (public read)
CREATE POLICY "Lyrics are publicly viewable" ON public.lyrics FOR SELECT USING (true);
CREATE POLICY "Song owners can add lyrics" ON public.lyrics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.songs WHERE id = song_id AND user_id = auth.uid())
);

-- RLS Policies for playlist_collaborators
CREATE POLICY "View collaborators for accessible playlists" ON public.playlist_collaborators FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "Playlist owners can add collaborators" ON public.playlist_collaborators FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
);
CREATE POLICY "Collaborators can leave" ON public.playlist_collaborators FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- RLS Policies for jam_sessions
CREATE POLICY "Public jam sessions are viewable" ON public.jam_sessions FOR SELECT USING (true);
CREATE POLICY "Users can create jam sessions" ON public.jam_sessions FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update jam sessions" ON public.jam_sessions FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete jam sessions" ON public.jam_sessions FOR DELETE USING (auth.uid() = host_id);