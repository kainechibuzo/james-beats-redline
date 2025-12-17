import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadSongData {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  audioFile: File;
  coverFile?: File;
  isPublic?: boolean;
}

export const useUploadSong = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  return useMutation({
    mutationFn: async (data: UploadSongData) => {
      if (!user) throw new Error("Must be logged in to upload");

      setUploadProgress(10);

      // Upload audio file
      const audioFileName = `${user.id}/${Date.now()}-${data.audioFile.name}`;
      const { error: audioError } = await supabase.storage
        .from("songs")
        .upload(audioFileName, data.audioFile);

      if (audioError) throw audioError;

      setUploadProgress(50);

      const { data: audioUrl } = supabase.storage
        .from("songs")
        .getPublicUrl(audioFileName);

      let coverUrl: string | null = null;

      // Upload cover if provided
      if (data.coverFile) {
        const coverFileName = `${user.id}/${Date.now()}-${data.coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverFileName, data.coverFile);

        if (coverError) throw coverError;

        const { data: coverData } = supabase.storage
          .from("covers")
          .getPublicUrl(coverFileName);
        coverUrl = coverData.publicUrl;
      }

      setUploadProgress(80);

      // Get audio duration
      const duration = await getAudioDuration(data.audioFile);

      // Insert song record
      const { data: song, error: songError } = await supabase
        .from("songs")
        .insert({
          title: data.title,
          artist: data.artist,
          album: data.album || null,
          genre: data.genre || null,
          file_url: audioUrl.publicUrl,
          cover_url: coverUrl,
          user_id: user.id,
          duration: Math.round(duration),
          is_public: data.isPublic ?? true,
        })
        .select()
        .single();

      if (songError) throw songError;

      setUploadProgress(100);
      return song;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["user-songs"] });
      setUploadProgress(0);
      toast.success("Song uploaded successfully!");
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast.error(error.message || "Failed to upload song");
    },
  });
};

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      resolve(0);
    });
    audio.src = URL.createObjectURL(file);
  });
};

export const useUserSongs = () => {
  const { user } = useAuth();

  return {
    queryKey: ["user-songs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  };
};
