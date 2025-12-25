import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import SongCard from "@/components/home/SongCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Shuffle, Users, Music, Clock } from "lucide-react";

const useArtistSongs = (artistName: string) => {
  return useQuery({
    queryKey: ["artist-songs", artistName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_public", true)
        .ilike("artist", artistName)
        .order("play_count", { ascending: false });

      if (error) throw error;
      return data as Song[];
    },
    enabled: !!artistName,
  });
};

const Artist = () => {
  const { name } = useParams<{ name: string }>();
  const artistName = decodeURIComponent(name || "");
  const { data: songs, isLoading } = useArtistSongs(artistName);
  const { setQueue, play } = usePlayer();
  const isMobile = useIsMobile();

  const totalPlays = songs?.reduce((acc, song) => acc + song.play_count, 0) || 0;
  const totalDuration = songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0;
  const uniqueAlbums = [...new Set(songs?.map(s => s.album).filter(Boolean))];

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      setQueue(songs);
    }
  };

  const handleShuffle = () => {
    if (songs && songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-muted-foreground">No songs found for this artist.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-64 md:h-80 bg-gradient-to-b from-primary/30 to-background"
        style={{
          backgroundImage: songs[0]?.cover_url ? `url(${songs[0].cover_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            <div 
              className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-primary/20 flex items-center justify-center shadow-xl border-4 border-primary/50"
              style={{
                backgroundImage: songs[0]?.cover_url ? `url(${songs[0].cover_url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!songs[0]?.cover_url && (
                <Users className={isMobile ? "w-10 h-10" : "w-16 h-16"} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Artist</p>
              <h1 className={`font-bold mb-2 ${isMobile ? "text-2xl" : "text-4xl md:text-5xl"}`}>
                {artistName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3 md:w-4 md:h-4" />
                  {songs.length} songs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {formatDuration(totalDuration)}
                </span>
                <span>{totalPlays.toLocaleString()} plays</span>
                {uniqueAlbums.length > 0 && (
                  <span>{uniqueAlbums.length} albums</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 md:p-8 flex items-center gap-3">
        <Button 
          size={isMobile ? "default" : "lg"}
          className="rounded-full gap-2 shadow-lg"
          onClick={handlePlayAll}
        >
          <Play className={isMobile ? "w-4 h-4" : "w-5 h-5"} fill="currentColor" />
          Play All
        </Button>
        <Button 
          variant="outline" 
          size={isMobile ? "default" : "lg"}
          className="rounded-full gap-2"
          onClick={handleShuffle}
        >
          <Shuffle className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
          Shuffle
        </Button>
      </div>

      {/* Popular Songs */}
      <div className="p-4 md:p-8 pt-0">
        <h2 className={`font-bold mb-4 ${isMobile ? "text-lg" : "text-2xl"}`}>
          Popular
        </h2>
        <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
          {songs.slice(0, 10).map((song) => (
            <SongCard key={song.id} song={song} compact showAlbum />
          ))}
        </div>
      </div>

      {/* All Songs */}
      {songs.length > 10 && (
        <div className="p-4 md:p-8 pt-0">
          <h2 className={`font-bold mb-4 ${isMobile ? "text-lg" : "text-2xl"}`}>
            All Songs
          </h2>
          <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
            {songs.slice(10).map((song) => (
              <SongCard key={song.id} song={song} compact showAlbum />
            ))}
          </div>
        </div>
      )}

      {/* Albums */}
      {uniqueAlbums.length > 0 && (
        <div className="p-4 md:p-8 pt-0">
          <h2 className={`font-bold mb-4 ${isMobile ? "text-lg" : "text-2xl"}`}>
            Albums
          </h2>
          <div className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"}`}>
            {uniqueAlbums.map((album) => {
              const albumSongs = songs.filter(s => s.album === album);
              const coverUrl = albumSongs[0]?.cover_url;
              return (
                <div 
                  key={album}
                  className="bg-card/50 rounded-lg p-3 hover:bg-card transition-colors cursor-pointer group"
                  onClick={() => setQueue(albumSongs)}
                >
                  <div className="aspect-square rounded-md overflow-hidden mb-2 relative">
                    {coverUrl ? (
                      <img src={coverUrl} alt={album || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Music className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-10 h-10 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate">{album}</p>
                  <p className="text-xs text-muted-foreground">{albumSongs.length} songs</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Artist;
