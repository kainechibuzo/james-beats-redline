import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Lyrics {
  id: string;
  song_id: string;
  content: LyricLine[];
  synced: boolean;
  behind_the_lyrics: string | null;
  language: string;
}

export const useLyrics = (songId: string | undefined) => {
  return useQuery({
    queryKey: ["lyrics", songId],
    queryFn: async () => {
      if (!songId) return null;

      const { data, error } = await supabase
        .from("lyrics")
        .select("*")
        .eq("song_id", songId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          content: (Array.isArray(data.content) ? data.content : []) as LyricLine[],
        } as Lyrics;
      }
      
      return null;
    },
    enabled: !!songId,
  });
};

export const getCurrentLyricLine = (lyrics: LyricLine[], currentTime: number): number => {
  if (!lyrics.length) return -1;
  
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  
  return -1;
};
