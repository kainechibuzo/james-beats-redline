import { useRecentlyPlayed } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import SongCard from "@/components/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Music } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const RecentlyPlayed = () => {
  const { user, loading } = useAuth();
  const { data: recentlyPlayed, isLoading } = useRecentlyPlayed();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center">
          <Clock className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Recently Played</h1>
          <p className="text-muted-foreground">
            {recentlyPlayed?.length || 0} songs in your history
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : recentlyPlayed && recentlyPlayed.length > 0 ? (
        <div className="space-y-2">
          {recentlyPlayed.map((song, index) => (
            <div
              key={`${song.id}-${song.played_at}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
            >
              <span className="w-6 text-muted-foreground text-sm">{index + 1}</span>
              <img
                src={song.cover_url || "/placeholder.svg"}
                alt={song.title}
                className="w-12 h-12 rounded object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
              <span className="text-sm text-muted-foreground hidden md:block">
                {formatDistanceToNow(new Date(song.played_at), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No listening history yet</h3>
          <p className="text-sm mb-4">Start playing songs to see them here!</p>
          <Link to="/">
            <Button variant="glow">Discover Music</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayed;
