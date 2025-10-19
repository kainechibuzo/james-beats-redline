import { Music, Heart, ListMusic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaylistCard from "@/components/home/PlaylistCard";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const Library = () => {
  const tabs = [
    { icon: ListMusic, label: "Playlists" },
    { icon: Music, label: "Songs" },
    { icon: User, label: "Artists" },
    { icon: Heart, label: "Liked" },
  ];

  const myPlaylists = [
    { title: "My Favorites", description: "50 songs", image: album1 },
    { title: "Workout Mix", description: "35 songs", image: album2 },
    { title: "Chill Vibes", description: "42 songs", image: album3 },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Library</h1>
        <Button variant="glow">Create Playlist</Button>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map((tab, index) => (
          <Button
            key={index}
            variant={index === 0 ? "default" : "ghost"}
            className="gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {myPlaylists.map((playlist, index) => (
          <PlaylistCard key={index} {...playlist} />
        ))}
      </div>
    </div>
  );
};

export default Library;
