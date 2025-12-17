import { useState } from "react";
import { Music, Heart, ListMusic, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSongs, useLikedSongs } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import SongCard from "@/components/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

type Tab = "songs" | "liked";

const Library = () => {
  const [activeTab, setActiveTab] = useState<Tab>("songs");
  const { user } = useAuth();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: likedSongs, isLoading: likedLoading } = useLikedSongs();

  // Get user's uploaded songs
  const userSongs = songs?.filter((song) => song.user_id === user?.id) || [];

  const tabs = [
    { id: "songs" as Tab, icon: Music, label: "My Songs", count: userSongs.length },
    { id: "liked" as Tab, icon: Heart, label: "Liked", count: likedSongs?.length || 0 },
  ];

  const isLoading = activeTab === "songs" ? songsLoading : likedLoading;
  const displaySongs = activeTab === "songs" ? userSongs : likedSongs || [];

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Library</h1>
        <Link to="/upload">
          <Button variant="glow" className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Song
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="gap-2"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : displaySongs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displaySongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
          <ListMusic className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {activeTab === "songs" ? "No uploaded songs yet" : "No liked songs yet"}
          </h3>
          <p className="text-sm mb-4">
            {activeTab === "songs"
              ? "Upload your first track to see it here"
              : "Like songs to add them to your collection"}
          </p>
          {activeTab === "songs" && (
            <Link to="/upload">
              <Button variant="glow">Upload Song</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
