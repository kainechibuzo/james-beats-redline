import * as React from "react";
import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Play, GripVertical, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { Song, useUpdateSongOrder } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import EditSongDialog from "@/components/songs/EditSongDialog";
import { toast } from "sonner";

interface DraggableTrackListProps {
  songs: Song[];
  albumUserId?: string;
}

interface SortableTrackProps {
  song: Song;
  index: number;
  allSongs: Song[];
  canEdit: boolean;
  onEdit: (song: Song) => void;
}

const SortableTrack: React.FC<SortableTrackProps> = ({ song, index, allSongs, canEdit, onEdit }) => {
  const { playSong } = usePlayer();
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

  const handlePlay = () => {
    // Start playback from this track, with the full album as the queue.
    playSong(song, allSongs);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors items-center"
    >
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      {!canEdit && <div className="w-4" />}
      
      <div onClick={handlePlay} className="w-8 flex items-center justify-center">
        <span className="text-muted-foreground group-hover:hidden">{index + 1}</span>
        <Play className="w-4 h-4 hidden group-hover:block text-primary" />
      </div>

      <div onClick={handlePlay} className="flex items-center gap-3 min-w-0">
        {song.cover_url && (
          <img src={song.cover_url} alt="" className="w-10 h-10 rounded object-cover" />
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{song.title}</p>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
      </div>

      <span className="text-sm text-muted-foreground">
        {song.duration ? formatDuration(song.duration) : "--:--"}
      </span>

      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(song);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      )}
      {!canEdit && <div className="w-10" />}
    </div>
  );
};

const DraggableTrackList = ({ songs, albumUserId }: DraggableTrackListProps) => {
  const { user } = useAuth();
  const updateOrder = useUpdateSongOrder();
  const [items, setItems] = useState<Song[]>(songs);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const canEdit = user?.id === albumUserId;

  React.useEffect(() => {
    setItems(songs);
  }, [songs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === String(active.id));
      const newIndex = items.findIndex((item) => item.id === String(over.id));
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Save new order
      const orderUpdates = newItems.map((song: Song, idx: number) => ({
        id: song.id,
        position: idx,
      }));

      updateOrder.mutate(orderUpdates, {
        onSuccess: () => {
          toast.success("Track order updated");
        },
        onError: () => {
          setItems(songs); // Revert on error
          toast.error("Failed to update order");
        },
      });
    }
  };

  return (
    <>
      <div className="space-y-1">
        <div className={`grid gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border ${canEdit ? 'grid-cols-[auto_auto_1fr_auto_auto]' : 'grid-cols-[auto_auto_1fr_auto_auto]'}`}>
          {canEdit ? <span className="w-4" /> : <div className="w-4" />}
          <span className="w-8">#</span>
          <span>Title</span>
          <Clock className="w-4 h-4" />
          {canEdit ? <span className="w-10" /> : <div className="w-10" />}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {items.map((song: Song, index: number) => (
              <SortableTrack
                key={song.id}
                song={song}
                index={index}
                allSongs={items}
                canEdit={canEdit}
                onEdit={setEditingSong}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <EditSongDialog
        song={editingSong}
        open={!!editingSong}
        onOpenChange={(open) => !open && setEditingSong(null)}
      />
    </>
  );
};

export default DraggableTrackList;