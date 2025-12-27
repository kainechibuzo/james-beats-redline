import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Music, Play } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";

const NewReleases = () => {
  const { data: songs } = useSongs();
  const { playSong } = usePlayer();

  // Get newest songs (last 7 days)
  const newSongs = songs
    ? [...songs]
        .filter((s) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(s.created_at) > weekAgo;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
    : [];

  if (newSongs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          New Releases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {newSongs.map((song) => (
            <div
              key={song.id}
              className="group cursor-pointer"
              onClick={() => playSong(song)}
            >
              <div className="aspect-square rounded-lg bg-muted overflow-hidden relative">
                {song.cover_url ? (
                  <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Music className="w-8 h-8 text-primary/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
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

export default NewReleases;
