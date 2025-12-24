import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylist, useRemoveFromPlaylist, useDeletePlaylist, useReorderPlaylistSongs } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2, ArrowLeft, Music, Clock, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Song } from "@/hooks/useSongs";

interface SortableSongItemProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onToggle: () => void;
  onRemove: () => void;
  formatDuration: (seconds: number | null) => string;
}

const SortableSongItem: React.FC<SortableSongItemProps> = ({
  song,
  index,
  isCurrentSong,
  isPlaying,
  onPlay,
  onToggle,
  onRemove,
  formatDuration,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group ${
        isCurrentSong ? "bg-primary/10" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <span className="w-6 text-center text-sm text-muted-foreground">
        {index + 1}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          if (isCurrentSong && isPlaying) {
            onToggle();
          } else {
            onPlay();
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
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: playlist, isLoading } = usePlaylist(id || "");
  const { currentSong, isPlaying, play, toggle, setQueue } = usePlayer();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const deletePlaylist = useDeletePlaylist();
  const reorderSongs = useReorderPlaylistSongs();
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (playlist?.songs) {
      setLocalSongs(playlist.songs);
    }
  }, [playlist?.songs]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && id) {
      const oldIndex = localSongs.findIndex((song) => song.id === String(active.id));
      const newIndex = localSongs.findIndex((song) => song.id === String(over.id));

      const newSongs = arrayMove(localSongs, oldIndex, newIndex) as Song[];
      setLocalSongs(newSongs);

      try {
        const songsWithPositions = newSongs.map((s, idx) => ({
          id: s.id,
          position: idx,
        }));
        await reorderSongs.mutateAsync({
          playlistId: id,
          songs: songsWithPositions,
        });
      } catch {
        toast.error("Failed to reorder songs");
        setLocalSongs(playlist?.songs || []);
      }
    }
  };

  const handlePlayAll = () => {
    if (!localSongs.length) return;
    setQueue(localSongs);
  };

  const handlePlaySong = (song: Song) => {
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
    <div className="space-y-6 pb-32">
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
            {localSongs.length} {localSongs.length === 1 ? "song" : "songs"}
          </p>

          <div className="flex gap-3">
            <Button variant="glow" onClick={handlePlayAll} disabled={!localSongs.length}>
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
      {localSongs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>This playlist is empty</p>
          <p className="text-sm mt-1">Add songs from the DJ or search</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSongs.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {localSongs.map((song, index) => (
                <SortableSongItem
                  key={song.id}
                  song={song}
                  index={index}
                  isCurrentSong={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlaySong(song)}
                  onToggle={toggle}
                  onRemove={() => handleRemoveSong(song.id)}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default PlaylistPage;
