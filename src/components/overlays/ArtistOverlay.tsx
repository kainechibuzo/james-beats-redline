import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X, ChevronDown, Play, Shuffle, Music, Clock, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/hooks/useSongs";
import SongCard from "@/components/home/SongCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type OverlayState = "hidden" | "peek" | "full";

interface ArtistOverlayProps {
  artistName: string | null;
  onClose: () => void;
}

const ArtistOverlay = ({ artistName, onClose }: ArtistOverlayProps) => {
  const [state, setState] = useState<OverlayState>("hidden");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { play, setQueue } = usePlayer();
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Height configurations
  const peekHeight = typeof window !== "undefined" ? window.innerHeight * 0.5 : 400;
  const fullHeight = typeof window !== "undefined" ? window.innerHeight - 80 : 700; // Leave space for player

  useEffect(() => {
    if (artistName) {
      setState("peek");
      fetchArtistSongs(artistName);
    } else {
      setState("hidden");
    }
  }, [artistName]);

  const fetchArtistSongs = async (artist: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .ilike("artist", `%${artist}%`)
        .order("play_count", { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error("Error fetching artist songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (state === "peek") {
      if (velocity < -500 || offset < -100) {
        setState("full");
      } else if (velocity > 500 || offset > 100) {
        setState("hidden");
        setTimeout(onClose, 300);
      }
    } else if (state === "full") {
      if (velocity > 500 || offset > 150) {
        setState("peek");
      }
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  };

  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalPlays = songs.reduce((acc, song) => acc + (song.play_count || 0), 0);
  const albums = [...new Set(songs.map(s => s.album).filter(Boolean))];

  const getHeight = () => {
    switch (state) {
      case "peek": return peekHeight;
      case "full": return fullHeight;
      default: return 0;
    }
  };

  return (
    <AnimatePresence>
      {state !== "hidden" && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => {
              setState("hidden");
              setTimeout(onClose, 300);
            }}
          />

          {/* Overlay Panel */}
          <motion.div
            ref={containerRef}
            initial={{ y: "100%" }}
            animate={{ 
              y: 0,
              height: getHeight()
            }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-24 left-0 right-0 bg-card rounded-t-3xl z-50 overflow-hidden border-t border-border"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{artistName}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Disc className="w-3 h-3" />
                      {songs.length} songs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(totalDuration / 60)} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {state === "full" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setState("peek")}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setState("hidden");
                    setTimeout(onClose, 300);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-4 flex gap-3">
              <Button
                variant="glow"
                size="sm"
                onClick={handlePlayAll}
                disabled={songs.length === 0}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Play All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShuffle}
                disabled={songs.length === 0}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </Button>
            </div>

            {/* Songs List */}
            <ScrollArea className="flex-1 px-6" style={{ height: getHeight() - 180 }}>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : songs.length > 0 ? (
                <div className="space-y-2 pb-4">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer group"
                      onClick={() => play(song)}
                    >
                      <span className="w-6 text-center text-sm text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        {song.cover_url ? (
                          <img
                            src={song.cover_url}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <Music className="w-4 h-4 text-primary/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.album || "Single"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}` : "--:--"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          play(song);
                        }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No songs found for this artist</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArtistOverlay;
