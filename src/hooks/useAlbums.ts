import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Album {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  description?: string;
  cover_url?: string;
  release_year?: number;
  genre?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useAlbums = () => {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Album[];
    },
  });
};

export const useFeaturedAlbums = () => {
  return useQuery({
    queryKey: ["featured-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("is_public", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Album[];
    },
  });
};

export const useMyAlbums = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-albums", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Album[];
    },
    enabled: !!user,
  });
};

export const useAlbum = (albumId: string) => {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (error) throw error;
      return data as Album;
    },
    enabled: !!albumId,
  });
};

export const useAlbumSongs = (albumId: string) => {
  return useQuery({
    queryKey: ["album-songs", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("album_id", albumId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!albumId,
  });
};

export const useCreateAlbum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (album: Omit<Album, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("albums")
        .insert({ ...album, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["my-albums"] });
      toast.success("Album created!");
    },
    onError: (error) => {
      toast.error("Failed to create album: " + error.message);
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Album> & { id: string }) => {
      const { data, error } = await supabase
        .from("albums")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Album;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["album", data.id] });
      toast.success("Album updated!");
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: string) => {
      const { error } = await supabase.from("albums").delete().eq("id", albumId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["my-albums"] });
      toast.success("Album deleted!");
    },
  });
};