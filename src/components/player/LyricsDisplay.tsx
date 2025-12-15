import { useEffect, useRef } from "react";
import { useLyrics, getCurrentLyricLine } from "@/hooks/useLyrics";
import { usePlayer } from "@/contexts/PlayerContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Info } from "lucide-react";

const LyricsDisplay = () => {
  const { currentSong, currentTime } = usePlayer();
  const { data: lyrics, isLoading } = useLyrics(currentSong?.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  const currentLineIndex = lyrics?.synced 
    ? getCurrentLyricLine(lyrics.content, currentTime)
    : -1;

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineRef.current && lyrics?.synced) {
      currentLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex, lyrics?.synced]);

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Music className="w-12 h-12 mb-4 opacity-50" />
        <p>Play a song to see lyrics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lyrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Music className="w-12 h-12 mb-4 opacity-50" />
        <p>No lyrics available for this song</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{currentSong.title}</h3>
        <span className="text-sm text-muted-foreground">{currentSong.artist}</span>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-4 pb-32">
          {lyrics.content.map((line, index) => (
            <div
              key={index}
              ref={index === currentLineIndex ? currentLineRef : undefined}
              className={`text-lg transition-all duration-300 ${
                index === currentLineIndex
                  ? "text-primary font-bold scale-105 origin-left"
                  : index < currentLineIndex
                  ? "text-muted-foreground/50"
                  : "text-foreground/80"
              }`}
            >
              {line.text || <span className="text-muted-foreground/30">♪</span>}
            </div>
          ))}
        </div>
      </ScrollArea>

      {lyrics.behind_the_lyrics && (
        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">Behind the Lyrics</span>
          </div>
          <p className="text-sm text-muted-foreground">{lyrics.behind_the_lyrics}</p>
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;
