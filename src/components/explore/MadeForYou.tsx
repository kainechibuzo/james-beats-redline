import { useState } from "react";
import { Wand2, Play, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSongs } from "@/hooks/useSongs";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Recommendation {
  genres: string[];
  moods: string[];
  discovery: string;
  timeOfDay?: string;
  reasoning: string;
}

const PLAYLIST_GRADIENTS = [
  "from-violet-600 via-purple-500 to-fuchsia-500",
  "from-emerald-600 via-teal-500 to-cyan-500",
  "from-rose-600 via-pink-500 to-orange-400",
  "from-blue-600 via-indigo-500 to-violet-500",
  "from-amber-500 via-orange-500 to-red-500",
];

const MadeForYou = () => {
  const { user } = useAuth();
  const { data: allSongs } = useSongs();
  const { playSong } = usePlayer();
  const isMobile = useIsMobile();
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlaylists, setGeneratedPlaylists] = useState<
    { name: string; songs: any[]; gradient: string }[]
  >([]);

  const buildPlaylist = async (prompt: string): Promise<any[]> => {
    const { data, error } = await supabase.functions.invoke("generate-playlist", {
      body: { type: "ai_generated", userId: user?.id, mood: prompt },
    });
    if (error) throw error;
    const songIds: string[] = data?.playlist?.songs || [];
    if (!songIds.length || !allSongs) return [];
    const map = new Map(allSongs.map((s) => [s.id, s]));
    return songIds.map((id) => map.get(id)).filter(Boolean) as any[];
  };

  const generateRecommendations = async () => {
    if (!allSongs || allSongs.length === 0) {
      toast.error("No songs available to generate recommendations");
      return;
    }
    if (!user) {
      toast.error("Sign in to generate personalized playlists");
      return;
    }

    setIsLoading(true);
    try {
      const sampleSongs = [...allSongs].sort(() => Math.random() - 0.5).slice(0, 10);

      const { data, error } = await supabase.functions.invoke("smart-recommendations", {
        body: { songs: sampleSongs, count: 5 },
      });

      if (error) throw error;
      setRecommendations(data);

      // Build prompts for AI-curated playlists
      const prompts: { name: string; prompt: string }[] = [];
      (data.genres || []).slice(0, 2).forEach((g: string) =>
        prompts.push({ name: `${g} Mix`, prompt: `A playlist of ${g} songs the user will love` })
      );
      (data.moods || []).slice(0, 2).forEach((m: string) =>
        prompts.push({ name: m, prompt: `${m} vibes playlist` })
      );
      if (data.discovery) {
        prompts.push({ name: "Discovery", prompt: data.discovery });
      }

      // Resolve all in parallel via AI playlist generator
      const results = await Promise.all(
        prompts.map(async (p, i) => {
          try {
            const songs = await buildPlaylist(p.prompt);
            if (!songs.length) return null;
            return {
              name: p.name.length > 30 ? p.name.slice(0, 30) + "…" : p.name,
              songs,
              gradient: PLAYLIST_GRADIENTS[i % PLAYLIST_GRADIENTS.length],
            };
          } catch {
            return null;
          }
        })
      );

      const playlists = results.filter(Boolean) as any[];
      if (!playlists.length) throw new Error("Empty results");

      setGeneratedPlaylists(playlists);
      toast.success("Playlists generated just for you!");
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
      const fallback = [
        { name: "Chill Vibes", songs: [...allSongs].sort(() => Math.random() - 0.5).slice(0, 15), gradient: PLAYLIST_GRADIENTS[0] },
        { name: "Energy Boost", songs: [...allSongs].sort(() => Math.random() - 0.5).slice(0, 15), gradient: PLAYLIST_GRADIENTS[1] },
        { name: "Deep Focus", songs: [...allSongs].sort(() => Math.random() - 0.5).slice(0, 15), gradient: PLAYLIST_GRADIENTS[2] },
      ];
      setGeneratedPlaylists(fallback);
      toast.info("Here are some curated playlists for you");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-bold flex items-center gap-2 ${isMobile ? "text-lg" : "text-xl"}`}>
          <Wand2 className="w-5 h-5 text-primary" />
          Made for You
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={generateRecommendations}
          disabled={isLoading}
          className="gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : generatedPlaylists.length > 0 ? (
            <RefreshCw className="w-3.5 h-3.5" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          {generatedPlaylists.length > 0 ? "Refresh" : "Generate"}
        </Button>
      </div>

      {generatedPlaylists.length === 0 && !isLoading ? (
        <button
          onClick={generateRecommendations}
          className="w-full rounded-xl border border-dashed border-border p-8 flex flex-col items-center gap-3 hover:bg-card/50 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">Get AI-powered playlists</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap to generate personalized playlists based on your taste
            </p>
          </div>
        </button>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {generatedPlaylists.map((playlist, i) => (
              <button
                key={i}
                onClick={() => {
                  if (playlist.songs.length > 0) {
                    playSong(playlist.songs[0], playlist.songs);
                  }
                }}
                className="group relative aspect-square rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${playlist.gradient}`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative h-full flex flex-col justify-between p-3 md:p-4">
                  <div className="text-left">
                    <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md">
                      {playlist.name}
                    </p>
                    <p className="text-white/70 text-[10px] md:text-xs mt-1">
                      {playlist.songs.length} tracks
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {recommendations?.reasoning && (
            <p className="text-xs text-muted-foreground mt-3 italic">
              💡 {recommendations.reasoning}
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default MadeForYou;
