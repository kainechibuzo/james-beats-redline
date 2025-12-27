import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";

const MiniPlayer = () => {
  const { currentSong, isPlaying, togglePlay, playNext, playPrevious, volume, setVolume } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-card border border-border rounded-xl shadow-lg p-3 w-72">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
          {currentSong.cover_url ? (
            <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{currentSong.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={playPrevious}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="default" size="icon" className="w-10 h-10" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={playNext}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          onValueChange={(val) => setVolume(val[0] / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
