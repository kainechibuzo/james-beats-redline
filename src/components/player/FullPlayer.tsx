import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Shuffle, Repeat, Repeat1, Heart, Share2, ListMusic, Mic2, 
  ChevronDown, MoreHorizontal
} from "lucide-react";
import { useIsLiked, useToggleLike } from "@/hooks/useSongs";
import LyricsDisplay from "./LyricsDisplay";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FullPlayerProps {
  onClose: () => void;
}

const FullPlayer = ({ onClose }: FullPlayerProps) => {
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

  const [showLyrics, setShowLyrics] = useState(false);
  const { data: isLiked } = useIsLiked(currentSong?.id || "");
  const toggleLike = useToggleLike();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-primary/20 via-background to-background animate-fade-in">
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronDown className="w-6 h-6" />
          </Button>
          <span className="text-sm font-medium">Now Playing</span>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        </div>

        {showLyrics ? (
          <div className="flex-1 overflow-hidden">
            <LyricsDisplay />
          </div>
        ) : (
          <>
            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-80 h-80 rounded-lg overflow-hidden shadow-2xl">
                {currentSong.cover_url ? (
                  <img 
                    src={currentSong.cover_url} 
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <ListMusic className="w-24 h-24 text-primary/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Song Info */}
            <div className="text-center my-6">
              <h2 className="text-2xl font-bold mb-1">{currentSong.title}</h2>
              <p className="text-muted-foreground">{currentSong.artist}</p>
            </div>
          </>
        )}

        {/* Progress */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={([value]) => seek(value)}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={cn(shuffle && "text-primary")}
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={previous}>
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button
            variant="glow"
            size="icon"
            className="w-16 h-16 rounded-full"
            onClick={toggle}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={next}>
            <SkipForward className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={cn(repeat !== "off" && "text-primary")}
          >
            {repeat === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleLike.mutate({ songId: currentSong.id, isLiked: !!isLiked })}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-primary text-primary")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant={showLyrics ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowLyrics(!showLyrics)}
            className="gap-2"
          >
            <Mic2 className="w-4 h-4" />
            Lyrics
          </Button>

          <div className="flex items-center gap-2">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
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
    </div>
  );
};

export default FullPlayer;
