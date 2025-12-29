import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { Song, useTrackPlay } from "@/hooks/useSongs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  playingFrom: "queue" | "playlist" | null;
  playlistName: string | null;
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], playlistName?: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCrossfadeEnabled: (enabled: boolean) => void;
  setCrossfadeDuration: (duration: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const trackPlay = useTrackPlay();
  
  // Two audio elements for crossfade
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [crossfadeEnabled, setCrossfadeEnabledState] = useState(true);
  const [crossfadeDuration, setCrossfadeDurationState] = useState(5); // seconds
  const [playingFrom, setPlayingFrom] = useState<"queue" | "playlist" | null>(null);
  const [playlistName, setPlaylistName] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    audioRef.current = new Audio();
    nextAudioRef.current = new Audio();
    audioRef.current.volume = volume;
    nextAudioRef.current.volume = 0;
    
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", handleSongEnd);
    audioRef.current.addEventListener("error", handleError);

    return () => {
      if (crossfadeIntervalRef.current) {
        clearInterval(crossfadeIntervalRef.current);
      }
      audioRef.current?.pause();
      nextAudioRef.current?.pause();
      audioRef.current = null;
      nextAudioRef.current = null;
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || isCrossfading) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);
    
    // Check if we should start crossfade
    const dur = audioRef.current.duration;
    if (crossfadeEnabled && dur && time >= dur - crossfadeDuration && !isCrossfading) {
      startCrossfade();
    }
  }, [crossfadeEnabled, crossfadeDuration, isCrossfading]);

  const handleLoadedMetadata = useCallback(() => {
    setDuration(audioRef.current?.duration || 0);
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error("Audio error:", e);
    setIsPlaying(false);
  }, []);

  // Re-attach timeupdate listener when crossfade settings change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [handleTimeUpdate]);

  const getNextIndex = useCallback(() => {
    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }
    if (nextIndex >= queue.length) {
      if (repeat === "all") return 0;
      return -1;
    }
    return nextIndex;
  }, [queueIndex, queue.length, shuffle, repeat]);

  const startCrossfade = useCallback(() => {
    if (isCrossfading || !audioRef.current || !nextAudioRef.current) return;
    
    const nextIndex = getNextIndex();
    if (nextIndex === -1 || repeat === "one") return;
    
    const nextSong = queue[nextIndex];
    if (!nextSong) return;
    
    setIsCrossfading(true);
    
    // Preload next song
    nextAudioRef.current.src = nextSong.file_url;
    nextAudioRef.current.volume = 0;
    nextAudioRef.current.play().catch(console.error);
    
    const fadeSteps = 50;
    const stepDuration = (crossfadeDuration * 1000) / fadeSteps;
    let step = 0;
    
    crossfadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / fadeSteps;
      
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, volume * (1 - progress));
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.volume = Math.min(volume, volume * progress);
      }
      
      if (step >= fadeSteps) {
        completeCrossfade(nextSong, nextIndex);
      }
    }, stepDuration);
  }, [isCrossfading, getNextIndex, queue, volume, crossfadeDuration, repeat]);

  const completeCrossfade = useCallback((nextSong: Song, nextIndex: number) => {
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    
    // Swap audio elements
    audioRef.current?.pause();
    const temp = audioRef.current;
    audioRef.current = nextAudioRef.current;
    nextAudioRef.current = temp;
    
    // Reset the old (now next) audio element
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
      nextAudioRef.current.src = "";
      nextAudioRef.current.volume = 0;
    }
    
    // Ensure current audio is at correct volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      // Re-attach event listeners
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", handleSongEnd);
      audioRef.current.addEventListener("error", handleError);
    }
    
    setCurrentSong(nextSong);
    setQueueIndex(nextIndex);
    setDuration(audioRef.current?.duration || 0);
    setIsCrossfading(false);
    
    // Track play
    trackPlay.mutate(nextSong.id);
    updateListeningActivity(nextSong);
  }, [volume, handleTimeUpdate, handleLoadedMetadata, handleError, trackPlay]);

  const handleSongEnd = useCallback(() => {
    if (isCrossfading) return; // Already handled by crossfade
    
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (queueIndex < queue.length - 1) {
      next();
    } else if (repeat === "all" && queue.length > 0) {
      setQueueIndex(0);
      playSongInternal(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, queue, queueIndex, isCrossfading]);

  const updateListeningActivity = useCallback(async (song: Song) => {
    if (!user) return;
    
    await supabase
      .from("listening_activity")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);
    
    await supabase.from("listening_activity").insert({
      user_id: user.id,
      song_id: song.id,
      is_active: true,
    });
  }, [user]);

  const playSongInternal = useCallback((song: Song) => {
    if (!audioRef.current) return;
    
    // Clear any ongoing crossfade
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    setIsCrossfading(false);
    
    audioRef.current.src = song.file_url;
    audioRef.current.volume = volume;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      trackPlay.mutate(song.id);
      updateListeningActivity(song);
    }).catch(console.error);
  }, [trackPlay, updateListeningActivity, volume]);

  const play = useCallback((song: Song) => {
    setCurrentSong(song);
    setPlayingFrom("queue");
    setPlaylistName(null);
    
    const songInQueue = queue.findIndex(s => s.id === song.id);
    if (songInQueue === -1) {
      setQueueState(prev => [...prev, song]);
      setQueueIndex(queue.length);
    } else {
      setQueueIndex(songInQueue);
    }
    
    playSongInternal(song);
  }, [queue, playSongInternal]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current && !isCrossfading) {
      audioRef.current.volume = vol;
    }
  }, [isCrossfading]);

  const next = useCallback(() => {
    // Cancel any ongoing crossfade
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    setIsCrossfading(false);
    
    let nextIndex = queueIndex + 1;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }
    
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      playSongInternal(queue[nextIndex]);
    } else if (repeat === "all" && queue.length > 0) {
      setQueueIndex(0);
      setCurrentSong(queue[0]);
      playSongInternal(queue[0]);
    }
  }, [queueIndex, queue, shuffle, repeat, playSongInternal]);

  const previous = useCallback(() => {
    // Cancel any ongoing crossfade
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    setIsCrossfading(false);
    
    if (currentTime > 3) {
      seek(0);
      return;
    }
    
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      playSongInternal(queue[prevIndex]);
    }
  }, [queueIndex, queue, currentTime, seek, playSongInternal]);

  const addToQueue = useCallback((song: Song) => {
    setQueueState(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((songId: string) => {
    setQueueState(prev => prev.filter(s => s.id !== songId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueueState([]);
    setQueueIndex(-1);
    setPlayingFrom(null);
    setPlaylistName(null);
  }, []);

  const setQueue = useCallback((songs: Song[], name?: string) => {
    setQueueState(songs);
    setQueueIndex(0);
    setPlayingFrom(name ? "playlist" : "queue");
    setPlaylistName(name || null);
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      playSongInternal(songs[0]);
    }
  }, [playSongInternal]);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const setCrossfadeEnabled = useCallback((enabled: boolean) => {
    setCrossfadeEnabledState(enabled);
  }, []);

  const setCrossfadeDuration = useCallback((duration: number) => {
    setCrossfadeDurationState(duration);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        shuffle,
        repeat,
        crossfadeEnabled,
        crossfadeDuration,
        playingFrom,
        playlistName,
        play,
        pause,
        resume,
        toggle,
        seek,
        setVolume,
        next,
        previous,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setQueue,
        toggleShuffle,
        toggleRepeat,
        setCrossfadeEnabled,
        setCrossfadeDuration,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
