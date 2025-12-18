import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylist, useRemoveFromPlaylist, useDeletePlaylist } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2, ArrowLeft, Music, Clock } from "lucide-react";
import { toast } from "sonner";

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: playlist, isLoading } = usePlaylist(id || "");
  const { currentSong, isPlaying, play, toggle, setQueue } = usePlayer();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePlayAll = () => {
    if (!playlist?.songs.length) return;
    setQueue(playlist.songs);
  };

  const handlePlaySong = (song: typeof playlist.songs[0]) => {
    if (!playlist) return;
    play(song);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;
    try {
      await removeFromPlaylist.mutateAsync({ playlistId: id, songId });
      toast.success("Song removed from playlist");
    } catch {
      toast.error("Failed to remove song");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deletePlaylist.mutateAsync(id);
      toast.success("Playlist deleted");
      navigate("/library");
    } catch {
      toast.error("Failed to delete playlist");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Playlist not found</p>
        <Button variant="outline" onClick={() => navigate("/library")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="w-48 h-48 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Music className="w-20 h-20 text-primary/50" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">Playlist</p>
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-muted-foreground mb-4">{playlist.description}</p>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
          </p>
          
          <div className="flex gap-3">
            <Button variant="glow" onClick={handlePlayAll} disabled={!playlist.songs.length}>
              <Play className="w-4 h-4 mr-2" />
              Play All
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeletePlaylist}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      {playlist.songs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>This playlist is empty</p>
          <p className="text-sm mt-1">Add songs from the DJ or search</p>
        </div>
      ) : (
        <div className="space-y-1">
          {playlist.songs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group ${
                  isCurrentSong ? "bg-primary/10" : ""
                }`}
              >
                <span className="w-6 text-center text-sm text-muted-foreground">
                  {index + 1}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (isCurrentSong && isPlaying) {
                      toggle();
                    } else {
                      handlePlaySong(song);
                    }
                  }}
                >
                  {isCurrentSong && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                {song.cover_url ? (
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                    <Music className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentSong ? "text-primary" : ""}`}>
                    {song.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(song.duration)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveSong(song.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
