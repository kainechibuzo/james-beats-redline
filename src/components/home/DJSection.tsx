import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Disc3, Sparkles, Music, Plus, ListMusic, Mic2, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSongs, useRecentlyPlayed, useLikedSongs, Song } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCreatePlaylist } from "@/hooks/usePlaylists";
import { toast } from "sonner";

const MOODS = [
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "chill", label: "Chill", emoji: "🌊" },
  { id: "focus", label: "Focus", emoji: "🎯" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "workout", label: "Workout", emoji: "💪" },
];

const DJSection = () => {
  const { user } = useAuth();
  const { data: songs } = useSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: likedSongs } = useLikedSongs();
  const { playSong } = usePlayer();
  const createPlaylist = useCreatePlaylist();
  
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [previousMood, setPreviousMood] = useState<string | null>(null);

  const getDJMix = useCallback(async (mood?: string) => {
    setIsLoading(true);
    setDjMessage("");
    setSuggestedSongs([]);
    
    const isVibeSwitch = previousMood && mood && previousMood !== mood;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dj-mix`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            recentlyPlayed: recentlyPlayed || [],
            likedSongs: likedSongs || [],
            allSongs: songs || [],
            mood,
            previousMood: isVibeSwitch ? previousMood : undefined,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Try again later.");
          return;
        }
        if (response.status === 402) {
          toast.error("Usage limit reached.");
          return;
        }
        throw new Error("Failed to get DJ mix");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullMessage += content;
              setDjMessage(prev => prev + content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Extract song suggestions from the message
      if (songs && songs.length > 0) {
        const suggested = songs.filter(song => 
          fullMessage.toLowerCase().includes(song.title.toLowerCase()) ||
          fullMessage.toLowerCase().includes(song.artist.toLowerCase())
        ).slice(0, 5);
        setSuggestedSongs(suggested);
      }

      setPreviousMood(mood || null);
    } catch (error) {
      console.error("DJ error:", error);
      toast.error("DJ is taking a break. Try again!");
    } finally {
      setIsLoading(false);
    }
  }, [songs, recentlyPlayed, likedSongs, previousMood]);

  const handlePlaySuggested = () => {
    if (suggestedSongs.length > 0) {
      playSong(suggestedSongs[0], suggestedSongs);
      toast.success("Playing DJ's picks!");
    }
  };

  const handleSaveAsPlaylist = async () => {
    const playlistSongs = suggestedSongs.length > 0 ? suggestedSongs : songs?.slice(0, 5) || [];
    if (!playlistSongs.length) {
      toast.error("No songs available to create playlist");
      return;
    }
    
    try {
      await createPlaylist.mutateAsync({
        name: `DJ Mix - ${selectedMood || "Custom"}`,
        description: `AI-curated ${selectedMood || "custom"} playlist by DJ Beats`,
        songIds: playlistSongs.map(s => s.id),
      });
      toast.success("Playlist created!");
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-br from-primary/20 via-card to-primary/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Mic2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                DJ Beats
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                AI-powered music curator
              </p>
            </div>
          </div>

          {!user ? (
            <p className="text-muted-foreground text-sm bg-background/50 rounded-lg p-4">
              Sign in to get personalized DJ mixes based on your listening history!
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {MOODS.map(mood => (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "glow" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setSelectedMood(mood.id);
                      getDJMix(mood.id);
                    }}
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <span>{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMood(null);
                    getDJMix();
                  }}
                  disabled={isLoading}
                  className="border-dashed"
                >
                  <Disc3 className="w-4 h-4 mr-1" />
                  Surprise Me
                </Button>
              </div>

              {isLoading && !djMessage && (
                <div className="flex items-center gap-3 text-muted-foreground bg-background/50 rounded-lg p-4">
                  <div className="relative">
                    <Disc3 className="w-6 h-6 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  </div>
                  <span className="font-medium">DJ is mixing your tracks...</span>
                </div>
              )}

              {djMessage && (
                <div className="bg-background/70 backdrop-blur-sm rounded-xl p-4 mt-4 border border-border/50 shadow-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mic2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{djMessage}</p>
                  </div>
                  
                  {suggestedSongs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 font-medium">
                        <ListMusic className="w-3 h-3" />
                        Ready to play:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSongs.map(song => (
                          <span 
                            key={song.id}
                            className="text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-full font-medium"
                          >
                            {song.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    {suggestedSongs.length > 0 && (
                      <Button
                        variant="glow"
                        size="sm"
                        onClick={handlePlaySuggested}
                        className="flex-1"
                      >
                        <Music className="w-4 h-4 mr-1" />
                        Play Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveAsPlaylist}
                      disabled={createPlaylist.isPending}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {createPlaylist.isPending ? "Saving..." : "Save Playlist"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DJSection;
