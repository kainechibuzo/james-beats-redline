import { useState } from "react";
import { Music, Heart, ListMusic, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSongs, useLikedSongs } from "@/hooks/useSongs";
import { usePlaylists, useDeletePlaylist } from "@/hooks/usePlaylists";
import { useAuth } from "@/contexts/AuthContext";
import SongCard from "@/components/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import CreatePlaylistDialog from "@/components/playlist/CreatePlaylistDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Tab = "songs" | "liked" | "playlists";

const Library = () => {
  const [activeTab, setActiveTab] = useState<Tab>("songs");
  const { user } = useAuth();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: likedSongs, isLoading: likedLoading } = useLikedSongs();
  const { data: playlists, isLoading: playlistsLoading } = usePlaylists();
  const deletePlaylist = useDeletePlaylist();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const userSongs = songs?.filter((song) => song.user_id === user?.id) || [];

  const tabs = [
    { id: "songs" as Tab, icon: Music, label: isMobile ? "Songs" : "My Songs", count: userSongs.length },
    { id: "liked" as Tab, icon: Heart, label: "Liked", count: likedSongs?.length || 0 },
    { id: "playlists" as Tab, icon: ListMusic, label: "Playlists", count: playlists?.length || 0 },
  ];

  const isLoading = activeTab === "songs" ? songsLoading : activeTab === "liked" ? likedLoading : playlistsLoading;
  const displaySongs = activeTab === "songs" ? userSongs : activeTab === "liked" ? likedSongs || [] : [];

  const handleDeletePlaylist = (playlistId: string, name: string) => {
    deletePlaylist.mutate(playlistId, {
      onSuccess: () => {
        toast({ title: "Playlist deleted", description: `"${name}" has been removed.` });
      },
    });
  };

  return (
    <div className="pb-32 animate-fade-in">
      <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'}`}>Your Library</h1>
        <Link to="/upload">
          <Button variant="glow" size={isMobile ? "sm" : "default"} className="gap-1 md:gap-2">
            <Plus className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            {isMobile ? "Upload" : "Upload Song"}
          </Button>
        </Link>
      </div>

      <div className={`flex gap-1 md:gap-2 ${isMobile ? 'mb-4 overflow-x-auto' : 'mb-8'}`}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size={isMobile ? "sm" : "default"}
            className={`gap-1 md:gap-2 ${isMobile ? 'text-xs px-2' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 bg-primary/20 rounded-full ${isMobile ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}`}>
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
          {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
            <div key={i} className="space-y-2 md:space-y-3">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-3 md:h-4 w-3/4" />
              <Skeleton className="h-2 md:h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTab === "playlists" ? (
        <>
          <div className="mb-4">
            <CreatePlaylistDialog />
          </div>
          {playlists && playlists.length > 0 ? (
            <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
              {playlists.map((playlist) => (
                <div key={playlist.id} className="relative group">
                  <Link to={`/playlist/${playlist.id}`}>
                    <div className={`bg-card rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer ${isMobile ? 'p-2' : 'p-4'}`}>
                      <div className={`aspect-square bg-gradient-to-br from-primary/30 to-primary/10 rounded-md flex items-center justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
                        <ListMusic className={`text-primary/50 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
                      </div>
                      <p className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>{playlist.name}</p>
                      <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{playlist.description || "Playlist"}</p>
                    </div>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{playlist.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center text-muted-foreground bg-card rounded-lg border border-border ${isMobile ? 'py-8' : 'py-12'}`}>
              <ListMusic className={`mx-auto mb-3 md:mb-4 opacity-50 ${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`} />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No playlists yet</h3>
              <p className="text-xs md:text-sm">Create your first playlist above!</p>
            </div>
          )}
        </>
      ) : displaySongs.length > 0 ? (
        <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'}`}>
          {displaySongs.map((song) => (
            <SongCard key={song.id} song={song} showDelete={activeTab === "songs"} />
          ))}
        </div>
      ) : (
        <div className={`text-center text-muted-foreground bg-card rounded-lg border border-border ${isMobile ? 'py-8' : 'py-12'}`}>
          <ListMusic className={`mx-auto mb-3 md:mb-4 opacity-50 ${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`} />
          <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {activeTab === "songs" ? "No uploaded songs yet" : "No liked songs yet"}
          </h3>
          <p className="text-xs md:text-sm mb-3 md:mb-4">
            {activeTab === "songs"
              ? "Upload your first track to see it here"
              : "Like songs to add them to your collection"}
          </p>
          {activeTab === "songs" && (
            <Link to="/upload">
              <Button variant="glow" size={isMobile ? "sm" : "default"}>Upload Song</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
