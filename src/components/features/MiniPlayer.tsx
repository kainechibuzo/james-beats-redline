import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";

const MiniPlayer = () => {
  const { currentSong, isPlaying, toggle, next, previous, currentTime, duration } = usePlayer();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!currentSong || isDismissed) return;
      
      const scrollY = window.scrollY;
      
      // Show mini player when scrolled down more than 100px
      if (scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Reset dismissed state when scrolling back to top
      if (scrollY < 50) {
        setIsDismissed(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentSong, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 w-80 max-w-[calc(100vw-2rem)]"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-2xl overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            {/* Album art */}
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {currentSong.cover_url ? (
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-primary/10"
                onClick={previous}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={toggle}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 hover:bg-primary/10"
                onClick={next}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniPlayer;
