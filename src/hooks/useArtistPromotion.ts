import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";

// Promote artist as featured
export const usePromoteArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artistName,
      bio,
      imageUrl,
      monthlyListeners,
      isVerified,
    }: {
      artistName: string;
      bio?: string;
      imageUrl?: string;
      monthlyListeners?: number;
      isVerified?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("featured_artists")
        .upsert(
          {
            artist_name: artistName,
            bio: bio || null,
            image_url: imageUrl || null,
            monthly_listeners: monthlyListeners || 0,
            is_verified: isVerified || false,
          },
          { onConflict: "artist_name" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-artists"] });
      toast.success("Artist promoted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to promote artist: " + error.message);
    },
  });
};

// Remove featured artist
export const useRemoveFeaturedArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      const { error } = await supabase
        .from("featured_artists")
        .delete()
        .eq("id", artistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-artists"] });
      toast.success("Artist removed from featured list");
    },
    onError: (error) => {
      toast.error("Failed to remove artist: " + error.message);
    },
  });
};

// Toggle album featured status
export const useToggleAlbumFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, isFeatured }: { albumId: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from("albums")
        .update({ is_featured: isFeatured })
        .eq("id", albumId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["featured-albums"] });
      toast.success(variables.isFeatured ? "Album featured!" : "Album unfeatured");
    },
  });
};
