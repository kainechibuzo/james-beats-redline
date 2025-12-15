import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "./useSongs";

export interface GeneratedPlaylist {
  id: string;
  user_id: string;
  type: "discover_weekly" | "release_radar" | "daily_mix" | "daylist" | "ai_generated" | "blend" | "wrapped";
  name: string;
  description: string | null;
  cover_url: string | null;
  songs: string[];
  metadata: { commentary?: string } | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useGeneratedPlaylists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["generated-playlists", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("generated_playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as GeneratedPlaylist[];
    },
    enabled: !!user,
  });
};

export const useGeneratedPlaylist = (type: GeneratedPlaylist["type"]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["generated-playlist", type, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("generated_playlists")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type)
        .maybeSingle();

      if (error) throw error;
      return data as GeneratedPlaylist | null;
    },
    enabled: !!user,
  });
};

export const usePlaylistSongs = (songIds: string[]) => {
  return useQuery({
    queryKey: ["playlist-songs", songIds],
    queryFn: async () => {
      if (!songIds || songIds.length === 0) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .in("id", songIds);

      if (error) throw error;
      
      // Maintain order
      const songMap = new Map(data.map(s => [s.id, s]));
      return songIds.map(id => songMap.get(id)).filter(Boolean) as Song[];
    },
    enabled: songIds.length > 0,
  });
};

export const useGeneratePlaylist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, mood }: { type: GeneratedPlaylist["type"]; mood?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-playlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ type, userId: user.id, mood }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate playlist");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-playlists"] });
      queryClient.invalidateQueries({ queryKey: ["generated-playlist"] });
    },
  });
};

export const useUserStats = (year?: number) => {
  const { user } = useAuth();
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ["user-stats", user?.id, currentYear],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useGenerateWrapped = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: number) => {
      if (!user) throw new Error("Must be logged in");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-wrapped`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ userId: user.id, year }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate wrapped");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });
};
