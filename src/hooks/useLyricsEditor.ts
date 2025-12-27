import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LyricLine } from "./useLyrics";

export const useCreateLyrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      songId,
      content,
      synced,
      behindTheLyrics,
      language = "en",
    }: {
      songId: string;
      content: LyricLine[];
      synced: boolean;
      behindTheLyrics?: string;
      language?: string;
    }) => {
      const { data, error } = await supabase
        .from("lyrics")
        .insert({
          song_id: songId,
          content: content as unknown as any,
          synced,
          behind_the_lyrics: behindTheLyrics,
          language,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["lyrics", songId] });
      toast.success("Lyrics added!");
    },
    onError: (error) => {
      toast.error("Failed to add lyrics: " + error.message);
    },
  });
};

export const useUpdateLyrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lyricsId,
      songId,
      content,
      synced,
      behindTheLyrics,
      language,
    }: {
      lyricsId: string;
      songId: string;
      content: LyricLine[];
      synced: boolean;
      behindTheLyrics?: string;
      language?: string;
    }) => {
      const { data, error } = await supabase
        .from("lyrics")
        .update({
          content: content as unknown as any,
          synced,
          behind_the_lyrics: behindTheLyrics,
          language,
        })
        .eq("id", lyricsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["lyrics", songId] });
      toast.success("Lyrics updated!");
    },
    onError: (error) => {
      toast.error("Failed to update lyrics: " + error.message);
    },
  });
};

export const useDeleteLyrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lyricsId, songId }: { lyricsId: string; songId: string }) => {
      const { error } = await supabase.from("lyrics").delete().eq("id", lyricsId);
      if (error) throw error;
    },
    onSuccess: (_, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["lyrics", songId] });
      toast.success("Lyrics deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete lyrics: " + error.message);
    },
  });
};
