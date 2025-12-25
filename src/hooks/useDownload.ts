import { useState, useCallback } from "react";
import { Song } from "@/hooks/useSongs";
import { toast } from "@/hooks/use-toast";

interface DownloadProgress {
  songId: string;
  progress: number;
  status: "pending" | "downloading" | "complete" | "error";
}

// Simulated offline storage for demo purposes
const offlineSongs = new Map<string, Blob>();

export const useDownload = () => {
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(new Map());

  const downloadSong = useCallback(async (song: Song) => {
    const songId = song.id;
    
    setDownloads(prev => new Map(prev).set(songId, {
      songId,
      progress: 0,
      status: "downloading",
    }));

    try {
      const response = await fetch(song.file_url);
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get("content-length") || 0);
      
      if (!reader) throw new Error("No reader available");

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        const progress = contentLength ? (received / contentLength) * 100 : 50;
        setDownloads(prev => new Map(prev).set(songId, {
          songId,
          progress,
          status: "downloading",
        }));
      }

      const blob = new Blob(chunks as BlobPart[]);
      offlineSongs.set(songId, blob);

      setDownloads(prev => new Map(prev).set(songId, {
        songId,
        progress: 100,
        status: "complete",
      }));

      toast({
        title: "Downloaded",
        description: `${song.title} is now available offline`,
      });

    } catch (error) {
      console.error("Download error:", error);
      setDownloads(prev => new Map(prev).set(songId, {
        songId,
        progress: 0,
        status: "error",
      }));

      toast({
        title: "Download failed",
        description: "Could not download the song",
        variant: "destructive",
      });
    }
  }, []);

  const removeSong = useCallback((songId: string) => {
    offlineSongs.delete(songId);
    setDownloads(prev => {
      const next = new Map(prev);
      next.delete(songId);
      return next;
    });

    toast({
      title: "Removed",
      description: "Song removed from offline storage",
    });
  }, []);

  const isDownloaded = useCallback((songId: string) => {
    return offlineSongs.has(songId);
  }, []);

  const getOfflineSong = useCallback((songId: string) => {
    return offlineSongs.get(songId);
  }, []);

  const getDownloadProgress = useCallback((songId: string) => {
    return downloads.get(songId);
  }, [downloads]);

  return {
    downloadSong,
    removeSong,
    isDownloaded,
    getOfflineSong,
    getDownloadProgress,
    downloads: Array.from(downloads.values()),
  };
};
