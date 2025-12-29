import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "@/hooks/useSongs";

interface TrackingState {
  songId: string;
  startTime: number;
  listenedSeconds: number;
  isTracked: boolean;
}

export const useListeningTracker = (
  currentSong: Song | null,
  currentTime: number,
  duration: number,
  isPlaying: boolean
) => {
  const { user } = useAuth();
  const trackingRef = useRef<TrackingState | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 30 seconds OR 50% of track duration threshold
  const getThreshold = useCallback((songDuration: number) => {
    return Math.min(30, songDuration * 0.5);
  }, []);

  // Track listening time accurately
  useEffect(() => {
    if (!currentSong || !isPlaying) return;

    // Initialize tracking for new song
    if (!trackingRef.current || trackingRef.current.songId !== currentSong.id) {
      trackingRef.current = {
        songId: currentSong.id,
        startTime: Date.now(),
        listenedSeconds: 0,
        isTracked: false,
      };
      lastTimeRef.current = currentTime;
      return;
    }

    // Calculate actual listened time (not just currentTime which can be seeked)
    const timeDelta = currentTime - lastTimeRef.current;
    
    // Only count positive time changes less than 2 seconds (normal playback)
    if (timeDelta > 0 && timeDelta < 2) {
      trackingRef.current.listenedSeconds += timeDelta;
    }
    lastTimeRef.current = currentTime;

    // Check if we've hit the threshold
    const threshold = getThreshold(duration);
    if (!trackingRef.current.isTracked && trackingRef.current.listenedSeconds >= threshold) {
      trackingRef.current.isTracked = true;
      recordListen(currentSong.id);
    }
  }, [currentSong, currentTime, duration, isPlaying, getThreshold]);

  // Reset tracking when song changes
  useEffect(() => {
    if (currentSong && trackingRef.current?.songId !== currentSong.id) {
      trackingRef.current = {
        songId: currentSong.id,
        startTime: Date.now(),
        listenedSeconds: 0,
        isTracked: false,
      };
      lastTimeRef.current = 0;
    }
  }, [currentSong?.id]);

  const recordListen = async (songId: string) => {
    if (!user) return;

    try {
      // Record in recently_played with accurate timestamp
      await supabase.from("recently_played").insert({
        user_id: user.id,
        song_id: songId,
        played_at: new Date().toISOString(),
      });

      // Increment play_count on the song
      const { data: song } = await supabase
        .from("songs")
        .select("play_count, user_id")
        .eq("id", songId)
        .single();

      if (song) {
        await supabase
          .from("songs")
          .update({ play_count: (song.play_count || 0) + 1 })
          .eq("id", songId);

        // Increment total_plays on the song owner's profile
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("total_plays")
          .eq("user_id", song.user_id)
          .single();

        if (ownerProfile) {
          await supabase
            .from("profiles")
            .update({ total_plays: (ownerProfile.total_plays || 0) + 1 })
            .eq("user_id", song.user_id);
        }
      }

      console.log("Listen recorded for song:", songId);
    } catch (error) {
      console.error("Error recording listen:", error);
    }
  };

  return {
    listenedSeconds: trackingRef.current?.listenedSeconds || 0,
    isTracked: trackingRef.current?.isTracked || false,
    threshold: duration ? getThreshold(duration) : 30,
  };
};

export default useListeningTracker;
