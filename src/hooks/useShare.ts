import { useCallback } from "react";
import { Song } from "@/hooks/useSongs";
import { toast } from "@/hooks/use-toast";

export const useShare = () => {
  const shareSong = useCallback(async (song: Song) => {
    const shareUrl = `${window.location.origin}/song/${song.id}`;
    const shareData = {
      title: song.title,
      text: `Listen to ${song.title} by ${song.artist}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Song shared successfully",
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Song link copied to clipboard",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
        toast({
          title: "Share failed",
          description: "Could not share the song",
          variant: "destructive",
        });
      }
    }
  }, []);

  const sharePlaylist = useCallback(async (playlistId: string, playlistName: string) => {
    const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
    const shareData = {
      title: playlistName,
      text: `Check out this playlist: ${playlistName}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Playlist shared successfully",
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Playlist link copied to clipboard",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  }, []);

  const shareArtist = useCallback(async (artistName: string) => {
    const shareUrl = `${window.location.origin}/artist/${encodeURIComponent(artistName)}`;
    const shareData = {
      title: artistName,
      text: `Check out ${artistName} on James Beats`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Artist link copied to clipboard",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  }, []);

  return {
    shareSong,
    sharePlaylist,
    shareArtist,
  };
};
