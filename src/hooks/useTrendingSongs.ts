import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "./useSongs";

export const useTrendingSongs = (limit = 10) => {
  return useQuery({
    queryKey: ["trending-songs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .order("play_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Song[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};

export const useFeaturedSongs = (limit = 6) => {
  return useQuery({
    queryKey: ["featured-songs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .order("play_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Song[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};

export const useFeaturedArtistsFromPlays = (limit = 8) => {
  return useQuery({
    queryKey: ["featured-artists-plays", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("artist, cover_url, play_count")
        .eq("is_public", true)
        .order("play_count", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Aggregate play counts by artist
      const artistMap = new Map<string, { name: string; cover: string | null; totalPlays: number }>();
      
      for (const song of data) {
        const existing = artistMap.get(song.artist);
        if (existing) {
          existing.totalPlays += song.play_count || 0;
          if (!existing.cover && song.cover_url) {
            existing.cover = song.cover_url;
          }
        } else {
          artistMap.set(song.artist, {
            name: song.artist,
            cover: song.cover_url,
            totalPlays: song.play_count || 0,
          });
        }
      }

      // Sort by total plays and return top artists
      return Array.from(artistMap.values())
        .sort((a, b) => b.totalPlays - a.totalPlays)
        .slice(0, limit);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};
