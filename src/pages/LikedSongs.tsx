import { Heart, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const LikedSongs = () => {
  const likedSongs = [
    {
      title: "Midnight Vibes",
      artist: "DJ Shadow",
      album: "Urban Dreams",
      duration: "3:45",
      image: album1,
    },
    {
      title: "Electric Soul",
      artist: "Neon Lights",
      album: "City Nights",
      duration: "4:20",
      image: album2,
    },
    {
      title: "Red Smoke",
      artist: "Phantom",
      album: "Echoes",
      duration: "3:12",
      image: album3,
    },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-56 h-56 bg-gradient-to-br from-primary/80 to-primary rounded-lg flex items-center justify-center shadow-2xl">
          <Heart className="w-24 h-24 text-primary-foreground" fill="currentColor" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">PLAYLIST</p>
          <h1 className="text-6xl font-bold mb-4">Liked Songs</h1>
          <p className="text-muted-foreground">
            {likedSongs.length} songs • Created by you
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant="glow" size="lg" className="rounded-full gap-2">
          <Play className="w-5 h-5" fill="currentColor" />
          Play
        </Button>
        <Button variant="outline" size="lg" className="rounded-full">
          Shuffle
        </Button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>#</span>
          <span>TITLE</span>
          <span>ALBUM</span>
          <span>DATE ADDED</span>
          <Clock className="w-4 h-4" />
        </div>
        {likedSongs.map((song, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_2fr_1fr_1fr_auto] gap-4 px-4 py-3 rounded-md hover:bg-secondary/50 group transition-colors cursor-pointer"
          >
            <span className="text-muted-foreground group-hover:hidden">
              {index + 1}
            </span>
            <Play className="w-4 h-4 text-primary hidden group-hover:block" />
            <div className="flex items-center gap-3">
              <img
                src={song.image}
                alt={song.title}
                className="w-10 h-10 rounded"
              />
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
            </div>
            <span className="text-muted-foreground flex items-center">
              {song.album}
            </span>
            <span className="text-muted-foreground flex items-center">
              3 days ago
            </span>
            <span className="text-muted-foreground flex items-center">
              {song.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedSongs;
