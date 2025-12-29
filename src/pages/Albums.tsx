import { useState } from "react";
import { Link } from "react-router-dom";
import { useAlbums, useFeaturedAlbums, useDeleteAlbum } from "@/hooks/useAlbums";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Disc, Star, Music, ChevronDown, ChevronRight, Play, Pause, FolderOpen, MoreVertical, Trash2, Heart, ListMusic, User } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useIsAlbumLiked, useToggleAlbumLike } from "@/hooks/useAlbumLikes";

const Albums = () => {
  const { data: albums, isLoading } = useAlbums();
  const { data: featuredAlbums } = useFeaturedAlbums();
  const { data: allSongs } = useSongs();
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();
  const { user } = useAuth();
  const deleteAlbum = useDeleteAlbum();
  const [openAlbums, setOpenAlbums] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const toggleAlbum = (albumId: string) => {
    setOpenAlbums(prev => {
      const next = new Set(prev);
      if (next.has(albumId)) {
        next.delete(albumId);
      } else {
        next.add(albumId);
      }
      return next;
    });
  };

  const getAlbumSongs = (albumTitle: string, artistName: string) => {
    return allSongs?.filter(
      song => song.album === albumTitle && song.artist === artistName
    ) || [];
  };

  const handlePlayAlbum = (albumTitle: string, artistName: string) => {
    const songs = getAlbumSongs(albumTitle, artistName);
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleAddAlbumToQueue = (albumTitle: string, artistName: string) => {
    const songs = getAlbumSongs(albumTitle, artistName);
    songs.forEach(song => addToQueue(song));
  };

  const handleDeleteAlbum = (albumId: string) => {
    deleteAlbum.mutate(albumId);
    setDeleteDialogOpen(null);
  };

  const AlbumCard = ({ album, isFeatured = false }: { album: any; isFeatured?: boolean; key?: string }) => {
    const isOpen = openAlbums.has(album.id);
    const songs = getAlbumSongs(album.title, album.artist);
    const isCurrentAlbum = currentSong?.album === album.title && currentSong?.artist === album.artist;
    const isOwner = user?.id === album.user_id;
    const isAlbumLiked = useIsAlbumLiked(album.id);
    const { toggle: toggleAlbumLike, isPending: isLikePending } = useToggleAlbumLike();

    return (
        <Collapsible open={isOpen} onOpenChange={() => toggleAlbum(album.id)}>
          <div className={`rounded-xl border transition-all duration-300 ${
            isOpen ? "bg-card border-primary/30" : "bg-card/50 border-border hover:border-primary/20"
          }`}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-4 p-4 cursor-pointer group">
                {/* Album Cover */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <FolderOpen className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                  {isFeatured && (
                    <Badge className="absolute top-1 right-1 bg-yellow-500/90 text-black text-[10px] px-1 py-0">
                      <Star className="w-2 h-2 mr-0.5" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Album Info */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {album.genre && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {album.genre}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {songs.length} tracks
                    </span>
                    {album.release_year && (
                      <span className="text-xs text-muted-foreground">
                        · {album.release_year}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAlbumLike(album.id);
                      }}
                      disabled={isLikePending}
                    >
                      <Heart className={`w-4 h-4 ${isAlbumLiked ? "fill-primary text-primary" : ""}`} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentAlbum && isPlaying) {
                        togglePlay();
                      } else {
                        handlePlayAlbum(album.title, album.artist);
                      }
                    }}
                  >
                    {isCurrentAlbum && isPlaying ? (
                      <Pause className="w-5 h-5 text-primary" />
                    ) : (
                      <Play className="w-5 h-5 text-primary ml-0.5" />
                    )}
                  </Button>
                  
                  {/* More options dropdown */}
                  {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleAddAlbumToQueue(album.title, album.artist)}>
                          <ListMusic className="w-4 h-4 mr-2" />
                          Add all to queue
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/artist/${encodeURIComponent(album.artist)}`}>
                            <User className="w-4 h-4 mr-2" />
                            View artist
                          </Link>
                        </DropdownMenuItem>
                        {isOwner && (
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteDialogOpen(album.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete album
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0">
              <div className="border-t border-border pt-3 space-y-1">
                {songs.length > 0 ? (
                  songs.map((song, index) => {
                    const isCurrentSong = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, songs)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isCurrentSong ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <span className={`w-6 text-center text-sm ${isCurrentSong ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {isCurrentSong && isPlaying ? (
                            <Music className="w-4 h-4 mx-auto animate-pulse" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isCurrentSong ? "text-primary font-medium" : ""}`}>
                            {song.title}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {song.duration ? formatDuration(song.duration) : "--:--"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tracks in this album yet
                  </p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <Link to={`/album/${album.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Album
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="pb-32 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <FolderOpen className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold">Albums</h1>
      </div>
      <p className="text-muted-foreground mb-8">Browse all albums like folders - click to expand</p>

      {/* Featured Albums Section */}
      {featuredAlbums && featuredAlbums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Albums
          </h2>
          <div className="space-y-3">
            {featuredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} isFeatured />
            ))}
          </div>
        </section>
      )}

      {/* All Albums Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">All Albums</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="space-y-3">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border rounded-xl">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No albums yet</h3>
            <p className="text-sm mb-4">Upload a folder to create your first album!</p>
            <Link to="/upload">
              <Button variant="glow">Upload Album</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete album?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this album. Songs in the album will remain but won't be associated with this album anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialogOpen && handleDeleteAlbum(deleteDialogOpen)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Albums;
