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
    const i = setInterval(() => setClock(new Date()), 60000);
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
      className="fixed inset-0 z-[100] bg-black text-white/60 flex flex-col items-center justify-between p-8 overflow-hidden select-none"
      onClick={handleTap}
    >
      {/* Clock */}
      <div className="relative w-full text-center pt-4 z-10">
        <div className="text-xs tracking-widest uppercase opacity-30">
          {clock.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
        </div>
        <div className="text-5xl font-extralight tracking-tight mt-1 opacity-50">
          {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Song info — no cover art for battery saving */}
      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm">
        <div className="text-center w-full px-4">
          <h1 className="text-lg font-light truncate opacity-70">{currentSong?.title ?? "Nothing playing"}</h1>
          <p className="text-sm opacity-30 truncate mt-1">{currentSong?.artist ?? "—"}</p>
        </div>

        {/* Progress */}
        <div className="w-full px-4">
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-white/30" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] opacity-25 mt-2 tabular-nums">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Minimal controls */}
      <div className="relative z-10 flex items-center gap-10 pb-6">
        <button
          onClick={(e) => { e.stopPropagation(); previous(); }}
          className="opacity-40 hover:opacity-70"
          aria-label="Previous"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          disabled={!currentSong}
          className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center opacity-60 hover:opacity-90 disabled:opacity-20"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="opacity-40 hover:opacity-70"
          aria-label="Next"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Exit hint */}
      <div
        className={`absolute bottom-2 left-0 right-0 text-center text-[10px] tracking-widest uppercase z-10 pointer-events-none transition-opacity duration-300 ${hint ? "opacity-40" : "opacity-10"}`}
      >
        Double-tap to exit
      </div>
    </div>
  );
};

export default AOD;
