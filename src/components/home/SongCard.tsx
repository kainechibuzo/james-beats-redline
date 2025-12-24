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
  showDelete?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, showArtist = true, showDelete = false }) => {
  const { user } = useAuth();
  const { data: isLiked } = useIsLiked(song.id);
  const toggleLike = useToggleLike();
  const { play, addToQueue } = usePlayer();
  const isMobile = useIsMobile();
  const deleteSong = useDeleteSong();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);

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
        className={`group bg-card rounded-lg hover:bg-card/80 transition-all duration-200 cursor-pointer ${isMobile ? 'p-2' : 'p-4'}`}
        onClick={handlePlay}
      >
        <div className={`relative ${isMobile ? 'mb-2' : 'mb-4'}`}>
          <img
            src={song.cover_url || "/placeholder.svg"}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-md bg-muted"
          />
          <div className={`absolute bottom-1 md:bottom-2 right-1 md:right-2 flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0`}>
            {user && (
              <Button
                variant="secondary"
                size="icon"
                className={`rounded-full ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}
                onClick={handleLike}
              >
                <Heart className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", isLiked && "fill-primary text-primary")} />
              </Button>
            )}
            <Button
              variant="glow"
              size="icon"
              className={`rounded-full ${isMobile ? 'w-7 h-7' : ''}`}
            >
              <Play className={isMobile ? "w-3 h-3" : "w-5 h-5"} />
            </Button>
          </div>
          
          {/* More options menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
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
        <h3 className={`font-semibold mb-1 truncate ${isMobile ? 'text-sm' : ''}`}>{song.title}</h3>
        {showArtist && (
          <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{song.artist}</p>
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
