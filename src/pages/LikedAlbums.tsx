import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Disc, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLikedAlbums, useUnlikeAlbum } from "@/hooks/useAlbumLikes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LikedAlbums = () => {
  const { user, loading } = useAuth();
  const { data: likedAlbumIds, isLoading: isLoadingLikes } = useLikedAlbums();
  const unlikeAlbum = useUnlikeAlbum();

  // Fetch full album details for liked albums
  const { data: likedAlbums, isLoading: isLoadingAlbums } = useQuery({
    queryKey: ["liked-albums-details", likedAlbumIds],
    queryFn: async () => {
      if (!likedAlbumIds || likedAlbumIds.length === 0) return [];

      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .in("id", likedAlbumIds);

      if (error) throw error;
      return data;
    },
    enabled: !!likedAlbumIds && likedAlbumIds.length > 0,
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = isLoadingLikes || isLoadingAlbums;

  const handleUnlike = (albumId: string) => {
    unlikeAlbum.mutate(albumId);
  };

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-2xl">
          <Disc className="w-20 h-20 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 text-muted-foreground">COLLECTION</p>
          <h1 className="text-4xl font-bold mb-2">Liked Albums</h1>
          <p className="text-muted-foreground">
            {likedAlbums?.length || 0} albums in your collection
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : likedAlbums && likedAlbums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {likedAlbums.map((album) => (
            <div
              key={album.id}
              className="group relative rounded-lg bg-card p-3 hover:bg-card/80 transition-colors"
            >
              <Link to={`/album/${album.id}`} className="block">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <Disc className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium truncate">{album.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                onClick={(e) => {
                  e.preventDefault();
                  handleUnlike(album.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Disc className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No liked albums yet</h3>
          <p className="text-sm mb-4">Start liking albums to see them here!</p>
          <Link to="/albums">
            <Button variant="glow">Browse Albums</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LikedAlbums;
