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
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[]) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const trackPlay = useTrackPlay();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener("timeupdate", () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
    });
    
    audioRef.current.addEventListener("loadedmetadata", () => {
      setDuration(audioRef.current?.duration || 0);
    });
    
    audioRef.current.addEventListener("ended", () => {
      handleSongEnd();
    });

    audioRef.current.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handleSongEnd = useCallback(() => {
    if (repeat === "one") {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    } else if (queueIndex < queue.length - 1) {
      next();
    } else if (repeat === "all" && queue.length > 0) {
      setQueueIndex(0);
      playSongInternal(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, queue, queueIndex]);

  const updateListeningActivity = useCallback(async (song: Song) => {
    if (!user) return;
    
    // Mark previous activity as inactive
    await supabase
      .from("listening_activity")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);
    
    // Add new activity
    await supabase.from("listening_activity").insert({
      user_id: user.id,
      song_id: song.id,
      is_active: true,
    });
  }, [user]);

  const playSongInternal = useCallback((song: Song) => {
    if (!audioRef.current) return;
    
    audioRef.current.src = song.file_url;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      trackPlay.mutate(song.id);
      updateListeningActivity(song);
    }).catch(console.error);
  }, [trackPlay, updateListeningActivity]);

  const play = useCallback((song: Song) => {
    setCurrentSong(song);
    
    // If not in queue, add to queue
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
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const next = useCallback(() => {
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

  const clearQueue = useCallback(() => {
    setQueueState([]);
    setQueueIndex(-1);
  }, []);

  const setQueue = useCallback((songs: Song[]) => {
    setQueueState(songs);
    setQueueIndex(0);
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
        play,
        pause,
        resume,
        toggle,
        seek,
        setVolume,
        next,
        previous,
        addToQueue,
        clearQueue,
        setQueue,
        toggleShuffle,
        toggleRepeat,
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
