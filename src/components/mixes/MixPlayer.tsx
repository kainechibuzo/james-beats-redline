import { useEffect, useMemo, useRef, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  ChevronUp,
  Music2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatMixTime, type Mix, type MixTrack } from "@/hooks/useMixes";

interface Props {
  mix: Mix;
}

const MixPlayer = ({ mix }: Props) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioFocus, setAudioFocus] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const tracks = mix.tracks ?? [];

  const activeTrackIndex = useMemo(() => {
    if (!tracks.length) return -1;
    let idx = 0;
    for (let i = 0; i < tracks.length; i++) {
      if (currentTime >= tracks[i].startSeconds) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, tracks]);

  const activeTrack: MixTrack | undefined = tracks[activeTrackIndex];

  // Poll current time
  useEffect(() => {
    if (!isReady) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setCurrentTime(p.getCurrentTime() ?? 0);
        const d = p.getDuration() ?? 0;
        if (d && d !== duration) setDuration(d);
      } catch {
        /* noop */
      }
    }, 500);
    return () => clearInterval(id);
  }, [isReady, duration]);

  const jumpTo = (seconds: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(seconds, true);
    p.playVideo();
    setCurrentTime(seconds);
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo();
    else p.playVideo();
  };

  const nextTrack = () => {
    if (activeTrackIndex < tracks.length - 1) {
      jumpTo(tracks[activeTrackIndex + 1].startSeconds);
    }
  };

  const prevTrack = () => {
    if (activeTrackIndex > 0) {
      jumpTo(tracks[activeTrackIndex - 1].startSeconds);
    } else {
      jumpTo(0);
    }
  };

  const handleSeek = (vals: number[]) => jumpTo(vals[0]);

  const onReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
    setIsReady(true);
    setDuration(e.target.getDuration() ?? 0);
  };

  const onStateChange = (e: YouTubeEvent) => {
    // 1 = playing, 2 = paused, 0 = ended
    setIsPlaying(e.data === 1);
    if (e.data === 0) nextTrack();
  };

  const bgImage = mix.thumbnail
    ? `url(${mix.thumbnail})`
    : `url(https://i.ytimg.com/vi/${mix.youtube_video_id}/maxresdefault.jpg)`;

  return (
    <div className="relative min-h-[calc(100vh-12rem)] w-full overflow-hidden rounded-3xl">
      {/* Blurred dynamic background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: bgImage }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/70" />

      <div className="relative grid gap-6 p-4 md:p-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Player + art card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 md:p-6 shadow-2xl">
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black transition-all",
              audioFocus ? "aspect-[16/4]" : "aspect-video"
            )}
          >
            <YouTube
              videoId={mix.youtube_video_id}
              onReady={onReady}
              onStateChange={onStateChange}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  rel: 0,
                  modestbranding: 1,
                  playsinline: 1,
                },
              }}
              iframeClassName="w-full h-full"
              className="w-full h-full"
            />
            {audioFocus && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-r from-black/80 via-transparent to-black/80">
                <div className="flex items-center gap-3 text-white/90">
                  <Music2 className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-medium">Audio Focus Mode</span>
                </div>
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="mt-5">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Now Playing
            </p>
            <h2 className="mt-1 text-2xl md:text-3xl font-bold text-white truncate">
              {activeTrack?.title ?? mix.title}
            </h2>
            <p className="text-sm text-white/60 truncate">
              {activeTrack?.artist ?? mix.artist ?? "James Beats"}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              disabled={!isReady}
            />
            <div className="flex justify-between text-xs text-white/50 tabular-nums">
              <span>{formatMixTime(currentTime)}</span>
              <span>{formatMixTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={prevTrack}
              disabled={!isReady}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 shadow-xl"
              onClick={togglePlay}
              disabled={!isReady}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={nextTrack}
              disabled={!isReady || activeTrackIndex >= tracks.length - 1}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <div className="ml-3 h-6 w-px bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 hover:text-white text-xs"
              onClick={() => setAudioFocus((v) => !v)}
            >
              {audioFocus ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Video Mode
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Audio Focus
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
            Powered by YouTube
          </p>
        </div>

        {/* Tracklist */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 md:p-6 shadow-2xl">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">
                Tracklist
              </p>
              <h3 className="text-lg font-semibold text-white">
                {tracks.length} track{tracks.length === 1 ? "" : "s"}
              </h3>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
                className="mt-4 space-y-1 overflow-hidden"
              >
                {tracks.map((t, i) => {
                  const isActive = i === activeTrackIndex;
                  return (
                    <li key={`${t.startSeconds}-${i}`}>
                      <button
                        onClick={() => jumpTo(t.startSeconds)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                          isActive
                            ? "bg-white/10 ring-1 ring-white/20"
                            : "hover:bg-white/[0.06]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition",
                            isActive
                              ? "bg-white text-black"
                              : "bg-white/5 text-white/60 group-hover:bg-white/10"
                          )}
                        >
                          {isActive && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-sm font-medium",
                              isActive ? "text-white" : "text-white/85"
                            )}
                          >
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-white/50">
                            {t.artist}
                          </p>
                        </div>
                        <span className="text-xs text-white/40 tabular-nums">
                          {formatMixTime(t.startSeconds)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MixPlayer;