import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ListeningStats {
  totalMinutes: number;
  totalSongs: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  listeningStreak: number;
  averageSessionLength: number;
}

export const useListeningStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["listening-stats", user?.id],
    queryFn: async (): Promise<ListeningStats> => {
      if (!user) {
        return {
          totalMinutes: 0,
          totalSongs: 0,
          topGenres: [],
          topArtists: [],
          listeningStreak: 0,
          averageSessionLength: 0,
        };
      }

      const { data: recentPlays, error } = await supabase
        .from("recently_played")
        .select(`
          played_at,
          songs (
            title,
            artist,
            genre,
            duration
          )
        `)
        .eq("user_id", user.id)
        .order("played_at", { ascending: false });

      if (error) throw error;

      // Calculate stats
      let totalDuration = 0;
      const artistCounts: Record<string, number> = {};
      const genreCounts: Record<string, number> = {};

      (recentPlays || []).forEach((play: any) => {
        if (play.songs) {
          totalDuration += play.songs.duration || 0;
          
          if (play.songs.artist) {
            artistCounts[play.songs.artist] = (artistCounts[play.songs.artist] || 0) + 1;
          }
          if (play.songs.genre) {
            genreCounts[play.songs.genre] = (genreCounts[play.songs.genre] || 0) + 1;
          }
        }
      });

      const topArtists = Object.entries(artistCounts)
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate streak (days with listening activity)
      const playDates = new Set(
        (recentPlays || []).map((p: any) => 
          new Date(p.played_at).toDateString()
        )
      );
      
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        if (playDates.has(date.toDateString())) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      return {
        totalMinutes: Math.round(totalDuration / 60),
        totalSongs: recentPlays?.length || 0,
        topGenres,
        topArtists,
        listeningStreak: streak,
        averageSessionLength: recentPlays?.length 
          ? Math.round(totalDuration / recentPlays.length / 60) 
          : 0,
      };
    },
    enabled: !!user,
  });
};

export const useTopTracks = (timeRange: "week" | "month" | "all" = "month") => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["top-tracks", user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];

      let startDate: Date | null = null;
      if (timeRange === "week") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      }

      let query = supabase
        .from("recently_played")
        .select(`
          song_id,
          songs (*)
        `)
        .eq("user_id", user.id);

      if (startDate) {
        query = query.gte("played_at", startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Count plays per song
      const songCounts: Record<string, { song: any; count: number }> = {};
      (data || []).forEach((play: any) => {
        if (play.songs) {
          if (!songCounts[play.song_id]) {
            songCounts[play.song_id] = { song: play.songs, count: 0 };
          }
          songCounts[play.song_id].count++;
        }
      });

      return Object.values(songCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(({ song, count }) => ({ ...song, playCount: count }));
    },
    enabled: !!user,
  });
};

export const useListeningHistory = (date: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["listening-history", user?.id, date.toDateString()],
    queryFn: async () => {
      if (!user) return [];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("recently_played")
        .select(`
          played_at,
          songs (*)
        `)
        .eq("user_id", user.id)
        .gte("played_at", startOfDay.toISOString())
        .lte("played_at", endOfDay.toISOString())
        .order("played_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((play: any) => ({
        ...play.songs,
        playedAt: play.played_at,
      }));
    },
    enabled: !!user,
  });
};
