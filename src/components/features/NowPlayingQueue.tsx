import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ListMusic, Play, X, Music } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

const NowPlayingQueue = () => {
  const { queue, currentSong, playSong, removeFromQueue } = usePlayer();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-primary" />
          Up Next ({queue.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {queue.length > 0 ? (
            <div className="space-y-1">
              {queue.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    song.id === currentSong?.id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => playSong(song)}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => removeFromQueue(song.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ListMusic className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Queue is empty</p>
              <p className="text-xs">Add songs to see them here</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NowPlayingQueue;
