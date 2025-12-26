import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Disc3, Sparkles, Music, Plus, ListMusic, Mic, MicOff, Volume2, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSongs, useRecentlyPlayed, useLikedSongs, Song } from "@/hooks/useSongs";
import { useCreatePlaylist } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SongCard from "@/components/home/SongCard";

const MOODS = ["energetic", "chill", "focus", "party", "romantic", "workout", "sad", "happy"];

const DJ = () => {
  const { user } = useAuth();
  const { data: songs } = useSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: likedSongs } = useLikedSongs();
  const createPlaylist = useCreatePlaylist();
  const { play, addToQueue } = usePlayer();
  
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [useVoice, setUseVoice] = useState(true);
  const [voiceFailed, setVoiceFailed] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Try to speak DJ message using TTS
  const speakMessage = async (message: string) => {
    if (!useVoice) return;
    
    try {
      // Use browser's speech synthesis as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Voice failed:", error);
      setVoiceFailed(true);
      toast.info("DJ switched to text mode");
    }
  };

  const getDJMix = useCallback(async (mood?: string) => {
    setIsLoading(true);
    setDjMessage("");
    setSuggestedSongs([]);
    setCurrentExplanation("");
    setVoiceFailed(false);
    
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

      // Extract song suggestions
      if (songs && songs.length > 0) {
        const suggested = songs.filter(song => 
          fullMessage.toLowerCase().includes(song.title.toLowerCase()) ||
          fullMessage.toLowerCase().includes(song.artist.toLowerCase())
        ).slice(0, 5);
        setSuggestedSongs(suggested);
        
        // Generate explanation for first song
        if (suggested.length > 0) {
          setCurrentExplanation(`This track matches your ${mood || 'current'} vibe perfectly based on your listening history.`);
        }
      }

      // Speak the message if voice is enabled
      if (useVoice && fullMessage) {
        speakMessage(fullMessage);
      }

    } catch (error) {
      console.error("DJ error:", error);
      toast.error("DJ is taking a break. Try again!");
      // Always provide a fallback text response
      setDjMessage("Yo! Looks like I'm having some technical difficulties, but I'm still here for you! Let me suggest some tracks based on your vibe...");
      if (songs && songs.length > 0) {
        const randomSongs = songs.slice(0, 5);
        setSuggestedSongs(randomSongs);
      }
    } finally {
      setIsLoading(false);
    }
  }, [songs, recentlyPlayed, likedSongs, useVoice]);

  const handleSaveAsPlaylist = async () => {
    const songsToSave = suggestedSongs.length > 0 ? suggestedSongs : songs?.slice(0, 5) || [];
    
    if (!songsToSave.length) {
      toast.error("No songs available to create playlist");
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: `DJ Mix - ${selectedMood || "Custom"}`,
        description: `AI-generated ${selectedMood || "custom"} playlist by DJ Beats`,
        songIds: songsToSave.map(s => s.id),
      });
      toast.success("DJ playlist created!");
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  const handlePlaySuggested = (song: Song) => {
    play(song);
    setCurrentExplanation(`Playing "${song.title}" - this track fits your ${selectedMood || 'current'} mood.`);
  };

  const handleSkip = () => {
    if (suggestedSongs.length > 1) {
      const remaining = suggestedSongs.slice(1);
      setSuggestedSongs(remaining);
      setCurrentExplanation(`Skipped! Here's another pick that matches your taste.`);
    } else {
      getDJMix(selectedMood || undefined);
    }
  };

  const handleLikeSuggestion = () => {
    toast.success("Got it! I'll find more tracks like this.");
  };

  const handleDislikeSuggestion = () => {
    toast.info("Noted! Refining my recommendations...");
    handleSkip();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Disc3 className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DJ Beats</h1>
        <p className="text-muted-foreground mb-6">Sign in to get personalized DJ mixes based on your listening history!</p>
        <Button variant="glow" asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-fade-in">
      {/* DJ Header */}
      <div className="bg-gradient-to-br from-primary/30 via-card to-primary/10 rounded-2xl p-6 mb-6 border border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Disc3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              DJ Beats
              <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered music curator
            </p>
          </div>
          
          {/* Voice Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="voice-mode"
              checked={useVoice}
              onCheckedChange={setUseVoice}
            />
            <Label htmlFor="voice-mode" className="text-sm cursor-pointer">
              {useVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Label>
          </div>
        </div>

        {/* Voice Status */}
        {voiceFailed && (
          <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-sm text-muted-foreground flex items-center gap-2">
            <MicOff className="w-4 h-4" />
            Voice unavailable - showing text responses
          </div>
        )}

        {/* Mood Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Loading State */}
        {isLoading && !djMessage && (
          <div className="flex items-center gap-3 text-muted-foreground p-4 bg-background/50 rounded-lg">
            <Disc3 className="w-5 h-5 animate-spin" />
            <span>DJ is mixing your tracks...</span>
          </div>
        )}

        {/* DJ Message */}
        {djMessage && (
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{djMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Current Recommendation */}
      {suggestedSongs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ListMusic className="w-5 h-5" />
            Current Pick
          </h2>
          
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                {suggestedSongs[0].cover_url ? (
                  <img
                    src={suggestedSongs[0].cover_url}
                    alt={suggestedSongs[0].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Music className="w-8 h-8 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{suggestedSongs[0].title}</h3>
                <p className="text-sm text-muted-foreground truncate">{suggestedSongs[0].artist}</p>
                {currentExplanation && (
                  <p className="text-xs text-primary mt-1">{currentExplanation}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="glow"
                size="sm"
                onClick={() => handlePlaySuggested(suggestedSongs[0])}
                className="flex-1"
              >
                Play Now
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleLikeSuggestion}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDislikeSuggestion}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleSkip}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Tracks List */}
      {suggestedSongs.length > 1 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Up Next</h2>
          <div className="space-y-2">
            {suggestedSongs.slice(1).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => handlePlaySuggested(song)}
              >
                <span className="w-6 text-center text-sm text-muted-foreground">{index + 2}</span>
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-primary/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to Playlist */}
      {suggestedSongs.length > 0 && (
        <div className="fixed bottom-28 left-0 right-0 px-4 z-30">
          <Button
            variant="glow"
            className="w-full gap-2"
            onClick={handleSaveAsPlaylist}
            disabled={createPlaylist.isPending}
          >
            <Plus className="w-4 h-4" />
            {createPlaylist.isPending ? "Creating..." : "Add DJ Playlist"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DJ;
