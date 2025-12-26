import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "./useSongs";

// 21. Radio Mode (infinite play from seed)
export const useRadioMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [seedSong, setSeedSong] = useState<Song | null>(null);
  const [seedGenre, setSeedGenre] = useState<string | null>(null);

  const startRadio = useCallback((song?: Song, genre?: string) => {
    if (song) setSeedSong(song);
    if (genre) setSeedGenre(genre);
    setIsActive(true);
  }, []);

  const stopRadio = useCallback(() => {
    setIsActive(false);
    setSeedSong(null);
    setSeedGenre(null);
  }, []);

  return { isActive, seedSong, seedGenre, startRadio, stopRadio };
};

// 22. Mood-based playlists
export const MOODS = [
  { id: "happy", label: "Happy", emoji: "😊", colors: ["#FFD700", "#FFA500"] },
  { id: "sad", label: "Sad", emoji: "😢", colors: ["#4169E1", "#483D8B"] },
  { id: "energetic", label: "Energetic", emoji: "⚡", colors: ["#FF4500", "#FF6347"] },
  { id: "calm", label: "Calm", emoji: "🧘", colors: ["#32CD32", "#228B22"] },
  { id: "romantic", label: "Romantic", emoji: "💕", colors: ["#FF69B4", "#FF1493"] },
  { id: "focused", label: "Focused", emoji: "🎯", colors: ["#00CED1", "#20B2AA"] },
  { id: "party", label: "Party", emoji: "🎉", colors: ["#9400D3", "#8B008B"] },
  { id: "chill", label: "Chill", emoji: "😎", colors: ["#87CEEB", "#4682B4"] },
] as const;

export type MoodId = typeof MOODS[number]["id"];

export const useMoodPlaylists = () => {
  const [currentMood, setCurrentMood] = useState<MoodId | null>(null);

  return useQuery({
    queryKey: ["mood-songs", currentMood],
    queryFn: async () => {
      if (!currentMood) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .limit(50);

      if (error) throw error;
      return { mood: currentMood, songs: data };
    },
    enabled: !!currentMood,
  });
};

// 23. Similar Artists
export const useSimilarArtists = (artistName: string) => {
  return useQuery({
    queryKey: ["similar-artists", artistName],
    queryFn: async () => {
      // Get songs by artists with similar genres
      const { data: artistSongs, error: artistError } = await supabase
        .from("songs")
        .select("genre")
        .eq("artist", artistName)
        .limit(1);

      if (artistError) throw artistError;

      const genre = artistSongs?.[0]?.genre;
      if (!genre) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("artist, genre, cover_url")
        .eq("genre", genre)
        .neq("artist", artistName)
        .eq("is_public", true);

      if (error) throw error;

      // Get unique artists
      const uniqueArtists = Array.from(
        new Map(data.map(s => [s.artist, s])).values()
      );

      return uniqueArtists.slice(0, 10);
    },
    enabled: !!artistName,
  });
};

// 24. New Releases
export const useNewReleases = (days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return useQuery({
    queryKey: ["new-releases", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .gte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
};

// 25. Trending Songs
export const useTrendingSongs = () => {
  return useQuery({
    queryKey: ["trending-songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .order("play_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });
};

// 26. For You (personalized recommendations)
export const useForYou = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["for-you", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's liked songs genres
      const { data: liked, error: likedError } = await supabase
        .from("liked_songs")
        .select("songs (genre)")
        .eq("user_id", user.id);

      if (likedError) throw likedError;

      const genres = liked
        .map((l: any) => l.songs?.genre)
        .filter(Boolean);

      const topGenre = genres.length > 0 
        ? genres.sort((a: string, b: string) =>
            genres.filter((v: string) => v === a).length -
            genres.filter((v: string) => v === b).length
          ).pop()
        : null;

      const query = supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .limit(30);

      if (topGenre) {
        query.eq("genre", topGenre);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// 27. Genre Explorer
export const useGenreExplorer = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("genre")
        .eq("is_public", true);

      if (error) throw error;

      const genreCounts: Record<string, number> = {};
      data.forEach(s => {
        if (s.genre) {
          genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
        }
      });

      return Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count);
    },
  });
};

// 28. Search History
export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  const addSearch = useCallback((query: string) => {
    setHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 10));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(q => q !== query));
  }, []);

  return { history, addSearch, clearHistory, removeFromHistory };
};

// 29. Browse by Decade
export const DECADES = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s"] as const;

export const useDecadePlaylists = (decade: typeof DECADES[number]) => {
  return useQuery({
    queryKey: ["decade-songs", decade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
};

// 30. Artist Radio
export const useArtistRadio = (artistName: string) => {
  return useQuery({
    queryKey: ["artist-radio", artistName],
    queryFn: async () => {
      // Get songs by artist
      const { data: artistSongs, error: artistError } = await supabase
        .from("songs")
        .select("*")
        .eq("artist", artistName)
        .eq("is_public", true);

      if (artistError) throw artistError;

      // Get similar songs by genre
      const genre = artistSongs?.[0]?.genre;
      
      let similarSongs: any[] = [];
      if (genre) {
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .eq("genre", genre)
          .neq("artist", artistName)
          .eq("is_public", true)
          .limit(20);

        if (!error) similarSongs = data || [];
      }

      // Mix them
      const mixed = [...(artistSongs || [])];
      similarSongs.forEach((s, i) => {
        const pos = Math.min(Math.floor(Math.random() * mixed.length), mixed.length);
        mixed.splice(pos, 0, s);
      });

      return mixed;
    },
    enabled: !!artistName,
  });
};
