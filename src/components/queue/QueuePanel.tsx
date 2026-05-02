import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ListMusic, Play, GripVertical } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Song } from "@/hooks/useSongs";

interface QueuePanelProps {
  trigger?: React.ReactNode;
}

const SortableQueueItem: React.FC<{
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
}> = ({ song, index, onPlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${song.id}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors group",
        isDragging && "opacity-50 bg-secondary"
      )}
    >
      <button
        className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
      <img
        src={song.cover_url || "/placeholder.svg"}
        alt={song.title}
        className="w-10 h-10 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      <button
        onClick={() => onPlay(song)}
        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
};

const QueuePanel = ({ trigger }: QueuePanelProps) => {
  const { queue, currentSong, play, clearQueue, removeFromQueue, reorderQueue } = usePlayer();
  const [localQueue, setLocalQueue] = React.useState(queue);

  React.useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

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
      const oldIndex = localQueue.findIndex((s: Song, i: number) => `${s.id}-${i}` === active.id);
      const newIndex = localQueue.findIndex((s: Song, i: number) => `${s.id}-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQueue = arrayMove(localQueue, oldIndex, newIndex);
        setLocalQueue(newQueue);
        reorderQueue(newQueue);
      }
    }
  };

  const sortableItems = localQueue.map((song: Song, index: number) => `${song.id}-${index}`);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <ListMusic className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Queue</SheetTitle>
            {queue.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearQueue} className="text-xs">
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        {currentSong && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Now Playing</p>
            <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg">
              <img
                src={currentSong.cover_url || "/placeholder.svg"}
                alt={currentSong.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Up Next ({localQueue.length}) - Drag to reorder
          </p>
          {localQueue.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {localQueue.map((song: Song, index: number) => {
                      const itemKey = `${song.id}-${index}`;
                      return (
                        <SortableQueueItem
                          key={itemKey}
                          song={song}
                          index={index}
                          onPlay={play}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs">Add songs to see them here</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QueuePanel;
