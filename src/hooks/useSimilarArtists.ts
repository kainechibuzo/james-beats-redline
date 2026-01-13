import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSimilarArtists = (artistName: string, genre?: string) => {
  return useQuery({
    queryKey: ["similar-artists", artistName, genre],
    queryFn: async () => {
      // Get artists with similar genres or high play counts
      let query = supabase
        .from("songs")
        .select("artist, genre, play_count, cover_url")
        .eq("is_public", true)
        .neq("artist", artistName);

      if (genre) {
        query = query.eq("genre", genre);
      }

      const { data, error } = await query.order("play_count", { ascending: false }).limit(50);

      if (error) throw error;

      // Group by artist and aggregate
      const artistMap = new Map<string, { 
        artist: string; 
        totalPlays: number; 
        coverUrl: string | null;
        songCount: number;
      }>();

      data?.forEach((song) => {
        const existing = artistMap.get(song.artist);
        if (existing) {
          existing.totalPlays += song.play_count;
          existing.songCount += 1;
          if (!existing.coverUrl && song.cover_url) {
            existing.coverUrl = song.cover_url;
          }
        } else {
          artistMap.set(song.artist, {
            artist: song.artist,
            totalPlays: song.play_count,
            coverUrl: song.cover_url,
            songCount: 1,
          });
        }
      });

      // Sort by total plays and return top 6
      return Array.from(artistMap.values())
        .sort((a, b) => b.totalPlays - a.totalPlays)
        .slice(0, 6);
    },
    enabled: !!artistName,
  });
};

export const useArtistDiscography = (artistName: string) => {
  return useQuery({
    queryKey: ["artist-discography", artistName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("is_public", true)
        .ilike("artist", artistName)
        .order("release_year", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!artistName,
  });
};
