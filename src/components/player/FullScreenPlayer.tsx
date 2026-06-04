import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/contexts/PlayerContext";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Shuffle, Repeat, Repeat1, Heart, Share2, ListMusic, Mic2, 
  X, Disc3, Layers, Settings2, ChevronDown, Plus, Monitor
} from "lucide-react";
import { useIsLiked, useToggleLike } from "@/hooks/useSongs";
import LyricsDisplay from "./LyricsDisplay";
import AudioVisualizer from "./AudioVisualizer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSwipeGestures } from "@/hooks/useUIFeatures";

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullScreenPlayer = ({ isOpen, onClose }: FullScreenPlayerProps) => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    queue,
    playingFrom,
    playlistName,
    crossfadeEnabled,
    crossfadeDuration,
    frequencyData,
    toggle,
    seek,
    setVolume,
    next,
    previous,
    addToQueue,
    toggleShuffle,
    toggleRepeat,
    setCrossfadeEnabled,
    setCrossfadeDuration,
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);
  const { data: isLiked } = useIsLiked(currentSong?.id || "");
  const toggleLike = useToggleLike();

  // Integrate always-on display (wake lock) when music is playing
  const { isSupported: wakeLockSupported, isActive: wakeLockActive } = useWakeLock(isPlaying && isOpen);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSwipe = useCallback((direction: "left" | "right" | "up" | "down") => {
    // Only swipe-down closes; left/right skipping was removed to avoid accidental track changes.
    if (direction === "down") {
      onClose();
    } else if (direction === "up" && currentSong) {
      addToQueue(currentSong);
      toast.success("Added to queue");
    }
  }, [onClose, addToQueue, currentSong]);

  const { handleTouchStart, handleTouchEnd } = useSwipeGestures(handleSwipe, 60);

  const handleShare = async () => {
    if (currentSong) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Listen to ${currentSong.title} by ${currentSong.artist}`,
          url: window.location.origin,
        });
      } catch {
        navigator.clipboard.writeText(`${currentSong.title} by ${currentSong.artist}`);
        toast.success("Copied to clipboard!");
      }
    }
  };

  const handleLike = () => {
    if (currentSong) {
      toggleLike.mutate({ songId: currentSong.id, isLiked: !!isLiked });
    }
  };

  const currentQueueIndex = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
  const nextSong = queue[currentQueueIndex + 1];

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-background overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background with album art blur */}
          <div className="absolute inset-0 overflow-hidden">
            {currentSong.cover_url && (
              <img 
                src={currentSong.cover_url} 
                alt=""
                className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>

          {/* Swipe indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          <div className="relative h-full flex flex-col p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <ChevronDown className="w-6 h-6" />
              </Button>
              
              {/* Playing from indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm">
                {playingFrom === "playlist" ? (
                  <>
                    <ListMusic className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">{playlistName || "Playlist"}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Queue • {queue.length} songs</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Always-on Display button */}
                <button
                  onClick={() => { onClose(); navigate("/aod"); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                    wakeLockActive
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      : "bg-primary/15 text-primary border-primary/40 hover:bg-primary/25"
                  )}
                  title="Open Always-On Display"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Always On</span>
                </button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn("rounded-full", showSettings && "bg-muted")}
                >
                  <Settings2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Gesture hint */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-4 text-xs text-muted-foreground/60">
              <span>↓ Swipe down to close</span>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <h3 className="text-sm font-semibold mb-3">Settings</h3>
                  
                  {/* Crossfade Settings */}
                  <div className="mb-4 pb-4 border-b border-border/30">
                    <h4 className="text-xs font-medium text-muted-foreground mb-3">Crossfade</h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Enable crossfade</span>
                      <Switch checked={crossfadeEnabled} onCheckedChange={setCrossfadeEnabled} />
                    </div>
                    {crossfadeEnabled && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="text-sm font-medium">{crossfadeDuration}s</span>
                        </div>
                        <Slider
                          value={[crossfadeDuration]}
                          min={1}
                          max={12}
                          step={1}
                          onValueChange={([v]) => setCrossfadeDuration(v)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Always-on Display Info */}
                  {wakeLockSupported && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        <span className="font-medium">Screen will stay on during playback</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70">
                        This feature keeps your device screen active while music is playing.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 min-h-0">
              {showLyrics ? (
                <div className="flex-1 w-full overflow-hidden">
                  <LyricsDisplay />
                </div>
              ) : (
                <>
                  {/* Album Art with Visualizer */}
                  <div className="relative flex flex-col items-center">
                    <motion.div 
                      className="relative"
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                    >
                      <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/20">
                        {currentSong.cover_url ? (
                          <img 
                            src={currentSong.cover_url} 
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <Disc3 className="w-24 h-24 text-primary/50" />
                          </div>
                        )}
                      </div>
                      {/* Vinyl effect center */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/80 backdrop-blur-sm shadow-inner flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-muted" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Audio Visualizer */}
                    <div className="mt-6 w-full max-w-[280px] md:max-w-[320px]">
                      <AudioVisualizer frequencyData={frequencyData} variant="bars" className="h-12" />
                    </div>
                  </div>

                  {/* Song Info & Next Up */}
                  <div className="text-center md:text-left space-y-4">
                    <div>
                      <motion.h1 
                        key={currentSong.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-4xl font-bold mb-2"
                      >
                        {currentSong.title}
                      </motion.h1>
                      <p className="text-lg md:text-xl text-muted-foreground">{currentSong.artist}</p>
                      {currentSong.album && (
                        <p className="text-sm text-muted-foreground mt-1">{currentSong.album}</p>
                      )}
                    </div>

                    {/* Next Up Preview */}
                    {nextSong && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 backdrop-blur-sm"
                      >
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          {nextSong.cover_url ? (
                            <img src={nextSong.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                              <Disc3 className="w-5 h-5 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            {crossfadeEnabled ? "Crossfading to" : "Up next"}
                          </p>
                          <p className="text-sm font-medium truncate">{nextSong.title}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => {
                            addToQueue(nextSong);
                            toast.success("Added to queue");
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="mt-auto pt-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={([value]) => seek(value)}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(duration - currentTime)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 md:gap-6 py-4 md:py-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn("w-10 h-10 rounded-full", shuffle && "text-primary bg-primary/10")}
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={previous} className="w-12 h-12 rounded-full">
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button
                variant="glow"
                size="icon"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg shadow-primary/25"
                onClick={toggle}
              >
                {isPlaying ? <Pause className="w-8 h-8 md:w-10 md:h-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={next} className="w-12 h-12 rounded-full">
                <SkipForward className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={cn("w-10 h-10 rounded-full", repeat !== "off" && "text-primary bg-primary/10")}
              >
                {repeat === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </Button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className="rounded-full"
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-primary text-primary")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant={showLyrics ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowLyrics(!showLyrics)}
                className="gap-2 rounded-full"
              >
                <Mic2 className="w-4 h-4" />
                Lyrics
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                  className="rounded-full"
                >
                  {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setVolume(value / 100)}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;
