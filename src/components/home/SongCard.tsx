import * as React from "react";
import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song, useToggleLike, useIsLiked } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

export interface SongCardProps {
  song: Song;
  showArtist?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, showArtist = true }) => {
  const { user } = useAuth();
  const { data: isLiked } = useIsLiked(song.id);
  const toggleLike = useToggleLike();
  const { play } = usePlayer();

  const handlePlay = () => {
    play(song);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleLike.mutate({ songId: song.id, isLiked: !!isLiked });
  };

  return (
    <div 
      className="group bg-card rounded-lg p-4 hover:bg-card/80 transition-all duration-200 cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative mb-4">
        <img
          src={song.cover_url || "/placeholder.svg"}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md bg-muted"
        />
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          {user && (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={handleLike}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-primary text-primary")} />
            </Button>
          )}
          <Button
            variant="glow"
            size="icon"
            className="rounded-full"
          >
            <Play className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <h3 className="font-semibold mb-1 truncate">{song.title}</h3>
      {showArtist && (
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      )}
    </div>
  );
};

export default SongCard;
