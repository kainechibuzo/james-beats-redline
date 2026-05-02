import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Pause, Clock, Users, Headphones, Plus, Check, Rss } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { useFollowedPodcasts, useTogglePodcastFollow, useFollowedPodcastFeed } from "@/hooks/usePodcastFollows";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATEGORIES = ["All", "Music", "Talk", "Culture", "Tech", "Sports", "News", "Comedy"];

const Podcasts = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedPodcast, setExpandedPodcast] = useState<string | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);
  const [audio] = useState(() => new Audio());
  const { user } = useAuth();
  const { data: followedSet } = useFollowedPodcasts();
  const { data: feed } = useFollowedPodcastFeed();
  const toggleFollow = useTogglePodcastFollow();

  const { data: podcasts, isLoading } = useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .order("subscriber_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: episodes } = useQuery({
    queryKey: ["podcast-episodes", expandedPodcast],
    queryFn: async () => {
      if (!expandedPodcast) return [];
      const { data, error } = await supabase
        .from("podcast_episodes")
        .select("*")
        .eq("podcast_id", expandedPodcast)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!expandedPodcast,
  });

  const filtered = podcasts?.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  const handlePlayEpisode = (episode: any) => {
    if (playingEpisode === episode.id) {
      audio.pause();
      setPlayingEpisode(null);
    } else {
      audio.src = episode.audio_url;
      audio.play().catch(() => {});
      setPlayingEpisode(episode.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Mic className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Podcasts</h1>
          <p className="text-muted-foreground text-sm">Discover shows & episodes</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {feed && feed.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Rss className="w-4 h-4 text-purple-500" /> Your Feed
            </h3>
            {feed.slice(0, 5).map((ep: any) => (
              <div key={ep.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                <Button size="icon" variant="ghost" onClick={() => handlePlayEpisode(ep)}>
                  {playingEpisode === ep.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ep.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{ep.podcast?.title}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card">
              <CardContent className="p-4 h-32" />
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((podcast) => (
              <Card
                key={podcast.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  expandedPodcast === podcast.id ? "border-purple-500" : ""
                }`}
                onClick={() => setExpandedPodcast(expandedPodcast === podcast.id ? null : podcast.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {podcast.cover_url ? (
                        <img src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
                      ) : (
                        <Mic className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{podcast.title}</h3>
                      {podcast.host && <p className="text-sm text-muted-foreground">by {podcast.host}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {podcast.category && <Badge variant="secondary" className="text-xs">{podcast.category}</Badge>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {podcast.subscriber_count}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={followedSet?.has(podcast.id) ? "secondary" : "default"}
                        className="mt-3 h-7 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            toast.error("Sign in to follow podcasts");
                            return;
                          }
                          toggleFollow.mutate({ podcastId: podcast.id, isFollowed: !!followedSet?.has(podcast.id) });
                        }}
                      >
                        {followedSet?.has(podcast.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {followedSet?.has(podcast.id) ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Episodes panel */}
          {expandedPodcast && episodes && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Headphones className="w-4 h-4" /> Episodes
                </h3>
                {episodes.length > 0 ? (
                  episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <Button size="icon" variant="ghost" onClick={() => handlePlayEpisode(ep)}>
                        {playingEpisode === ep.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ep.title}</p>
                        {ep.description && <p className="text-xs text-muted-foreground truncate">{ep.description}</p>}
                      </div>
                      {ep.duration && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(ep.duration)}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No episodes yet.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Mic className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No podcasts yet</h3>
            <p className="text-sm text-muted-foreground">Podcasts will appear here once added.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Podcasts;
