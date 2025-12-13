import { useLikedSongs, useToggleLike } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Music, Play, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LikedSongs = () => {
  const { user, loading } = useAuth();
  const { data: likedSongs, isLoading } = useLikedSongs();
  const toggleLike = useToggleLike();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleUnlike = (songId: string) => {
    toggleLike.mutate({ songId, isLiked: true });
  };

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-primary to-pink-600 rounded-lg flex items-center justify-center shadow-2xl">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 text-muted-foreground">PLAYLIST</p>
          <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
          <p className="text-muted-foreground">
            {likedSongs?.length || 0} songs you love
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-6 h-4" />
              <Skeleton className="w-12 h-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : likedSongs && likedSongs.length > 0 ? (
        <div className="space-y-1">
          {likedSongs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
            >
              <span className="w-6 text-muted-foreground text-sm group-hover:hidden">{index + 1}</span>
              <Play className="w-4 h-4 text-primary hidden group-hover:block ml-1" />
              <img
                src={song.cover_url || "/placeholder.svg"}
                alt={song.title}
                className="w-12 h-12 rounded object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>
              {song.album && (
                <span className="text-sm text-muted-foreground hidden lg:block truncate max-w-[200px]">
                  {song.album}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleUnlike(song.id)}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No liked songs yet</h3>
          <p className="text-sm mb-4">Start liking songs to see them here!</p>
          <Link to="/">
            <Button variant="glow">Discover Music</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
