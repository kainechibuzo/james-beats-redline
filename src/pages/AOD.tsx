import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useWakeLock } from "@/hooks/useWakeLock";

const fmt = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const AOD = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, currentTime, duration, toggle, next, previous } = usePlayer();
  useWakeLock(true);

  const [clock, setClock] = useState(new Date());
  const [hint, setHint] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const i = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Double-tap anywhere to exit
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      lastTapRef.current = 0;
      navigate(-1);
      return;
    }
    lastTapRef.current = now;
    setHint(true);
    setTimeout(() => setHint(false), 1500);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-white/90 flex flex-col items-center justify-between p-8 overflow-hidden select-none"
      onClick={handleTap}
    >
      {/* Clock */}
      <div className="relative w-full text-center pt-4 z-10">
        <div className="text-xs tracking-widest uppercase opacity-40">
          {clock.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
        </div>
        <div className="text-5xl font-extralight tracking-tight mt-1 opacity-80">
          {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Album / Video anchor */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <div
          data-yt-anchor="cover"
          data-yt-priority="10"
          data-yt-z="120"
          data-yt-interactive="false"
          className="w-64 h-64 sm:w-72 sm:h-72 bg-neutral-950 rounded-xl overflow-hidden ring-1 ring-white/5"
          style={{
            backgroundImage: currentSong?.thumbnail ? `url(${currentSong.thumbnail})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="text-center w-full px-4">
          <h1 className="text-xl font-light truncate">{currentSong?.title ?? "Nothing playing"}</h1>
          <p className="text-sm opacity-50 truncate mt-1">{currentSong?.artist ?? "—"}</p>
        </div>

        {/* Progress */}
        <div className="w-full px-4">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] opacity-40 mt-2 tabular-nums">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Minimal controls */}
      <div className="relative z-10 flex items-center gap-10 pb-6">
        <button
          onClick={(e) => { e.stopPropagation(); previous(); }}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Previous"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          disabled={!currentSong}
          className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Exit hint */}
      <div
        className={`absolute bottom-2 left-0 right-0 text-center text-[10px] tracking-widest uppercase z-10 pointer-events-none transition-opacity duration-300 ${hint ? "opacity-60" : "opacity-20"}`}
      >
        Double-tap to exit
      </div>
    </div>
  );
};

export default AOD;
