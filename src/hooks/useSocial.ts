import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Song } from "./useSongs";

export interface ListeningActivity {
  id: string;
  user_id: string;
  song_id: string;
  started_at: string;
  is_active: boolean;
  song?: Song;
  profile?: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
}

export interface JamSession {
  id: string;
  host_id: string;
  name: string;
  invite_code: string;
  current_song_id: string | null;
  current_position: number;
  is_playing: boolean;
  participants: { id: string; name: string }[];
  queue: string[];
  created_at: string;
}

export interface Blend {
  id: string;
  name: string;
  participants: { id: string; name: string }[];
  songs: string[];
  taste_match_score: number | null;
  created_at: string;
}

// Friend Activity Feed
export const useFriendActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ListeningActivity[]>([]);

  useQuery({
    queryKey: ["friend-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: following } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!following?.length) return [];

      const friendIds = following.map(f => f.following_id);

      const { data, error } = await supabase
        .from("listening_activity")
        .select(`*, songs (*)`)
        .in("user_id", friendIds)
        .eq("is_active", true)
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formatted = (data || []).map((item: any) => ({
        ...item,
        song: item.songs,
      })) as ListeningActivity[];
      
      setActivities(formatted);
      return formatted;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("friend-activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listening_activity" },
        () => {
          supabase
            .from("listening_activity")
            .select(`*, songs (*)`)
            .eq("is_active", true)
            .order("started_at", { ascending: false })
            .limit(20)
            .then(({ data }) => {
              if (data) {
                setActivities((data as any[]).map(item => ({
                  ...item,
                })) as ListeningActivity[]);
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { activities };
};

// Jam Sessions
export const useJamSession = (sessionId?: string) => {
  const [session, setSession] = useState<JamSession | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    supabase
      .from("jam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()
      .then(({ data }) => setSession(data as unknown as JamSession));

    const channel = supabase
      .channel(`jam-session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jam_sessions", filter: `id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setSession(null);
          } else {
            setSession(payload.new as unknown as JamSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session };
};

export const useCreateJamSession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Must be logged in");

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from("jam_sessions")
        .insert({
          host_id: user.id,
          name,
          invite_code: inviteCode,
          participants: [{ id: user.id, name: "Host" }],
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as JamSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jam-sessions"] });
    },
  });
};

export const useJoinJamSession = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ inviteCode, displayName }: { inviteCode: string; displayName: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: session, error: fetchError } = await supabase
        .from("jam_sessions")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (fetchError || !session) throw new Error("Session not found");

      const participants = [...(session.participants as any[]), { id: user.id, name: displayName }];

      const { data, error } = await supabase
        .from("jam_sessions")
        .update({ participants })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as JamSession;
    },
  });
};

export const usePlaylistCollaborators = (playlistId: string) => {
  return useQuery({
    queryKey: ["playlist-collaborators", playlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlist_collaborators")
        .select(`
          *,
          profiles!playlist_collaborators_user_id_fkey (display_name, username, avatar_url)
        `)
        .eq("playlist_id", playlistId);

      if (error) throw error;
      return data;
    },
    enabled: !!playlistId,
  });
};

export const useAddCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, userId }: { playlistId: string; userId: string }) => {
      const { error } = await supabase
        .from("playlist_collaborators")
        .insert({ playlist_id: playlistId, user_id: userId });

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist-collaborators", playlistId] });
    },
  });
};

// Blends
export const useBlends = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["blends", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("blends")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const blends = (data as unknown as Blend[]);
      return blends.filter(blend => 
        Array.isArray(blend.participants) && blend.participants.some(p => p.id === user.id)
      );
    },
    enabled: !!user,
  });
};

export const useCreateBlend = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId, friendName }: { friendId: string; friendName: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("blends")
        .insert({
          name: `${profile?.display_name || "You"} + ${friendName} Blend`,
          participants: [
            { id: user.id, name: profile?.display_name || "You" },
            { id: friendId, name: friendName },
          ],
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Blend;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blends"] });
    },
  });
};
