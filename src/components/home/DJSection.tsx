import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Disc3, Sparkles, Music } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSongs, useRecentlyPlayed, useLikedSongs } from "@/hooks/useSongs";
import { toast } from "sonner";

const MOODS = ["energetic", "chill", "focus", "party", "romantic", "workout"];

const DJSection = () => {
  const { user } = useAuth();
  const { data: songs } = useSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: likedSongs } = useLikedSongs();
  
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const getDJMix = useCallback(async (mood?: string) => {
    setIsLoading(true);
    setDjMessage("");
    
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
              setDjMessage(prev => prev + content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("DJ error:", error);
      toast.error("DJ is taking a break. Try again!");
    } finally {
      setIsLoading(false);
    }
  }, [songs, recentlyPlayed, likedSongs]);

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
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DJSection;
