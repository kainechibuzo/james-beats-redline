import { Play, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const Player = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-24 px-4 flex items-center justify-between">
      {/* Current Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No track</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Track Title</span>
          <span className="text-xs text-muted-foreground">Artist Name</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 w-2/4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="glow" size="icon" className="w-10 h-10 rounded-full">
            <Play className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs text-muted-foreground">0:00</span>
          <Slider defaultValue={[0]} max={100} step={1} className="flex-1" />
          <span className="text-xs text-muted-foreground">3:45</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <Volume2 className="w-4 h-4" />
        <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
      </div>
    </footer>
  );
};

export default Player;
