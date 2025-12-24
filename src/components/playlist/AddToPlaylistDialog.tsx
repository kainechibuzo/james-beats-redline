import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListMusic, Plus, Check } from "lucide-react";
import { usePlaylists, useAddToPlaylist } from "@/hooks/usePlaylists";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePlaylistDialog from "./CreatePlaylistDialog";

interface AddToPlaylistDialogProps {
  songId: string;
  trigger?: React.ReactNode;
}

const AddToPlaylistDialog = ({ songId, trigger }: AddToPlaylistDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: playlists, isLoading } = usePlaylists();
  const addToPlaylist = useAddToPlaylist();
  const { toast } = useToast();
  const [addedTo, setAddedTo] = useState<string[]>([]);

  const handleAdd = (playlistId: string, playlistName: string) => {
    addToPlaylist.mutate(
      { playlistId, songId },
      {
        onSuccess: () => {
          setAddedTo((prev) => [...prev, playlistId]);
          toast({ title: "Added to playlist", description: `Song added to "${playlistName}".` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add song.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAddedTo([]); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add to playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <CreatePlaylistDialog
            trigger={
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create new playlist
              </Button>
            }
          />
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading playlists...</div>
          ) : playlists && playlists.length > 0 ? (
            <ScrollArea className="h-60">
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAdd(playlist.id, playlist.name)}
                    disabled={addedTo.includes(playlist.id) || addToPlaylist.isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                      <ListMusic className="w-5 h-5 text-primary" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{playlist.name}</span>
                    {addedTo.includes(playlist.id) && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">No playlists yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;
