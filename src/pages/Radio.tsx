import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio as RadioIcon, Play, Pause, Signal, Users, Music, Heart } from "lucide-react";
import { useLikedRadioStations, useToggleRadioLike } from "@/hooks/useRadioLikes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";

const GENRE_FILTERS = ["All", "Hip Hop", "R&B", "Afrobeats", "Pop", "Jazz", "Gospel", "Talk"];

const extractYouTubeId = (url: string): string | null => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
};

const Radio = () => {
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { user } = useAuth();
  const { data: likedSet } = useLikedRadioStations();
  const toggleLike = useToggleRadioLike();
  const player = usePlayer();
  const isPlaying = !!activeStation && player.isPlaying && player.currentSong?.id === `radio-${activeStation}`;

  const { data: stations, isLoading } = useQuery({
    queryKey: ["radio-stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radio_stations")
        .select("*")
        .order("listener_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredStations = stations?.filter(
    (s) => selectedGenre === "All" || s.genre === selectedGenre
  );

  const handlePlay = (station: any) => {
    if (activeStation === station.id && player.isPlaying) {
      player.pause();
      return;
    }
    const ytId = extractYouTubeId(station.stream_url);
    if (!ytId) {
      toast.error("Station has no playable YouTube source");
      return;
    }
    player.play({
      id: `radio-${station.id}`,
      user_id: null,
      title: station.name,
      artist: station.description || "Live Radio",
      album: null,
      genre: station.genre,
      duration: 0,
      file_url: null,
      cover_url: station.cover_url,
      thumbnail: station.cover_url,
      youtube_video_id: ytId,
      youtube_url: station.stream_url,
      source: "youtube",
      play_count: 0,
      is_public: true,
      created_at: new Date().toISOString(),
    });
    setActiveStation(station.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <RadioIcon className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Radio</h1>
          <p className="text-muted-foreground text-sm">Live stations & curated streams</p>
        </div>
      </div>

      {/* Genre filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GENRE_FILTERS.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className="whitespace-nowrap"
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-red-500">
        <Signal className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">LIVE NOW</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse bg-card">
              <CardContent className="p-4 h-24" />
            </Card>
          ))}
        </div>
      ) : filteredStations && filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStations.map((station) => (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                activeStation === station.id ? "border-red-500 bg-red-500/5" : ""
              }`}
              onClick={() => handlePlay(station)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {station.cover_url ? (
                    <img src={station.cover_url} alt={station.name} className="w-full h-full object-cover" />
                  ) : (
                    <RadioIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{station.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{station.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {station.genre && <Badge variant="secondary" className="text-xs">{station.genre}</Badge>}
                    {station.is_featured && (
                      <Badge variant="default" className="text-xs">Featured</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {station.listener_count}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user) {
                      toast.error("Sign in to like stations");
                      return;
                    }
                    toggleLike.mutate({ stationId: station.id, isLiked: !!likedSet?.has(station.id) });
                  }}
                  aria-label="Like station"
                >
                  <Heart className={cn("w-5 h-5", likedSet?.has(station.id) && "fill-red-500 text-red-500")} />
                </Button>
                <Button size="icon" variant="ghost" className="flex-shrink-0">
                  {activeStation === station.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No stations yet</h3>
            <p className="text-sm text-muted-foreground">Radio stations will appear here once added by admins.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Radio;
