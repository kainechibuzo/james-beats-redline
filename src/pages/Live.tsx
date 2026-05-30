import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tv, Play, Pause, Signal, Users, Calendar, Newspaper, Trophy } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", label: "All", icon: Tv },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "news", label: "News", icon: Newspaper },
  { id: "music", label: "Music", icon: Signal },
  { id: "talk", label: "Talk", icon: Tv },
];

const extractYouTubeId = (url: string): string | null => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
};

const Live = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const player = usePlayer();
  const isPlaying = !!activeStream && player.isPlaying && player.currentSong?.id === `live-${activeStream}`;

  const { data: streams, isLoading } = useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("is_live", { ascending: false })
        .order("viewer_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = streams?.filter(
    (s) => selectedCategory === "all" || s.category === selectedCategory
  );

  const liveNow = filtered?.filter((s) => s.is_live) || [];
  const upcoming = filtered?.filter((s) => !s.is_live && s.scheduled_at) || [];

  const handlePlay = (stream: any) => {
    if (activeStream === stream.id && player.isPlaying) {
      player.pause();
      return;
    }
    const ytId = extractYouTubeId(stream.stream_url);
    if (!ytId) {
      toast.error("Stream has no playable YouTube source");
      return;
    }
    player.play({
      id: `live-${stream.id}`,
      user_id: null,
      title: stream.title,
      artist: stream.host_name || stream.category || "Live",
      album: null,
      genre: stream.category,
      duration: 0,
      file_url: null,
      cover_url: stream.cover_url,
      thumbnail: stream.cover_url,
      youtube_video_id: ytId,
      youtube_url: stream.stream_url,
      source: "youtube",
      play_count: 0,
      is_public: true,
      created_at: new Date().toISOString(),
    });
    setActiveStream(stream.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <Tv className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Live</h1>
          <p className="text-muted-foreground text-sm">Sports commentary, news & live audio</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap flex items-center gap-1"
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card">
              <CardContent className="p-4 h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live Now */}
          {liveNow.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-red-500 animate-pulse" />
                <h2 className="font-semibold text-lg">Live Now</h2>
                <Badge variant="destructive" className="text-xs">LIVE</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveNow.map((stream) => (
                  <Card
                    key={stream.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      activeStream === stream.id ? "border-green-500 bg-green-500/5" : ""
                    }`}
                    onClick={() => handlePlay(stream)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {stream.cover_url ? (
                          <img src={stream.cover_url} alt={stream.title} className="w-full h-full object-cover" />
                        ) : (
                          <Tv className="w-8 h-8 text-muted-foreground" />
                        )}
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{stream.title}</h3>
                        {stream.host_name && (
                          <p className="text-sm text-muted-foreground">{stream.host_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">{stream.category}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {stream.viewer_count} listening
                          </span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="flex-shrink-0">
                        {activeStream === stream.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Upcoming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((stream) => (
                  <Card key={stream.id} className="opacity-75">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Tv className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{stream.title}</h3>
                        {stream.host_name && <p className="text-sm text-muted-foreground">{stream.host_name}</p>}
                        {stream.scheduled_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(stream.scheduled_at).toLocaleDateString()} at{" "}
                            {new Date(stream.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {liveNow.length === 0 && upcoming.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Tv className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No live streams</h3>
                <p className="text-sm text-muted-foreground">Live sports, news, and commentary streams will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Live;
