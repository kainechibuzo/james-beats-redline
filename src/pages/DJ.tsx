import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Disc3, Sparkles, Music, Plus, ListMusic, Mic, MicOff, Volume2, RefreshCw, ThumbsUp, ThumbsDown, Calendar, Sun, Moon, Sunset } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSongs, useRecentlyPlayed, useLikedSongs, Song } from "@/hooks/useSongs";
import { useCreatePlaylist } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PremiumFeatureGate from "@/components/subscription/PremiumFeatureGate";

const MOODS = ["energetic", "chill", "focus", "party", "romantic", "workout", "sad", "happy"];

interface FullDayPlaylist {
  morning: Song[];
  afternoon: Song[];
  evening: Song[];
  night: Song[];
}

const DJ = () => {
  const { user } = useAuth();
  const { data: songs } = useSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: likedSongs } = useLikedSongs();
  const createPlaylist = useCreatePlaylist();
  const { play } = usePlayer();
  
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [previousMood, setPreviousMood] = useState<string | null>(null);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [useVoice, setUseVoice] = useState(true);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [fullDayPlaylist, setFullDayPlaylist] = useState<FullDayPlaylist | null>(null);
  const [isFullDayMode, setIsFullDayMode] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speak DJ message - Gen Z style, natural voice
  const speakMessage = useCallback((message: string) => {
    if (!useVoice || !message) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.15; // Slightly faster, more natural
        utterance.pitch = 1.1; // Slightly higher, more youthful
        utterance.volume = 0.9;
        
        // Try to get a younger sounding voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Google') ||
          v.name.includes('Female') ||
          v.lang.startsWith('en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Voice failed:", error);
    }
  }, [useVoice]);

  const getDJMix = useCallback(async (mood?: string, isFullDay = false) => {
    setIsLoading(true);
    setDjMessage("");
    setSuggestedSongs([]);
    setCurrentExplanation("");
    setFullDayPlaylist(null);
    setIsFullDayMode(isFullDay);
    
    // Detect vibe switch
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
            previousMood: isVibeSwitch ? previousMood : null,
            isFullDay,
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

      // Process full day playlist
      if (isFullDay && songs) {
        const dayPlaylist: FullDayPlaylist = {
          morning: [],
          afternoon: [],
          evening: [],
          night: [],
        };

        // Parse the response to extract songs for each time period
        const morningMatch = fullMessage.match(/MORNING.*?:(.*?)(?=AFTERNOON|$)/is);
        const afternoonMatch = fullMessage.match(/AFTERNOON.*?:(.*?)(?=EVENING|$)/is);
        const eveningMatch = fullMessage.match(/EVENING.*?:(.*?)(?=NIGHT|$)/is);
        const nightMatch = fullMessage.match(/NIGHT.*?:(.*?)$/is);

        const findSongsInText = (text: string | undefined): Song[] => {
          if (!text) return [];
          return songs.filter(song => 
            text.toLowerCase().includes(song.title.toLowerCase())
          ).slice(0, 5);
        };

        dayPlaylist.morning = findSongsInText(morningMatch?.[1]) || songs.slice(0, 3);
        dayPlaylist.afternoon = findSongsInText(afternoonMatch?.[1]) || songs.slice(3, 6);
        dayPlaylist.evening = findSongsInText(eveningMatch?.[1]) || songs.slice(6, 9);
        dayPlaylist.night = findSongsInText(nightMatch?.[1]) || songs.slice(9, 12);

        // Fallback if no songs found
        if (dayPlaylist.morning.length === 0) dayPlaylist.morning = songs.slice(0, 3);
        if (dayPlaylist.afternoon.length === 0) dayPlaylist.afternoon = songs.slice(3, 6);
        if (dayPlaylist.evening.length === 0) dayPlaylist.evening = songs.slice(6, 9);
        if (dayPlaylist.night.length === 0) dayPlaylist.night = songs.slice(9, 12);

        setFullDayPlaylist(dayPlaylist);
      } else {
        // Extract song suggestions for regular mode
        if (songs && songs.length > 0) {
          const suggested = songs.filter(song => 
            fullMessage.toLowerCase().includes(song.title.toLowerCase()) ||
            fullMessage.toLowerCase().includes(song.artist.toLowerCase())
          ).slice(0, 5);
          
          // Fallback to random songs if none matched
          setSuggestedSongs(suggested.length > 0 ? suggested : songs.slice(0, 5));
        }
      }

      // Only speak on vibe switch
      if (isVibeSwitch && fullMessage) {
        speakMessage(fullMessage);
      }

      // Update previous mood
      if (mood) {
        setPreviousMood(mood);
      }

    } catch (error) {
      console.error("DJ error:", error);
      toast.error("DJ is taking a break. Try again!");
      setDjMessage("lowkey having tech issues but we good, here's some fire tracks fr");
      if (songs && songs.length > 0) {
        setSuggestedSongs(songs.slice(0, 5));
      }
    } finally {
      setIsLoading(false);
    }
  }, [songs, recentlyPlayed, likedSongs, previousMood, speakMessage]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    getDJMix(mood);
  };

  const handleFullDayPlaylist = () => {
    setSelectedMood(null);
    getDJMix(undefined, true);
  };

  const handleSaveAsPlaylist = async () => {
    let songsToSave: Song[] = [];
    
    if (fullDayPlaylist) {
      songsToSave = [
        ...fullDayPlaylist.morning,
        ...fullDayPlaylist.afternoon,
        ...fullDayPlaylist.evening,
        ...fullDayPlaylist.night,
      ];
    } else {
      songsToSave = suggestedSongs.length > 0 ? suggestedSongs : songs?.slice(0, 5) || [];
    }
    
    if (!songsToSave.length) {
      toast.error("No songs available to create playlist");
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: isFullDayMode ? "DJ Full Day Mix" : `DJ Mix - ${selectedMood || "Custom"}`,
        description: isFullDayMode 
          ? "AI-generated full day playlist by DJ Beats"
          : `AI-generated ${selectedMood || "custom"} playlist by DJ Beats`,
        songIds: songsToSave.map(s => s.id),
      });
      toast.success("DJ playlist created!");
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  const handlePlaySuggested = (song: Song) => {
    play(song);
  };

  const handleSkip = () => {
    if (suggestedSongs.length > 1) {
      setSuggestedSongs(suggestedSongs.slice(1));
    } else {
      getDJMix(selectedMood || undefined);
    }
  };

  const handleLikeSuggestion = () => {
    toast.success("bet, finding more like this");
  };

  const handleDislikeSuggestion = () => {
    toast.info("no cap, skipping that one");
    handleSkip();
  };

  const renderTimeSection = (title: string, icon: React.ReactNode, songs: Song[], gradient: string) => (
    <div className={`rounded-xl p-4 ${gradient} border border-border mb-4`}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
            onClick={() => handlePlaySuggested(song)}
          >
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
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Disc3 className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DJ Beats</h1>
        <p className="text-muted-foreground mb-6">Sign in to get personalized DJ mixes!</p>
        <Button variant="glow" asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <PremiumFeatureGate featureName="AI DJ">
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
              your AI music curator fr fr
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

        {/* Mood Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MOODS.map(mood => (
            <Button
              key={mood}
              variant={selectedMood === mood ? "glow" : "secondary"}
              size="sm"
              onClick={() => handleMoodSelect(mood)}
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

        {/* Full Day Playlist Button */}
        <Button
          variant="glow"
          size="sm"
          onClick={handleFullDayPlaylist}
          disabled={isLoading}
          className="w-full gap-2"
        >
          <Calendar className="w-4 h-4" />
          Mix Full Day Playlist
        </Button>

        {/* Loading State */}
        {isLoading && !djMessage && (
          <div className="flex items-center gap-3 text-muted-foreground p-4 bg-background/50 rounded-lg mt-4">
            <Disc3 className="w-5 h-5 animate-spin" />
            <span>DJ is mixing your tracks...</span>
          </div>
        )}

        {/* DJ Message - Only shown on vibe switch */}
        {djMessage && previousMood && selectedMood && previousMood !== selectedMood && (
          <div className="bg-background/50 rounded-lg p-4 border border-border mt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed flex-1">{djMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Day Playlist View */}
      {fullDayPlaylist && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Full Day Mix
          </h2>
          
          {renderTimeSection("Morning (6AM-12PM)", <Sun className="w-4 h-4 text-yellow-500" />, fullDayPlaylist.morning, "bg-gradient-to-r from-yellow-500/10 to-orange-500/10")}
          {renderTimeSection("Afternoon (12PM-6PM)", <Sun className="w-4 h-4 text-orange-500" />, fullDayPlaylist.afternoon, "bg-gradient-to-r from-orange-500/10 to-red-500/10")}
          {renderTimeSection("Evening (6PM-10PM)", <Sunset className="w-4 h-4 text-purple-500" />, fullDayPlaylist.evening, "bg-gradient-to-r from-purple-500/10 to-pink-500/10")}
          {renderTimeSection("Night (10PM+)", <Moon className="w-4 h-4 text-blue-500" />, fullDayPlaylist.night, "bg-gradient-to-r from-blue-500/10 to-indigo-500/10")}
        </div>
      )}

      {/* Current Recommendation */}
      {suggestedSongs.length > 0 && !fullDayPlaylist && (
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
      {suggestedSongs.length > 1 && !fullDayPlaylist && (
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
      {(suggestedSongs.length > 0 || fullDayPlaylist) && (
        <div className="fixed bottom-28 left-0 right-0 px-4 z-30">
          <Button
            variant="glow"
            className="w-full gap-2"
            onClick={handleSaveAsPlaylist}
            disabled={createPlaylist.isPending}
          >
            <Plus className="w-4 h-4" />
            {createPlaylist.isPending ? "Creating..." : isFullDayMode ? "Save Full Day Playlist" : "Add DJ Playlist"}
          </Button>
        </div>
      )}
    </div>
    </PremiumFeatureGate>
  );
};

export default DJ;
