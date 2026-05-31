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
  gaplessEnabled: boolean;
  playingFrom: "queue" | "playlist" | null;
  playlistName: string | null;
  frequencyData: Uint8Array;
  play: (song: Song) => void;
  playSong: (song: Song, queueSongs?: Song[], playlistName?: string) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  reorderQueue: (newQueue: Song[]) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], playlistName?: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCrossfadeEnabled: (enabled: boolean) => void;
  setCrossfadeDuration: (duration: number) => void;
  setGaplessEnabled: (enabled: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const YT_PLAYER_DIV_ID = "jb-yt-player";

// Singleton YouTube IFrame API loader
let ytApiPromise: Promise<any> | null = null;
const loadYouTubeApi = (): Promise<any> => {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const w = window as any;
    if (w.YT && w.YT.Player) return resolve(w.YT);
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
  return ytApiPromise;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const trackPlay = useTrackPlay();

  const playerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [crossfadeEnabled, setCrossfadeEnabledState] = useState(false);
  const [crossfadeDuration, setCrossfadeDurationState] = useState(5);
  const [gaplessEnabled, setGaplessEnabledState] = useState(false);
  const [playingFrom, setPlayingFrom] = useState<"queue" | "playlist" | null>(null);
  const [playlistName, setPlaylistName] = useState<string | null>(null);
  const [frequencyData] = useState<Uint8Array>(new Uint8Array(64));
  const [playerReady, setPlayerReady] = useState(false);

  // Refs to avoid stale closures
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const playedSongIdsRef = useRef<Set<string>>(new Set());
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const playerReadyRef = useRef(false);

  useEffect(() => { queueRef.current = queue; queueIndexRef.current = queueIndex; }, [queue, queueIndex]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  const resetPlayedSongs = useCallback((songIds: string[] = []) => {
    playedSongIdsRef.current = new Set(songIds);
  }, []);
  const markSongAsPlayed = useCallback((songId?: string | null) => {
    if (!songId) return;
    playedSongIdsRef.current.add(songId);
  }, []);

  const getNextIndex = useCallback((songs = queueRef.current, currentIndex = queueIndexRef.current) => {
    if (songs.length === 0) return -1;
    const rp = repeatRef.current;
    const sh = shuffleRef.current;
    if (!sh) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < songs.length) return nextIndex;
      return rp === "all" ? 0 : -1;
    }
    if (songs.length === 1) return rp === "all" ? 0 : -1;
    const played = playedSongIdsRef.current;
    let cands = songs
      .map((s, i) => ({ s, i }))
      .filter(({ s, i }) => i !== currentIndex && !played.has(s.id))
      .map(({ i }) => i);
    if (cands.length === 0) {
      if (rp !== "all") return -1;
      const cid = songs[currentIndex]?.id;
      resetPlayedSongs(cid ? [cid] : []);
      cands = songs
        .map((s, i) => ({ s, i }))
        .filter(({ s, i }) => i !== currentIndex && !playedSongIdsRef.current.has(s.id))
        .map(({ i }) => i);
    }
    if (cands.length === 0) return rp === "all" ? currentIndex : -1;
    return cands[Math.floor(Math.random() * cands.length)];
  }, [resetPlayedSongs]);

  const updateListeningActivity = useCallback(async (song: Song) => {
    if (!user) return;
    await supabase.from("listening_activity").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    await supabase.from("listening_activity").insert({ user_id: user.id, song_id: song.id, is_active: true });
  }, [user]);

  const handleSongEnd = useCallback(() => {
    if (repeatRef.current === "one") {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      return;
    }
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      const nextSong = queueRef.current[nextIndex];
      if (nextSong?.youtube_video_id) {
        setQueueIndex(nextIndex);
        setCurrentSong(nextSong);
        markSongAsPlayed(nextSong.id);
        playerRef.current?.loadVideoById(nextSong.youtube_video_id);
        trackPlay.mutate(nextSong.id);
        updateListeningActivity(nextSong);
        return;
      }
    }
    setIsPlaying(false);
  }, [getNextIndex, markSongAsPlayed, trackPlay, updateListeningActivity]);

  const handleSongEndRef = useRef(handleSongEnd);
  useEffect(() => { handleSongEndRef.current = handleSongEnd; }, [handleSongEnd]);

  // Init YouTube player — overlays the album-cover slot inside the play bar
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      let host = document.getElementById(YT_PLAYER_DIV_ID);
      if (!host) {
        host = document.createElement("div");
        host.id = YT_PLAYER_DIV_ID;
        host.style.position = "fixed";
        host.style.zIndex = "55"; // above play bar (z-50) cover, below modals
        host.style.background = "hsl(0 0% 0%)";
        host.style.borderRadius = "6px";
        host.style.overflow = "hidden";
        host.style.pointerEvents = "none"; // let play-bar controls underneath stay clickable
        host.style.display = "none";
        document.body.appendChild(host);
      }
      playerRef.current = new YT.Player(YT_PLAYER_DIV_ID, {
        height: "100%",
        width: "100%",
        playerVars: { autoplay: 0, controls: 0, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            setPlayerReady(true);
            try { playerRef.current.setVolume(Math.round(volume * 100)); } catch {}
          },
          onStateChange: (e: any) => {
            const state = e.data;
            if (state === YT.PlayerState.PLAYING) setIsPlaying(true);
            else if (state === YT.PlayerState.PAUSED) setIsPlaying(false);
            else if (state === YT.PlayerState.ENDED) handleSongEndRef.current();
          },
          onError: (e: any) => console.error("YT player error", e?.data),
        },
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pin host onto whichever element has data-yt-anchor="cover" in the play bar.
  // Re-position on resize, scroll, route change, and when current song toggles.
  useEffect(() => {
    const apply = () => {
      const host = document.getElementById(YT_PLAYER_DIV_ID);
      if (!host) return;
      const anchor = document.querySelector('[data-yt-anchor="cover"]') as HTMLElement | null;
      if (!currentSong || !anchor) {
        host.style.display = "none";
        return;
      }
      const r = anchor.getBoundingClientRect();
      host.style.display = "block";
      host.style.top = `${r.top}px`;
      host.style.left = `${r.left}px`;
      host.style.width = `${r.width}px`;
      host.style.height = `${r.height}px`;
    };
    apply();
    const id = setInterval(apply, 400); // catches layout shifts cheaply
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", apply, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", apply);
      window.removeEventListener("scroll", apply, true);
    };
  }, [currentSong, playerReady]);

  // Poll time/duration
  useEffect(() => {
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration();
        if (!Number.isNaN(t)) setCurrentTime(t);
        if (!Number.isNaN(d)) setDuration(d);
      } catch {}
    }, 500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);


  const playSongInternal = useCallback((song: Song) => {
    if (!song.youtube_video_id) {
      console.warn("Song has no youtube_video_id; cannot play", song);
      return;
    }
    markSongAsPlayed(song.id);
    if (playerReadyRef.current && playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(song.youtube_video_id);
      try { playerRef.current.setVolume(Math.round(volume * 100)); } catch {}
    }
    trackPlay.mutate(song.id);
    updateListeningActivity(song);
  }, [markSongAsPlayed, trackPlay, updateListeningActivity, volume]);

  const play = useCallback((song: Song) => {
    setCurrentSong(song);
    setPlayingFrom("queue");
    setPlaylistName(null);
    const idx = queue.findIndex((s) => s.id === song.id);
    if (idx === -1) {
      setQueueState((prev) => [...prev, song]);
      setQueueIndex(queue.length);
    } else {
      setQueueIndex(idx);
    }
    resetPlayedSongs([song.id]);
    playSongInternal(song);
  }, [queue, playSongInternal, resetPlayedSongs]);

  const pause = useCallback(() => { playerRef.current?.pauseVideo?.(); }, []);
  const resume = useCallback(() => { playerRef.current?.playVideo?.(); }, []);
  const toggle = useCallback(() => { isPlaying ? pause() : resume(); }, [isPlaying, pause, resume]);
  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo?.(time, true);
    setCurrentTime(time);
  }, []);
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    try { playerRef.current?.setVolume?.(Math.round(vol * 100)); } catch {}
  }, []);

  const next = useCallback(() => {
    const nextIndex = getNextIndex(queue, queueIndex);
    if (nextIndex !== -1 && queue[nextIndex]) {
      setQueueIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      playSongInternal(queue[nextIndex]);
    }
  }, [queue, queueIndex, getNextIndex, playSongInternal]);

  const previous = useCallback(() => {
    if (currentTime > 3) { seek(0); return; }
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0 && queue[prevIndex]) {
      setQueueIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      playSongInternal(queue[prevIndex]);
    } else {
      seek(0);
    }
  }, [currentTime, queueIndex, queue, seek, playSongInternal]);

  const addToQueue = useCallback((song: Song) => {
    setQueueState((prev) => (prev.some((s) => s.id === song.id) ? prev : [...prev, song]));
  }, []);
  const removeFromQueue = useCallback((songId: string) => {
    setQueueState((prev) => prev.filter((s) => s.id !== songId));
  }, []);
  const reorderQueue = useCallback((newQueue: Song[]) => {
    setQueueState(newQueue);
    if (currentSong) {
      const i = newQueue.findIndex((s) => s.id === currentSong.id);
      if (i !== -1) setQueueIndex(i);
    }
  }, [currentSong]);
  const clearQueue = useCallback(() => { setQueueState([]); setQueueIndex(-1); }, []);
  const setQueue = useCallback((songs: Song[], name?: string) => {
    setQueueState(songs);
    setPlaylistName(name ?? null);
    setPlayingFrom(name ? "playlist" : "queue");
    resetPlayedSongs(songs[0] ? [songs[0].id] : []);
    if (songs[0]) {
      setQueueIndex(0);
      setCurrentSong(songs[0]);
      playSongInternal(songs[0]);
    }
  }, [playSongInternal, resetPlayedSongs]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")), []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, currentTime, duration, volume, queue, shuffle, repeat,
        crossfadeEnabled, crossfadeDuration, gaplessEnabled, playingFrom, playlistName, frequencyData,
        play, pause, resume, toggle, seek, setVolume, next, previous,
        addToQueue, removeFromQueue, reorderQueue, clearQueue, setQueue,
        toggleShuffle, toggleRepeat,
        setCrossfadeEnabled: setCrossfadeEnabledState,
        setCrossfadeDuration: setCrossfadeDurationState,
        setGaplessEnabled: setGaplessEnabledState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
