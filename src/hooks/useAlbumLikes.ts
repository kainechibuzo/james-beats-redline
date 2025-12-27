import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useLikedAlbums = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["liked-albums", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("liked_albums")
        .select("album_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((item) => item.album_id);
    },
    enabled: !!user,
  });
};

export const useIsAlbumLiked = (albumId: string) => {
  const { data: likedAlbums } = useLikedAlbums();
  return likedAlbums?.includes(albumId) ?? false;
};

export const useLikeAlbum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("liked_albums")
        .insert({ user_id: user.id, album_id: albumId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-albums"] });
      toast.success("Album added to your library!");
    },
    onError: (error) => {
      toast.error("Failed to like album: " + error.message);
    },
  });
};

export const useUnlikeAlbum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("liked_albums")
        .delete()
        .eq("user_id", user.id)
        .eq("album_id", albumId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-albums"] });
      toast.success("Album removed from your library");
    },
    onError: (error) => {
      toast.error("Failed to unlike album: " + error.message);
    },
  });
};

export const useToggleAlbumLike = () => {
  const likeAlbum = useLikeAlbum();
  const unlikeAlbum = useUnlikeAlbum();
  const { data: likedAlbums } = useLikedAlbums();

  return {
    toggle: (albumId: string) => {
      const isLiked = likedAlbums?.includes(albumId);
      if (isLiked) {
        unlikeAlbum.mutate(albumId);
      } else {
        likeAlbum.mutate(albumId);
      }
    },
    isPending: likeAlbum.isPending || unlikeAlbum.isPending,
  };
};
