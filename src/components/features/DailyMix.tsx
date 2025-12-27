import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Play, Music } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";

const DailyMix = () => {
  const { data: songs } = useSongs();
  const { playSong, setQueue } = usePlayer();

  // Shuffle and get random songs for daily mix
  const shuffledSongs = songs 
    ? [...songs].sort(() => Math.random() - 0.5).slice(0, 6)
    : [];

  const playAll = () => {
    if (shuffledSongs.length > 0) {
      setQueue(shuffledSongs);
      playSong(shuffledSongs[0]);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-green-400" />
          Daily Mix
        </CardTitle>
        <Button variant="outline" size="sm" onClick={playAll} className="gap-2">
          <Play className="w-4 h-4" />
          Play All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {shuffledSongs.map((song) => (
            <div
              key={song.id}
              className="group cursor-pointer"
              onClick={() => playSong(song)}
            >
              <div className="aspect-square rounded-lg bg-muted overflow-hidden relative">
                {song.cover_url ? (
                  <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-500/10">
                    <Music className="w-8 h-8 text-green-500/50" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium mt-2 truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyMix;
