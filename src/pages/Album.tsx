import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAlbum, useAlbumSongs, useDeleteAlbum } from "@/hooks/useAlbums";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLikedAlbums, useToggleAlbumLike } from "@/hooks/useAlbumLikes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disc, Play, Music, ArrowLeft, Shuffle, Heart, ListPlus, Trash2, UserPlus } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import DraggableTrackList from "@/components/album/DraggableTrackList";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: album, isLoading: albumLoading } = useAlbum(id || "");
  const { data: songs, isLoading: songsLoading } = useAlbumSongs(id || "");
  const { play, setQueue, addToQueue } = usePlayer();
  const deleteAlbum = useDeleteAlbum();
  const { data: likedAlbums } = useLikedAlbums();
  const { toggle: toggleLike, isPending: likePending } = useToggleAlbumLike();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isOwner = user?.id === album?.user_id;
  const isLiked = likedAlbums?.includes(id || "") ?? false;

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      setQueue(songs);
      play(songs[0]);
    }
  };

  const handleShuffle = () => {
    if (songs && songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      play(shuffled[0]);
    }
  };

  const handleAddToQueue = () => {
    if (songs && songs.length > 0) {
      songs.forEach((song) => addToQueue(song));
      toast.success(`Added ${songs.length} songs to queue`);
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like albums");
      return;
    }
    toggleLike(id || "");
  };

  const handleDelete = () => {
    deleteAlbum.mutate(id || "", {
      onSuccess: () => {
        navigate("/albums");
      },
    });
    setDeleteDialogOpen(false);
  };

  const handleFollowArtist = () => {
    if (!user) {
      toast.error("Please sign in to follow artists");
      return;
    }
    navigate(`/artist/${encodeURIComponent(album?.artist || "")}`);
  };

  const totalDuration = songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0;

  if (albumLoading) {
    return (
      <div className="pb-32 animate-fade-in">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="flex gap-8 mb-8">
          <Skeleton className="w-64 h-64 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="pb-32 animate-fade-in text-center py-16">
        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Album not found</h2>
        <Link to="/albums">
          <Button variant="outline">Back to Albums</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-fade-in">
      {/* Back Button */}
      <Link to="/albums" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Albums
      </Link>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 aspect-square rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-2xl">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Disc className="w-24 h-24 text-primary/50" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Album</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{album.artist}</span>
            {album.release_year && (
              <>
                <span>•</span>
                <span>{album.release_year}</span>
              </>
            )}
            {songs && (
              <>
                <span>•</span>
                <span>{songs.length} songs</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </>
            )}
          </div>
          {album.genre && (
            <Badge variant="outline" className="w-fit mb-4">{album.genre}</Badge>
          )}
          {album.description && (
            <p className="text-muted-foreground max-w-2xl">{album.description}</p>
          )}
        </div>
      </div>

      {/* Play Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button variant="glow" size="lg" onClick={handlePlayAll} disabled={!songs?.length}>
          <Play className="w-5 h-5 mr-2" />
          Play All
        </Button>
        <Button variant="outline" size="lg" onClick={handleShuffle} disabled={!songs?.length}>
          <Shuffle className="w-5 h-5 mr-2" />
          Shuffle
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleLike}
          disabled={likePending}
        >
          <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-primary text-primary" : ""}`} />
          {isLiked ? "Liked" : "Like"}
        </Button>
        <Button variant="outline" size="lg" onClick={handleAddToQueue} disabled={!songs?.length}>
          <ListPlus className="w-5 h-5 mr-2" />
          Add to Queue
        </Button>
        <Button variant="outline" size="lg" onClick={handleFollowArtist}>
          <UserPlus className="w-5 h-5 mr-2" />
          View Artist
        </Button>
        {isOwner && (
          <Button 
            variant="outline" 
            size="lg" 
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Songs List */}
      {songsLoading ? (
        <div className="space-y-1">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
            <span className="w-8">#</span>
            <span>Title</span>
            <span>Duration</span>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3">
              <Skeleton className="w-8 h-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </div>
      ) : songs && songs.length > 0 ? (
        <DraggableTrackList songs={songs} albumUserId={album.user_id} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No songs in this album yet</p>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{album?.title}". Songs in this album will not be deleted but will be unlinked from the album. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Album;
