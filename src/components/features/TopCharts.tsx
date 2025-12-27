import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Play, Music } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";

const TopCharts = () => {
  const { data: songs } = useSongs();
  const { playSong } = usePlayer();

  const topSongs = songs
    ? [...songs].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 10)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Charts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {topSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => playSong(song)}
              >
                <span className={`w-6 text-center font-bold ${index < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>
                  {index + 1}
                </span>
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Play className="w-3 h-3" />
                  {(song.play_count || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TopCharts;
