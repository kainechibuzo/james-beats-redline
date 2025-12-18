import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Disc3, Sparkles, Music, Plus, ListMusic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSongs, useRecentlyPlayed, useLikedSongs, Song } from "@/hooks/useSongs";
import { useCreatePlaylist } from "@/hooks/usePlaylists";
import { toast } from "sonner";

const MOODS = ["energetic", "chill", "focus", "party", "romantic", "workout"];

const DJSection = () => {
  const { user } = useAuth();
  const { data: songs } = useSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: likedSongs } = useLikedSongs();
  const createPlaylist = useCreatePlaylist();
  
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);

  const getDJMix = useCallback(async (mood?: string) => {
    setIsLoading(true);
    setDjMessage("");
    setSuggestedSongs([]);
    
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

      // Try to extract song suggestions from the message
      if (songs && songs.length > 0) {
        const suggested = songs.filter(song => 
          fullMessage.toLowerCase().includes(song.title.toLowerCase()) ||
          fullMessage.toLowerCase().includes(song.artist.toLowerCase())
        ).slice(0, 5);
        setSuggestedSongs(suggested);
      }
    } catch (error) {
      console.error("DJ error:", error);
      toast.error("DJ is taking a break. Try again!");
    } finally {
      setIsLoading(false);
    }
  }, [songs, recentlyPlayed, likedSongs]);

  const handleSaveAsPlaylist = async () => {
    if (!suggestedSongs.length) {
      // If no suggested songs, pick random from available
      const randomSongs = songs?.slice(0, 5) || [];
      if (!randomSongs.length) {
        toast.error("No songs available to create playlist");
        return;
      }
      
      try {
        await createPlaylist.mutateAsync({
          name: `DJ Mix - ${selectedMood || "Custom"}`,
          description: `AI-generated ${selectedMood || "custom"} playlist by DJ Beats`,
          songIds: randomSongs.map(s => s.id),
        });
        toast.success("Playlist created!");
      } catch {
        toast.error("Failed to create playlist");
      }
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: `DJ Mix - ${selectedMood || "Custom"}`,
        description: `AI-generated ${selectedMood || "custom"} playlist by DJ Beats`,
        songIds: suggestedSongs.map(s => s.id),
      });
      toast.success("Playlist created!");
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-br from-primary/20 via-card to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Disc3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              DJ Beats
              <Sparkles className="w-4 h-4 text-primary" />
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-powered music recommendations
            </p>
          </div>
        </div>

        {!user ? (
          <p className="text-muted-foreground text-sm">
            Sign in to get personalized DJ mixes based on your listening history!
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {MOODS.map(mood => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "glow" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setSelectedMood(mood);
                    getDJMix(mood);
                  }}
                  disabled={isLoading}
                  className="capitalize"
                >
                  {mood}
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
              >
                <Music className="w-4 h-4 mr-1" />
                Surprise Me
              </Button>
            </div>

            {isLoading && !djMessage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Disc3 className="w-4 h-4 animate-spin" />
                <span>DJ is mixing your tracks...</span>
              </div>
            )}

            {djMessage && (
              <div className="bg-background/50 rounded-lg p-4 mt-4 border border-border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{djMessage}</p>
                
                {suggestedSongs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <ListMusic className="w-3 h-3" />
                      Suggested tracks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSongs.map(song => (
                        <span 
                          key={song.id}
                          className="text-xs bg-secondary px-2 py-1 rounded"
                        >
                          {song.title} - {song.artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="glow"
                  size="sm"
                  className="mt-4"
                  onClick={handleSaveAsPlaylist}
                  disabled={createPlaylist.isPending}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {createPlaylist.isPending ? "Creating..." : "Save as Playlist"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DJSection;
