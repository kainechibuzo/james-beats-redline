import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "./useSongs";

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Song[];
}

export const usePlaylists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!user,
  });
};

export const usePlaylist = (playlistId: string) => {
  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      const { data: playlist, error: playlistError } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", playlistId)
        .single();

      if (playlistError) throw playlistError;

      const { data: playlistSongs, error: songsError } = await supabase
        .from("playlist_songs")
        .select("song_id, position, songs(*)")
        .eq("playlist_id", playlistId)
        .order("position");

      if (songsError) throw songsError;

      const songs = playlistSongs
        ?.map((ps) => ps.songs)
        .filter(Boolean) as Song[];

      return { ...playlist, songs } as PlaylistWithSongs;
    },
    enabled: !!playlistId,
  });
};

export const useCreatePlaylist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      songIds,
    }: {
      name: string;
      description?: string;
      songIds?: string[];
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: playlist, error: playlistError } = await supabase
        .from("playlists")
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: false,
        })
        .select()
        .single();

      if (playlistError) throw playlistError;

      if (songIds && songIds.length > 0) {
        const playlistSongs = songIds.map((songId, index) => ({
          playlist_id: playlist.id,
          song_id: songId,
          position: index,
        }));

        await supabase.from("playlist_songs").insert(playlistSongs);
      }

      return playlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: {
      playlistId: string;
      songId: string;
    }) => {
      // Get current max position
      const { data: existing } = await supabase
        .from("playlist_songs")
        .select("position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position ?? -1;

      const { error } = await supabase.from("playlist_songs").insert({
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition + 1,
      });

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
};

export const useRemoveFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: {
      playlistId: string;
      songId: string;
    }) => {
      const { error } = await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("song_id", songId);

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};
