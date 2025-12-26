import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  X, Radio, Music, Sparkles, Compass, Clock, 
  TrendingUp, Heart, Shuffle, Play
} from "lucide-react";
import { useRadioMode, MOODS, useTrendingSongs, useNewReleases, useForYou } from "@/hooks/useDiscovery";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

interface DiscoveryPanelProps {
  open: boolean;
  onClose: () => void;
}

const DiscoveryPanel = ({ open, onClose }: DiscoveryPanelProps) => {
  const [tab, setTab] = useState<"moods" | "radio" | "trending" | "new" | "foryou">("moods");
  const { setQueue, play } = usePlayer();
  const radio = useRadioMode();
  const { data: trending } = useTrendingSongs();
  const { data: newReleases } = useNewReleases();
  const { data: forYou } = useForYou();

  const handlePlayAll = (songs: any[]) => {
    if (songs.length > 0) {
      setQueue(songs);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Discover</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-2 p-4 overflow-x-auto">
              {[
                { id: "moods", label: "Moods", icon: Sparkles },
                { id: "radio", label: "Radio", icon: Radio },
                { id: "trending", label: "Trending", icon: TrendingUp },
                { id: "new", label: "New", icon: Clock },
                { id: "foryou", label: "For You", icon: Heart },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={tab === id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTab(id as any)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>

            <ScrollArea className="flex-1 p-4">
              {tab === "moods" && (
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map(mood => (
                    <button
                      key={mood.id}
                      className="p-4 rounded-xl text-left transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${mood.colors[0]}, ${mood.colors[1]})`,
                      }}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <p className="font-semibold text-white mt-2">{mood.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {tab === "radio" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Radio Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Endless music based on your taste
                      </p>
                    </div>
                    <Switch
                      checked={radio.isActive}
                      onCheckedChange={(checked) => {
                        if (checked) radio.startRadio();
                        else radio.stopRadio();
                      }}
                    />
                  </div>
                </div>
              )}

              {tab === "trending" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Top 20</h3>
                    <Button 
                      size="sm" 
                      onClick={() => handlePlayAll(trending || [])}
                      disabled={!trending?.length}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </Button>
                  </div>
                  {trending?.map((song, i) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => play(song)}
                    >
                      <span className="w-6 text-center text-muted-foreground font-medium">
                        {i + 1}
                      </span>
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        {song.cover_url && (
                          <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "new" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">New Releases</h3>
                    <Button 
                      size="sm" 
                      onClick={() => handlePlayAll(newReleases || [])}
                      disabled={!newReleases?.length}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Shuffle
                    </Button>
                  </div>
                  {newReleases?.map(song => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => play(song)}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        {song.cover_url && (
                          <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "foryou" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Personalized Mix</h3>
                    <Button 
                      size="sm" 
                      onClick={() => handlePlayAll(forYou || [])}
                      disabled={!forYou?.length}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  {forYou?.map(song => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => play(song)}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        {song.cover_url && (
                          <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiscoveryPanel;
