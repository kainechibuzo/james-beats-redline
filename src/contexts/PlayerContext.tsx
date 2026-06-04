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

const HOST_A_ID = "jb-yt-host-a";
const HOST_B_ID = "jb-yt-host-b";
const DIV_A_ID = "jb-yt-player-a";
const DIV_B_ID = "jb-yt-player-b";

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

type PlayerKey = "a" | "b";

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const trackPlay = useTrackPlay();

  // Two YouTube players for true crossfade
  const playersRef = useRef<{ a: any; b: any }>({ a: null, b: null });
  const readyRef = useRef<{ a: boolean; b: boolean }>({ a: false, b: false });
  const activeKeyRef = useRef<PlayerKey>("a");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Crossfade state
  const crossfadingRef = useRef(false);
  const crossfadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crossfadeTargetSongIdRef = useRef<string | null>(null);

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
  const [crossfadeDuration, setCrossfadeDurationState] = useState(6);
  const [gaplessEnabled, setGaplessEnabledState] = useState(false);
  const [playingFrom, setPlayingFrom] = useState<"queue" | "playlist" | null>(null);
  const [playlistName, setPlaylistName] = useState<string | null>(null);
  const [frequencyData] = useState<Uint8Array>(new Uint8Array(64));
  const [playersReadyTick, setPlayersReadyTick] = useState(0);

  // Refs to avoid stale closures
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const playedSongIdsRef = useRef<Set<string>>(new Set());
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const volumeRef = useRef(volume);
  const crossfadeEnabledRef = useRef(crossfadeEnabled);
  const crossfadeDurationRef = useRef(crossfadeDuration);

  useEffect(() => { queueRef.current = queue; queueIndexRef.current = queueIndex; }, [queue, queueIndex]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { crossfadeEnabledRef.current = crossfadeEnabled; }, [crossfadeEnabled]);
  useEffect(() => { crossfadeDurationRef.current = crossfadeDuration; }, [crossfadeDuration]);

  const getActive = () => playersRef.current[activeKeyRef.current];
  const getInactive = () => playersRef.current[activeKeyRef.current === "a" ? "b" : "a"];

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

  // -------- Crossfade management --------
  const cancelCrossfade = useCallback(() => {
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    crossfadingRef.current = false;
    crossfadeTargetSongIdRef.current = null;
    const inactive = getInactive();
    try { inactive?.stopVideo?.(); } catch {}
    try { getActive()?.setVolume?.(Math.round(volumeRef.current * 100)); } catch {}
  }, []);

  const completeCrossfade = useCallback((nextSong: Song, nextIndex: number) => {
    const oldActive = getActive();
    try { oldActive?.stopVideo?.(); } catch {}
    activeKeyRef.current = activeKeyRef.current === "a" ? "b" : "a";
    try { getActive()?.setVolume?.(Math.round(volumeRef.current * 100)); } catch {}
    crossfadingRef.current = false;
    crossfadeTargetSongIdRef.current = null;
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    setQueueIndex(nextIndex);
    setCurrentSong(nextSong);
    markSongAsPlayed(nextSong.id);
    trackPlay.mutate(nextSong.id);
    updateListeningActivity(nextSong);
  }, [markSongAsPlayed, trackPlay, updateListeningActivity]);

  const startCrossfade = useCallback((nextSong: Song, nextIndex: number) => {
    const inactive = getInactive();
    if (!inactive?.loadVideoById || !nextSong.youtube_video_id) return;
    crossfadingRef.current = true;
    crossfadeTargetSongIdRef.current = nextSong.id;
    const dur = Math.max(1, crossfadeDurationRef.current);
    const targetVol = Math.round(volumeRef.current * 100);
    try {
      inactive.loadVideoById({ videoId: nextSong.youtube_video_id, startSeconds: 0 });
      inactive.setVolume(0);
      inactive.playVideo();
    } catch {}
    const startTs = Date.now();
    crossfadeIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTs) / 1000;
      const r = Math.min(1, elapsed / dur);
      try {
        getActive()?.setVolume?.(Math.round((1 - r) * targetVol));
        inactive.setVolume(Math.round(r * targetVol));
      } catch {}
      if (r >= 1) {
        completeCrossfade(nextSong, nextIndex);
      }
    }, 100);
  }, [completeCrossfade]);

  // Handle natural end (when crossfade didn't run, e.g. disabled or unavailable next)
  const handleSongEnd = useCallback(() => {
    if (crossfadingRef.current) return; // crossfade will handle the swap
    if (repeatRef.current === "one") {
      const a = getActive();
      try { a?.seekTo?.(0, true); a?.playVideo?.(); } catch {}
      return;
    }
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      const nextSong = queueRef.current[nextIndex];
      if (nextSong?.youtube_video_id) {
        setQueueIndex(nextIndex);
        setCurrentSong(nextSong);
        markSongAsPlayed(nextSong.id);
        try { getActive()?.loadVideoById?.(nextSong.youtube_video_id); } catch {}
        trackPlay.mutate(nextSong.id);
        updateListeningActivity(nextSong);
        return;
      }
    }
    setIsPlaying(false);
  }, [getNextIndex, markSongAsPlayed, trackPlay, updateListeningActivity]);

  const handleSongEndRef = useRef(handleSongEnd);
  useEffect(() => { handleSongEndRef.current = handleSongEnd; }, [handleSongEnd]);

  // Init both YouTube players
  useEffect(() => {
    let cancelled = false;

    const makeHost = (id: string) => {
      let host = document.getElementById(id);
      if (!host) {
        host = document.createElement("div");
        host.id = id;
        host.style.position = "fixed";
        host.style.zIndex = "55";
        host.style.background = "hsl(0 0% 0%)";
        host.style.borderRadius = "6px";
        host.style.overflow = "hidden";
        host.style.pointerEvents = "none";
        host.style.display = "none";
        host.style.top = "-9999px";
        host.style.left = "-9999px";
        host.style.width = "1px";
        host.style.height = "1px";
        const inner = document.createElement("div");
        inner.id = id === HOST_A_ID ? DIV_A_ID : DIV_B_ID;
        inner.style.width = "100%";
        inner.style.height = "100%";
        host.appendChild(inner);
        document.body.appendChild(host);
      }
      return host;
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      makeHost(HOST_A_ID);
      makeHost(HOST_B_ID);

      const buildPlayer = (key: PlayerKey, divId: string) =>
        new YT.Player(divId, {
          height: "100%",
          width: "100%",
          playerVars: { autoplay: 0, controls: 0, modestbranding: 1, playsinline: 1, rel: 0 },
          events: {
            onReady: () => {
              readyRef.current[key] = true;
              setPlayersReadyTick((t) => t + 1);
              try { playersRef.current[key]?.setVolume(0); } catch {}
              if (key === activeKeyRef.current) {
                try { playersRef.current[key]?.setVolume(Math.round(volumeRef.current * 100)); } catch {}
              }
            },
            onStateChange: (e: any) => {
              if (key !== activeKeyRef.current) return; // ignore inactive player events
              const state = e.data;
              if (state === YT.PlayerState.PLAYING) setIsPlaying(true);
              else if (state === YT.PlayerState.PAUSED) setIsPlaying(false);
              else if (state === YT.PlayerState.ENDED) handleSongEndRef.current();
            },
            onError: (err: any) => console.error("YT player error", key, err?.data),
          },
        });

      playersRef.current.a = buildPlayer("a", DIV_A_ID);
      playersRef.current.b = buildPlayer("b", DIV_B_ID);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pin the ACTIVE host onto whichever element has data-yt-anchor="cover".
  // Inactive host is parked offscreen (only audible).
  useEffect(() => {
    const apply = () => {
      const hostA = document.getElementById(HOST_A_ID);
      const hostB = document.getElementById(HOST_B_ID);
      if (!hostA || !hostB) return;

      const activeHost = activeKeyRef.current === "a" ? hostA : hostB;
      const inactiveHost = activeKeyRef.current === "a" ? hostB : hostA;

      // Park inactive offscreen but keep playable
      inactiveHost.style.display = "block";
      inactiveHost.style.top = "-9999px";
      inactiveHost.style.left = "-9999px";
      inactiveHost.style.width = "1px";
      inactiveHost.style.height = "1px";
      inactiveHost.style.zIndex = "0";
      inactiveHost.style.pointerEvents = "none";

      const anchors = Array.from(
        document.querySelectorAll('[data-yt-anchor="cover"]')
      ) as HTMLElement[];
      const anchor = anchors.sort(
        (a, b) =>
          parseInt(b.dataset.ytPriority ?? "0", 10) -
          parseInt(a.dataset.ytPriority ?? "0", 10)
      )[0];

      if (!currentSong || !anchor) {
        activeHost.style.display = "none";
        return;
      }
      const r = anchor.getBoundingClientRect();
      activeHost.style.display = "block";
      activeHost.style.top = `${r.top}px`;
      activeHost.style.left = `${r.left}px`;
      activeHost.style.width = `${r.width}px`;
      activeHost.style.height = `${r.height}px`;
      activeHost.style.zIndex = anchor.dataset.ytZ ?? "55";
      activeHost.style.pointerEvents = anchor.dataset.ytInteractive === "true" ? "auto" : "none";
    };
    apply();
    const id = setInterval(apply, 250);
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", apply, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", apply);
      window.removeEventListener("scroll", apply, true);
    };
  }, [currentSong, playersReadyTick]);

  // Poll time/duration on the ACTIVE player + trigger crossfade preload
  useEffect(() => {
    pollRef.current = setInterval(() => {
      const p = getActive();
      if (!p || typeof p.getCurrentTime !== "function") return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration();
        if (!Number.isNaN(t)) setCurrentTime(t);
        if (!Number.isNaN(d)) setDuration(d);

        // Crossfade trigger: load next track before the current one ends.
        if (
          crossfadeEnabledRef.current &&
          !crossfadingRef.current &&
          d > 0 &&
          repeatRef.current !== "one" &&
          (d - t) <= crossfadeDurationRef.current &&
          (d - t) > 0.2
        ) {
          const nextIndex = getNextIndex();
          if (nextIndex !== -1) {
            const nextSong = queueRef.current[nextIndex];
            if (nextSong?.youtube_video_id) {
              startCrossfade(nextSong, nextIndex);
            }
          }
        }
      } catch {}
    }, 250);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [getNextIndex, startCrossfade]);


  const playSongInternal = useCallback((song: Song) => {
    if (!song.youtube_video_id) {
      console.warn("Song has no youtube_video_id; cannot play", song);
      return;
    }
    cancelCrossfade();
    markSongAsPlayed(song.id);
    const a = getActive();
    if (readyRef.current[activeKeyRef.current] && a?.loadVideoById) {
      try {
        a.loadVideoById(song.youtube_video_id);
        a.setVolume(Math.round(volumeRef.current * 100));
      } catch {}
    }
    trackPlay.mutate(song.id);
    updateListeningActivity(song);
  }, [cancelCrossfade, markSongAsPlayed, trackPlay, updateListeningActivity]);

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

  const playSong = useCallback((song: Song, queueSongs?: Song[], name?: string) => {
    if (queueSongs && queueSongs.length > 0) {
      const idx = Math.max(0, queueSongs.findIndex((s) => s.id === song.id));
      setQueueState(queueSongs);
      setQueueIndex(idx);
      setPlaylistName(name ?? null);
      setPlayingFrom(name ? "playlist" : "queue");
      setCurrentSong(song);
      resetPlayedSongs([song.id]);
      playSongInternal(song);
    } else {
      play(song);
    }
  }, [play, playSongInternal, resetPlayedSongs]);

  const pause = useCallback(() => { getActive()?.pauseVideo?.(); }, []);
  const resume = useCallback(() => { getActive()?.playVideo?.(); }, []);
  const toggle = useCallback(() => { isPlaying ? pause() : resume(); }, [isPlaying, pause, resume]);
  const togglePlay = toggle;
  const seek = useCallback((time: number) => {
    cancelCrossfade();
    getActive()?.seekTo?.(time, true);
    setCurrentTime(time);
  }, [cancelCrossfade]);
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    try { getActive()?.setVolume?.(Math.round(vol * 100)); } catch {}
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

  // -------- Persistent playback --------
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem("jb:lastTrack");
      if (!raw) return;
      const saved = JSON.parse(raw) as { songId: string; position: number };
      if (!saved?.songId) return;
      supabase.from("songs").select("*").eq("id", saved.songId).maybeSingle().then(({ data }) => {
        if (!data) return;
        setCurrentSong(data as Song);
        setQueueState([data as Song]);
        setQueueIndex(0);
        const waitReady = setInterval(() => {
          const a = getActive();
          if (!readyRef.current[activeKeyRef.current] || !a?.cueVideoById) return;
          clearInterval(waitReady);
          try {
            a.cueVideoById({
              videoId: (data as Song).youtube_video_id,
              startSeconds: Math.max(0, saved.position || 0),
            });
          } catch {}
        }, 200);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!currentSong) return;
    const id = setInterval(() => {
      try {
        localStorage.setItem("jb:lastTrack", JSON.stringify({
          songId: currentSong.id,
          position: currentTime || 0,
        }));
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [currentSong, currentTime]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, currentTime, duration, volume, queue, shuffle, repeat,
        crossfadeEnabled, crossfadeDuration, gaplessEnabled, playingFrom, playlistName, frequencyData,
        play, playSong, pause, resume, toggle, togglePlay, seek, setVolume, next, previous,
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
