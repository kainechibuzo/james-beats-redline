import { Clock } from "lucide-react";
import PlaylistCard from "@/components/home/PlaylistCard";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const RecentlyPlayed = () => {
  const recentTracks = [
    {
      title: "Urban Dreams",
      description: "Last played 5 min ago",
      image: album1,
    },
    {
      title: "City Nights",
      description: "Last played 1 hour ago",
      image: album2,
    },
    {
      title: "Red Echoes",
      description: "Last played today",
      image: album3,
    },
    {
      title: "Midnight Mix",
      description: "Last played yesterday",
      image: album1,
    },
    {
      title: "Neon Beats",
      description: "Last played 2 days ago",
      image: album2,
    },
    {
      title: "Smoke Sessions",
      description: "Last played last week",
      image: album3,
    },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Recently Played</h1>
          <p className="text-muted-foreground">Your listening history</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {recentTracks.map((track, index) => (
          <PlaylistCard key={index} {...track} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayed;
