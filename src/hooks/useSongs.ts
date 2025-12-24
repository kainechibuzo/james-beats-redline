import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  duration: number | null;
  file_url: string;
  cover_url: string | null;
  play_count: number;
  is_public: boolean;
  created_at: string;
}

export const useSongs = () => {
  return useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Song[];
    },
  });
};

export const useRecentlyPlayed = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recently-played", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("recently_played")
        .select(`
          id,
          played_at,
          song_id,
          songs (*)
        `)
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Deduplicate by song_id, keeping only the most recent play
      const seenSongIds = new Set<string>();
      const uniqueSongs = data
        .filter((item: any) => {
          if (seenSongIds.has(item.song_id)) return false;
          seenSongIds.add(item.song_id);
          return true;
        })
        .slice(0, 20);

      return uniqueSongs.map((item: any) => ({
        ...item.songs,
        played_at: item.played_at,
      })) as (Song & { played_at: string })[];
    },
    enabled: !!user,
  });
};

export const useTrackPlay = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!user) return;

      // Add to recently played
      const { error: recentError } = await supabase
        .from("recently_played")
        .insert({ user_id: user.id, song_id: songId });

      if (recentError) throw recentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recently-played"] });
    },
  });
};

export const useLikedSongs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["liked-songs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("liked_songs")
        .select(`
          id,
          created_at,
          songs (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((item: any) => ({
        ...item.songs,
        liked_at: item.created_at,
      })) as (Song & { liked_at: string })[];
    },
    enabled: !!user,
  });
};

export const useToggleLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, isLiked }: { songId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (isLiked) {
        const { error } = await supabase
          .from("liked_songs")
          .delete()
          .eq("user_id", user.id)
          .eq("song_id", songId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("liked_songs")
          .insert({ user_id: user.id, song_id: songId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-songs"] });
    },
  });
};

export const useIsLiked = (songId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-liked", songId, user?.id],
    queryFn: async () => {
      if (!user || !songId) return false;

      const { data, error } = await supabase
        .from("liked_songs")
        .select("id")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!songId,
  });
};
