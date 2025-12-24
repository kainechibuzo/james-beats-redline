import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/contexts/PlayerContext";
import { useIsLiked, useToggleLike } from "@/hooks/useSongs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import QueuePanel from "@/components/queue/QueuePanel";

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const Player = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    toggle,
    seek,
    setVolume,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { data: isLiked } = useIsLiked(currentSong?.id);
  const toggleLike = useToggleLike();
  const isMobile = useIsMobile();

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleLike = () => {
    if (currentSong) {
      toggleLike.mutate({ songId: currentSong.id, isLiked: !!isLiked });
    }
  };

  if (isMobile) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        {/* Progress bar at top */}
        <div className="px-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={!currentSong}
          />
        </div>
        
        <div className="h-16 px-3 flex items-center justify-between">
          {/* Track info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentSong ? (
              <>
                <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                  {currentSong.cover_url ? (
                    <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <span className="text-xs text-primary">♪</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{currentSong.title}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{currentSong.artist}</span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No track playing</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleLike} disabled={!currentSong}>
              <Heart className={cn("w-4 h-4", isLiked && "fill-primary text-primary")} />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={previous}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="glow" size="icon" className="w-9 h-9 rounded-full" onClick={toggle} disabled={!currentSong}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={next}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <QueuePanel />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-24 px-4 flex items-center justify-between z-50">
      {/* Current Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-0">
        {currentSong ? (
          <>
            <div className="w-14 h-14 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {currentSong.cover_url ? (
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                  <span className="text-xs text-primary">♪</span>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{currentSong.title}</span>
              <span className="text-xs text-muted-foreground truncate">{currentSong.artist}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={handleLike}
            >
              <Heart
                className={cn("w-4 h-4", isLiked && "fill-primary text-primary")}
              />
            </Button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">♪</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">No track playing</span>
            </div>
          </>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn("w-8 h-8", shuffle && "text-primary")}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={previous}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="glow"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={toggle}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={next}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("w-8 h-8", repeat !== "off" && "text-primary")}
            onClick={toggleRepeat}
          >
            {repeat === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
            disabled={!currentSong}
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control & Queue */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <QueuePanel />
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
      </div>
    </footer>
  );
};

export default Player;
