import * as React from "react";
import { Play, Heart, MoreVertical, Trash2, ListPlus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song, useToggleLike, useIsLiked } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteSong } from "@/hooks/useDeleteSong";
import AddToPlaylistDialog from "@/components/playlist/AddToPlaylistDialog";
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

export interface SongCardProps {
  song: Song;
  showArtist?: boolean;
  showAlbum?: boolean;
  showDelete?: boolean;
  compact?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, showArtist = true, showAlbum = false, showDelete = false, compact = false }) => {
  const { user } = useAuth();
  const { data: isLiked } = useIsLiked(song.id);
  const toggleLike = useToggleLike();
  const { play, addToQueue } = usePlayer();
  const isMobile = useIsMobile();
  const deleteSong = useDeleteSong();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);

  // Determine size based on compact prop and mobile
  const isSmall = compact || isMobile;

  const isOwner = user?.id === song.user_id;

  const handlePlay = () => {
    play(song);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleLike.mutate({ songId: song.id, isLiked: !!isLiked });
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleDelete = () => {
    deleteSong.mutate(song.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div 
        className={`group bg-card rounded-lg hover:bg-card/80 transition-all duration-200 cursor-pointer ${isSmall ? 'p-2' : 'p-3 md:p-4'}`}
        onClick={handlePlay}
      >
        <div className={`relative ${isSmall ? 'mb-1.5' : 'mb-2 md:mb-3'}`}>
          <img
            src={song.cover_url || "/placeholder.svg"}
            alt={song.title}
            className={`w-full aspect-square object-cover rounded-md bg-muted ${isSmall ? 'max-w-[120px]' : 'max-w-[180px] md:max-w-none'}`}
          />
          <div className={`absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0`}>
            {user && (
              <Button
                variant="secondary"
                size="icon"
                className={`rounded-full ${isSmall ? 'w-5 h-5' : 'w-7 h-7 md:w-8 md:h-8'}`}
                onClick={handleLike}
              >
                <Heart className={cn(isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5 md:w-4 md:h-4", isLiked && "fill-primary text-primary")} />
              </Button>
            )}
            <Button
              variant="glow"
              size="icon"
              className={`rounded-full ${isSmall ? 'w-6 h-6' : 'w-8 h-8 md:w-9 md:h-9'}`}
            >
              <Play className={isSmall ? "w-2.5 h-2.5" : "w-4 h-4 md:w-5 md:h-5"} />
            </Button>
          </div>
          
          {/* More options menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSmall ? 'w-5 h-5' : 'w-7 h-7 md:w-8 md:h-8'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className={isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5 md:w-4 md:h-4"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleAddToQueue}>
                  <ListMusic className="w-4 h-4 mr-2" />
                  Add to queue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlaylistDialogOpen(true)}>
                  <ListPlus className="w-4 h-4 mr-2" />
                  Add to playlist
                </DropdownMenuItem>
                {(isOwner || showDelete) && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete song
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <h3 className={`font-semibold mb-0.5 truncate ${isSmall ? 'text-xs' : 'text-sm md:text-base'}`}>{song.title}</h3>
        {showArtist && (
          <p className={`text-muted-foreground truncate ${isSmall ? 'text-[10px]' : 'text-xs md:text-sm'}`}>{song.artist}</p>
        )}
        {showAlbum && song.album && (
          <p className={`text-muted-foreground/70 truncate ${isSmall ? 'text-[10px]' : 'text-xs md:text-sm'}`}>{song.album}</p>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete song?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{song.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to playlist dialog */}
      <AddToPlaylistDialog 
        songId={song.id} 
        trigger={<span style={{ display: 'none' }} />}
      />
      {playlistDialogOpen && (
        <AddToPlaylistDialog 
          songId={song.id} 
          trigger={
            <button 
              ref={(el) => el?.click()} 
              style={{ display: 'none' }}
            />
          }
        />
      )}
    </>
  );
};

export default SongCard;
