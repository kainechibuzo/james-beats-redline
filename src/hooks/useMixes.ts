import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MixTrack {
  title: string;
  artist: string;
  startSeconds: number;
}

export interface Mix {
  id: string;
  user_id: string | null;
  title: string;
  artist: string | null;
  youtube_video_id: string;
  youtube_url: string;
  thumbnail: string | null;
  total_duration: string | null;
  tracks: MixTrack[];
  is_featured: boolean;
  is_public: boolean;
  play_count: number;
  created_at: string;
}

export const useMixes = () => {
  return useQuery({
    queryKey: ["mixes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mixes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Mix[];
    },
    staleTime: 60_000,
  });
};

export const useMix = (id: string | undefined) => {
  return useQuery({
    queryKey: ["mix", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("mixes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Mix | null;
    },
    enabled: !!id,
  });
};

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

export const formatMixTime = (secs: number) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};