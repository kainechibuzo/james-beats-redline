import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ListMusic, X, Play } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QueuePanelProps {
  trigger?: React.ReactNode;
}

const QueuePanel = ({ trigger }: QueuePanelProps) => {
  const { queue, currentSong, play, clearQueue } = usePlayer();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <ListMusic className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Queue</SheetTitle>
            {queue.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearQueue} className="text-xs">
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        {currentSong && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Now Playing</p>
            <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg">
              <img
                src={currentSong.cover_url || "/placeholder.svg"}
                alt={currentSong.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Up Next ({queue.length})
          </p>
          {queue.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-1">
                {queue.map((song, index) => (
                  <button
                    key={`${song.id}-${index}`}
                    onClick={() => play(song)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left group"
                    )}
                  >
                    <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
                    <img
                      src={song.cover_url || "/placeholder.svg"}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs">Add songs to see them here</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QueuePanel;
