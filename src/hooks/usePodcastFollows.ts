import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFollowedPodcasts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followed-podcasts", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data, error } = await supabase
        .from("followed_podcasts")
        .select("podcast_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return new Set((data || []).map((r) => r.podcast_id));
    },
    enabled: !!user,
  });
};

export const useTogglePodcastFollow = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ podcastId, isFollowed }: { podcastId: string; isFollowed: boolean }) => {
      if (!user) throw new Error("Sign in required");
      if (isFollowed) {
        await supabase
          .from("followed_podcasts")
          .delete()
          .eq("user_id", user.id)
          .eq("podcast_id", podcastId);
      } else {
        await supabase
          .from("followed_podcasts")
          .insert({ user_id: user.id, podcast_id: podcastId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followed-podcasts"] });
      qc.invalidateQueries({ queryKey: ["followed-podcast-feed"] });
    },
  });
};

export const useFollowedPodcastFeed = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followed-podcast-feed", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: follows } = await supabase
        .from("followed_podcasts")
        .select("podcast_id")
        .eq("user_id", user.id);
      const ids = (follows || []).map((f) => f.podcast_id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("podcast_episodes")
        .select("*, podcast:podcasts(title, cover_url)")
        .in("podcast_id", ids)
        .order("published_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
