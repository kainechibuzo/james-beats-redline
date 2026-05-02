import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlaylistFolder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export const usePlaylistFolders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["playlist-folders", user?.id],
    queryFn: async () => {
      if (!user) return [] as PlaylistFolder[];
      const { data, error } = await supabase
        .from("playlist_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as PlaylistFolder[];
    },
    enabled: !!user,
  });
};

export const useCreatePlaylistFolder = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase
        .from("playlist_folders")
        .insert({ user_id: user.id, name: name.trim() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlist-folders"] }),
  });
};

export const useDeletePlaylistFolder = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Sign in required");
      // Detach playlists from this folder first
      await supabase.from("playlists").update({ folder_id: null }).eq("folder_id", id);
      await supabase.from("playlist_folders").delete().eq("id", id).eq("user_id", user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-folders"] });
      qc.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

export const useMovePlaylistToFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ playlistId, folderId }: { playlistId: string; folderId: string | null }) => {
      const { error } = await supabase
        .from("playlists")
        .update({ folder_id: folderId })
        .eq("id", playlistId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
};
