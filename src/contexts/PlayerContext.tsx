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
type Engine = "youtube" | "audius";

// YouTube playback has been retired — the platform now streams exclusively
// via Audius. Any legacy song without a file_url is treated as unplayable
// and auto-skipped by the queue.
const pickEngine = (_song: Song): Engine => "audius";

const canPlaySong = (song: Song): boolean => !!song.file_url;

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const trackPlay = useTrackPlay();

  // Two YouTube players + two <audio> elements, one of each per slot
  const playersRef = useRef<{ a: any; b: any }>({ a: null, b: null });
  const audioRef = useRef<{ a: HTMLAudioElement | null; b: HTMLAudioElement | null }>({ a: null, b: null });
  const readyRef = useRef<{ a: boolean; b: boolean }>({ a: false, b: false });
  const slotEngineRef = useRef<{ a: Engine | null; b: Engine | null }>({ a: null, b: null });
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

  const otherKey = (k: PlayerKey): PlayerKey => (k === "a" ? "b" : "a");

  // -------- Per-slot engine helpers (engine-agnostic) --------
  const slotIsReady = (k: PlayerKey, eng: Engine): boolean =>
    eng === "youtube" ? !!readyRef.current[k] && !!playersRef.current[k]?.loadVideoById
                      : !!audioRef.current[k];

  const slotStop = (k: PlayerKey) => {
    const eng = slotEngineRef.current[k];
    if (!eng) return;
    if (eng === "youtube") {
      try { playersRef.current[k]?.stopVideo?.(); } catch {}
    } else {
      const el = audioRef.current[k];
      if (el) { try { el.pause(); el.removeAttribute("src"); el.load(); } catch {} }
    }
  };

  const slotSetVolume = (k: PlayerKey, vol0to100: number) => {
    const eng = slotEngineRef.current[k];
    if (!eng) return;
    if (eng === "youtube") {
      try { playersRef.current[k]?.setVolume?.(vol0to100); } catch {}
    } else {
      const el = audioRef.current[k];
      if (el) { try { el.volume = Math.max(0, Math.min(1, vol0to100 / 100)); } catch {} }
    }
  };

  const slotLoad = (k: PlayerKey, song: Song, opts: { autoplay: boolean; startSeconds?: number }) => {
    const eng = pickEngine(song);
    // Stop whatever was previously in this slot (may be different engine)
    const prev = slotEngineRef.current[k];
    if (prev && prev !== eng) slotStop(k);
    slotEngineRef.current[k] = eng;

    if (eng === "youtube") {
      const p = playersRef.current[k];
      if (!p || !song.youtube_video_id) return;
      try {
        if (opts.autoplay) {
          p.loadVideoById({ videoId: song.youtube_video_id, startSeconds: opts.startSeconds ?? 0 });
        } else {
          p.cueVideoById({ videoId: song.youtube_video_id, startSeconds: opts.startSeconds ?? 0 });
        }
      } catch {}
    } else {
      const el = audioRef.current[k];
      if (!el || !song.file_url) return;
      try {
        el.src = song.file_url;
        el.currentTime = opts.startSeconds ?? 0;
        if (opts.autoplay) void el.play().catch(() => {});
      } catch {}
    }
  };

  const slotPlay = (k: PlayerKey) => {
    const eng = slotEngineRef.current[k];
    if (!eng) return;
    if (eng === "youtube") { try { playersRef.current[k]?.playVideo?.(); } catch {} }
    else { const el = audioRef.current[k]; if (el) void el.play().catch(() => {}); }
  };

  const slotPause = (k: PlayerKey) => {
    const eng = slotEngineRef.current[k];
    if (!eng) return;
    if (eng === "youtube") { try { playersRef.current[k]?.pauseVideo?.(); } catch {} }
    else { const el = audioRef.current[k]; if (el) { try { el.pause(); } catch {} } }
  };

  const slotSeek = (k: PlayerKey, t: number) => {
    const eng = slotEngineRef.current[k];
    if (!eng) return;
    if (eng === "youtube") { try { playersRef.current[k]?.seekTo?.(t, true); } catch {} }
    else { const el = audioRef.current[k]; if (el) { try { el.currentTime = t; } catch {} } }
  };

  const slotGetTime = (k: PlayerKey): number => {
    const eng = slotEngineRef.current[k];
    if (!eng) return 0;
    if (eng === "youtube") { try { return playersRef.current[k]?.getCurrentTime?.() ?? 0; } catch { return 0; } }
    return audioRef.current[k]?.currentTime ?? 0;
  };

  const slotGetDuration = (k: PlayerKey): number => {
    const eng = slotEngineRef.current[k];
    if (!eng) return 0;
    if (eng === "youtube") { try { return playersRef.current[k]?.getDuration?.() ?? 0; } catch { return 0; } }
    const d = audioRef.current[k]?.duration;
    return Number.isFinite(d ?? NaN) ? (d as number) : 0;
  };

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
    const inactive = otherKey(activeKeyRef.current);
    slotStop(inactive);
    slotSetVolume(activeKeyRef.current, Math.round(volumeRef.current * 100));
  }, []);

  const consumeAndAdvance = useCallback((nextSong: Song, nextIndex: number) => {
    const oldIdx = queueIndexRef.current;
    setQueueState((prev) => {
      if (oldIdx < 0 || oldIdx >= prev.length) return prev;
      const copy = prev.slice();
      copy.splice(oldIdx, 1);
      return copy;
    });
    const newIdx = nextIndex > oldIdx ? nextIndex - 1 : nextIndex;
    setQueueIndex(newIdx);
    setCurrentSong(nextSong);
    markSongAsPlayed(nextSong.id);
    trackPlay.mutate(nextSong.id);
    updateListeningActivity(nextSong);
  }, [markSongAsPlayed, trackPlay, updateListeningActivity]);

  const completeCrossfade = useCallback((nextSong: Song, nextIndex: number) => {
    const oldActive = activeKeyRef.current;
    slotStop(oldActive);
    activeKeyRef.current = otherKey(oldActive);
    slotSetVolume(activeKeyRef.current, Math.round(volumeRef.current * 100));
    crossfadingRef.current = false;
    crossfadeTargetSongIdRef.current = null;
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    consumeAndAdvance(nextSong, nextIndex);
  }, [consumeAndAdvance]);

  const startCrossfade = useCallback((nextSong: Song, nextIndex: number) => {
    if (!canPlaySong(nextSong)) return;
    const inactive = otherKey(activeKeyRef.current);
    crossfadingRef.current = true;
    crossfadeTargetSongIdRef.current = nextSong.id;
    const dur = Math.max(1, crossfadeDurationRef.current);
    const targetVol = Math.round(volumeRef.current * 100);
    slotLoad(inactive, nextSong, { autoplay: true, startSeconds: 0 });
    slotSetVolume(inactive, 0);
    slotPlay(inactive);
    const startTs = Date.now();
    crossfadeIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTs) / 1000;
      const r = Math.min(1, elapsed / dur);
      slotSetVolume(activeKeyRef.current, Math.round((1 - r) * targetVol));
      slotSetVolume(inactive, Math.round(r * targetVol));
      if (r >= 1) completeCrossfade(nextSong, nextIndex);
    }, 100);
  }, [completeCrossfade]);

  const handleSongEnd = useCallback(() => {
    if (crossfadingRef.current) {
      // If a crossfade is in-flight and inactive really is playing, let it finish.
      const inactive = otherKey(activeKeyRef.current);
      const eng = slotEngineRef.current[inactive];
      let playing = false;
      if (eng === "youtube") {
        try {
          const st = playersRef.current[inactive]?.getPlayerState?.() ?? -1;
          playing = st === (window as any).YT?.PlayerState?.PLAYING;
        } catch {}
      } else if (eng === "audius") {
        const el = audioRef.current[inactive];
        playing = !!el && !el.paused && !el.ended && el.currentTime > 0;
      }
      if (playing) return;
      cancelCrossfade();
    }
    if (repeatRef.current === "one") {
      slotSeek(activeKeyRef.current, 0);
      slotPlay(activeKeyRef.current);
      return;
    }
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      const nextSong = queueRef.current[nextIndex];
      if (nextSong && canPlaySong(nextSong)) {
        slotLoad(activeKeyRef.current, nextSong, { autoplay: true });
        slotSetVolume(activeKeyRef.current, Math.round(volumeRef.current * 100));
        slotPlay(activeKeyRef.current);
        consumeAndAdvance(nextSong, nextIndex);
        return;
      }
    }
    setIsPlaying(false);
  }, [cancelCrossfade, getNextIndex, consumeAndAdvance]);

  const handleSongEndRef = useRef(handleSongEnd);
  useEffect(() => { handleSongEndRef.current = handleSongEnd; }, [handleSongEnd]);

  // Init audio elements
  useEffect(() => {
    const makeAudio = (k: PlayerKey): HTMLAudioElement => {
      const el = new Audio();
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      el.style.display = "none";
      el.addEventListener("ended", () => {
        if (activeKeyRef.current !== k) return;
        handleSongEndRef.current();
      });
      el.addEventListener("play", () => {
        if (activeKeyRef.current === k) setIsPlaying(true);
      });
      el.addEventListener("pause", () => {
        if (activeKeyRef.current === k) setIsPlaying(false);
      });
      el.addEventListener("error", (e) => console.error("audio error", k, e));
      document.body.appendChild(el);
      return el;
    };
    audioRef.current.a = makeAudio("a");
    audioRef.current.b = makeAudio("b");
    return () => {
      audioRef.current.a?.remove();
      audioRef.current.b?.remove();
    };
  }, []);

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
              if (key === activeKeyRef.current && slotEngineRef.current[key] === "youtube") {
                try { playersRef.current[key]?.setVolume(Math.round(volumeRef.current * 100)); } catch {}
              }
            },
            onStateChange: (e: any) => {
              if (key !== activeKeyRef.current) return;
              if (slotEngineRef.current[key] !== "youtube") return;
              const state = e.data;
              if (state === YT.PlayerState.PLAYING) setIsPlaying(true);
              else if (state === YT.PlayerState.PAUSED) setIsPlaying(false);
              else if (state === YT.PlayerState.ENDED) handleSongEndRef.current();
            },
            onError: (err: any) => {
              const code = err?.data;
              console.error("YT player error", key, code);
              // 2 = invalid id, 5 = HTML5 err, 100 = removed/private, 101/150 = embed disabled
              // Auto-skip to next playable track so playback never stalls silently.
              if (key === activeKeyRef.current && [2, 5, 100, 101, 150].includes(code)) {
                cancelCrossfade();
                handleSongEndRef.current();
              }
            },
          },
        });

      playersRef.current.a = buildPlayer("a", DIV_A_ID);
      playersRef.current.b = buildPlayer("b", DIV_B_ID);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pin the ACTIVE YT host onto whichever element has data-yt-anchor="cover".
  useEffect(() => {
    const apply = () => {
      const hostA = document.getElementById(HOST_A_ID);
      const hostB = document.getElementById(HOST_B_ID);
      if (!hostA || !hostB) return;

      const activeK = activeKeyRef.current;
      const activeHost = activeK === "a" ? hostA : hostB;
      const inactiveHost = activeK === "a" ? hostB : hostA;
      const activeEng = slotEngineRef.current[activeK];

      inactiveHost.style.display = "block";
      inactiveHost.style.position = "fixed";
      inactiveHost.style.top = "0px";
      inactiveHost.style.left = "0px";
      inactiveHost.style.width = "160px";
      inactiveHost.style.height = "90px";
      inactiveHost.style.opacity = "0.001";
      inactiveHost.style.zIndex = "0";
      inactiveHost.style.pointerEvents = "none";
      inactiveHost.style.clipPath = "inset(50%)";

      // Only pin the YT iframe when the active slot is playing YouTube.
      if (!currentSong || activeEng !== "youtube") {
        activeHost.style.display = "none";
        return;
      }

      const anchors = Array.from(
        document.querySelectorAll('[data-yt-anchor="cover"]')
      ) as HTMLElement[];
      const anchor = anchors.sort(
        (a, b) =>
          parseInt(b.dataset.ytPriority ?? "0", 10) -
          parseInt(a.dataset.ytPriority ?? "0", 10)
      )[0];

      if (!anchor) {
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

  // Poll active slot for time/duration + crossfade preload
  useEffect(() => {
    pollRef.current = setInterval(() => {
      const k = activeKeyRef.current;
      const eng = slotEngineRef.current[k];
      if (!eng) return;
      const t = slotGetTime(k);
      const d = slotGetDuration(k);
      if (!Number.isNaN(t)) setCurrentTime(t);
      if (!Number.isNaN(d)) setDuration(d);

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
          if (nextSong && canPlaySong(nextSong)) {
            startCrossfade(nextSong, nextIndex);
          }
        }
      }
    }, 250);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [getNextIndex, startCrossfade]);

  const playSongInternal = useCallback((song: Song) => {
    if (!canPlaySong(song)) {
      console.warn("Song has no playable source; skipping", song);
      return;
    }
    cancelCrossfade();
    markSongAsPlayed(song.id);
    const k = activeKeyRef.current;
    slotLoad(k, song, { autoplay: true });
    slotSetVolume(k, Math.round(volumeRef.current * 100));
    slotPlay(k);
    // Audius doesn't fire YT state events; reflect play immediately.
    if (pickEngine(song) === "audius") setIsPlaying(true);
    trackPlay.mutate(song.id);
    updateListeningActivity(song);
  }, [cancelCrossfade, markSongAsPlayed, trackPlay, updateListeningActivity]);

  // Build a smart "similar tracks" queue from a seed song (same genre, then trending).
  const buildSimilarQueue = useCallback(async (seed: Song) => {
    try {
      const collected: Song[] = [];
      const seenIds = new Set<string>([seed.id]);
      const push = (rows: any[] | null) => {
        for (const r of rows || []) {
          if (!r?.id || seenIds.has(r.id)) continue;
          if (!canPlaySong(r as Song)) continue;
          seenIds.add(r.id);
          collected.push(r as Song);
        }
      };

      if (seed.genre) {
        const { data } = await supabase
          .from("songs")
          .select("*")
          .eq("is_public", true)
          .eq("genre", seed.genre)
          .neq("artist", seed.artist)
          .order("play_count", { ascending: false })
          .limit(30);
        push(data);
      }

      if (collected.length < 20) {
        const { data } = await supabase
          .from("songs")
          .select("*")
          .eq("is_public", true)
          .neq("id", seed.id)
          .order("play_count", { ascending: false })
          .limit(40);
        push(data);
      }

      for (let i = collected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [collected[i], collected[j]] = [collected[j], collected[i]];
      }

      if (
        queueRef.current.length <= 1 &&
        queueRef.current[0]?.id === seed.id
      ) {
        const newQueue = [seed, ...collected.slice(0, 30)];
        setQueueState(newQueue);
        setQueueIndex(0);
      }
    } catch (e) {
      console.warn("buildSimilarQueue failed", e);
    }
  }, []);

  const play = useCallback((song: Song) => {
    setCurrentSong(song);
    setPlayingFrom("queue");
    setPlaylistName(null);
    setQueueState([song]);
    setQueueIndex(0);
    resetPlayedSongs([song.id]);
    playSongInternal(song);
    void buildSimilarQueue(song);
  }, [playSongInternal, resetPlayedSongs, buildSimilarQueue]);

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

  const pause = useCallback(() => {
    slotPause(activeKeyRef.current);
    if (slotEngineRef.current[activeKeyRef.current] === "audius") setIsPlaying(false);
  }, []);
  const resume = useCallback(() => {
    slotPlay(activeKeyRef.current);
    if (slotEngineRef.current[activeKeyRef.current] === "audius") setIsPlaying(true);
  }, []);
  const toggle = useCallback(() => { isPlaying ? pause() : resume(); }, [isPlaying, pause, resume]);
  const togglePlay = toggle;
  const seek = useCallback((time: number) => {
    cancelCrossfade();
    slotSeek(activeKeyRef.current, time);
    setCurrentTime(time);
  }, [cancelCrossfade]);
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    slotSetVolume(activeKeyRef.current, Math.round(vol * 100));
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

  // -------- Persistent playback restore --------
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
        const song = data as Song;
        if (!canPlaySong(song)) return;
        setCurrentSong(song);
        setQueueState([song]);
        setQueueIndex(0);
        const startAt = Math.max(0, saved.position || 0);
        const eng = pickEngine(song);
        const k = activeKeyRef.current;
        const waitReady = setInterval(() => {
          if (!slotIsReady(k, eng)) return;
          clearInterval(waitReady);
          slotLoad(k, song, { autoplay: false, startSeconds: startAt });
          slotEngineRef.current[k] = eng;
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
