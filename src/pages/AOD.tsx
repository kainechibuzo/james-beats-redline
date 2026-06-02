import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, X, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [locked, setLocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Double-tap to unlock
  useEffect(() => {
    if (tapCount === 0) return;
    const t = setTimeout(() => setTapCount(0), 400);
    if (tapCount >= 2) {
      setLocked(false);
      setTapCount(0);
    }
    return () => clearTimeout(t);
  }, [tapCount]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-foreground flex flex-col items-center justify-between p-6 overflow-hidden"
      onClick={() => locked && setTapCount((c) => c + 1)}
    >
      {/* Ambient background */}
      {currentSong?.thumbnail && (
        <div
          className="absolute inset-0 opacity-20 blur-3xl scale-110"
          style={{
            backgroundImage: `url(${currentSong.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Top bar */}
      <div className="relative w-full flex justify-between items-start z-10">
        <div className="text-sm opacity-60">
          {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setLocked((l) => !l); }}
            aria-label={locked ? "Unlock" : "Lock"}
          >
            {locked ? <Lock className="w-5 h-5 text-primary" /> : <Unlock className="w-5 h-5" />}
          </Button>
          {!locked && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Close">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Album/Video area — YouTube iframe pins here via data-yt-anchor */}
      <div className="relative z-10 flex flex-col items-center gap-6 flex-1 justify-center w-full max-w-md">
        <div
          data-yt-anchor="cover"
          className="w-72 h-72 sm:w-80 sm:h-80 bg-black rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
          style={{
            backgroundImage: currentSong?.thumbnail ? `url(${currentSong.thumbnail})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="text-center w-full px-4">
          <h1 className="text-2xl font-bold truncate">{currentSong?.title ?? "Nothing playing"}</h1>
          <p className="text-base opacity-70 truncate">{currentSong?.artist ?? "—"}</p>
        </div>

        {/* Progress */}
        <div className="w-full px-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs opacity-60 mt-2">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-8 pb-8">
        <Button variant="ghost" size="icon" onClick={previous} className="w-14 h-14">
          <SkipBack className="w-7 h-7" />
        </Button>
        <Button
          variant="glow"
          size="icon"
          onClick={toggle}
          disabled={!currentSong}
          className="w-20 h-20 rounded-full"
        >
          {isPlaying ? <Pause className="w-9 h-9" /> : <Play className="w-9 h-9 ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={next} className="w-14 h-14">
          <SkipForward className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default AOD;
