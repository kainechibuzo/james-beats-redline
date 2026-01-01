import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Settings, Volume2, Timer, Gauge, Waves, 
  SlidersHorizontal, Moon, Zap, Music, Palette
} from "lucide-react";
import { 
  useEqualizer, useSleepTimer,
  usePlaybackSpeed, useAudioNormalization,
  EQ_PRESETS, EQPresetName
} from "@/hooks/useAdvancedAudio";
import { useAccentColor, ACCENT_COLORS } from "@/hooks/useUIFeatures";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

interface AudioSettingsProps {
  open: boolean;
  onClose: () => void;
}

const AudioSettings = ({ open, onClose }: AudioSettingsProps) => {
  const { pause, crossfadeEnabled, crossfadeDuration, gaplessEnabled, setCrossfadeEnabled, setCrossfadeDuration, setGaplessEnabled } = usePlayer();
  const eq = useEqualizer();
  const sleepTimer = useSleepTimer(() => pause());
  const playbackSpeed = usePlaybackSpeed();
  const normalization = useAudioNormalization();
  const { currentColor, colors, setAccentColor } = useAccentColor();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-50"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Audio Settings</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Tabs defaultValue="equalizer" className="flex-1 flex flex-col">
              <TabsList className="px-4 pt-2 justify-start bg-transparent">
                <TabsTrigger value="equalizer" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Equalizer
                </TabsTrigger>
                <TabsTrigger value="playback" className="gap-2">
                  <Gauge className="w-4 h-4" />
                  Playback
                </TabsTrigger>
                <TabsTrigger value="effects" className="gap-2">
                  <Waves className="w-4 h-4" />
                  Effects
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Theme
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="equalizer" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Equalizer</span>
                      <Switch 
                        checked={eq.enabled} 
                        onCheckedChange={eq.setEnabled}
                      />
                    </div>

                    {eq.enabled && (
                      <>
                        <div className="flex gap-2 flex-wrap">
                          {(Object.keys(EQ_PRESETS) as EQPresetName[]).map(preset => (
                            <Button
                              key={preset}
                              variant={eq.preset === preset ? "default" : "outline"}
                              size="sm"
                              onClick={() => eq.applyPreset(preset)}
                              className="capitalize"
                            >
                              {preset.replace("_", " ")}
                            </Button>
                          ))}
                        </div>

                        <div className="flex items-end justify-between gap-2 h-48 px-2">
                          {eq.bands.map((band, i) => (
                            <div key={band.frequency} className="flex flex-col items-center gap-2 flex-1">
                              <div className="h-36 flex items-center">
                                <Slider
                                  orientation="vertical"
                                  value={[band.gain]}
                                  min={-12}
                                  max={12}
                                  step={1}
                                  onValueChange={([v]) => eq.setBandGain(i, v)}
                                  className="h-full"
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{band.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="playback" className="mt-0">
                  <div className="space-y-6">
                    {/* Sleep Timer */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" />
                        <span className="font-medium">Sleep Timer</span>
                      </div>
                      
                      {sleepTimer.isActive ? (
                        <div className="flex items-center justify-between bg-card p-4 rounded-lg">
                          <span>Time remaining: {formatTime(sleepTimer.remaining)}</span>
                          <Button variant="outline" size="sm" onClick={sleepTimer.cancel}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {[5, 15, 30, 45, 60, 90].map(mins => (
                            <Button
                              key={mins}
                              variant="outline"
                              size="sm"
                              onClick={() => sleepTimer.start(mins)}
                            >
                              {mins} min
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Playback Speed */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-primary" />
                        <span className="font-medium">Playback Speed</span>
                      </div>
                      <div className="flex gap-2">
                        {playbackSpeed.speeds.map(speed => (
                          <Button
                            key={speed}
                            variant={playbackSpeed.speed === speed ? "default" : "outline"}
                            size="sm"
                            onClick={() => playbackSpeed.setSpeed(speed)}
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Gapless Playback */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-primary" />
                          <span className="font-medium">Gapless Playback</span>
                        </div>
                        <Switch 
                          checked={gaplessEnabled} 
                          onCheckedChange={setGaplessEnabled}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Seamless transitions between songs without silence
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="mt-0">
                  <div className="space-y-6">
                    {/* Crossfade */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-medium">Crossfade</span>
                        </div>
                        <Switch 
                          checked={crossfadeEnabled} 
                          onCheckedChange={setCrossfadeEnabled}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Blend the end of one song with the start of the next
                      </p>
                      
                      {crossfadeEnabled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Duration</span>
                            <span className="text-sm">{crossfadeDuration}s</span>
                          </div>
                          <Slider
                            value={[crossfadeDuration]}
                            min={1}
                            max={12}
                            step={1}
                            onValueChange={([v]) => setCrossfadeDuration(v)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Audio Normalization */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">Loudness Normalization</span>
                        </div>
                        <Switch 
                          checked={normalization.enabled} 
                          onCheckedChange={normalization.setEnabled}
                        />
                      </div>
                      
                      {normalization.enabled && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Target Level</span>
                            <span className="text-sm">{normalization.targetLevel} LUFS</span>
                          </div>
                          <Slider
                            value={[normalization.targetLevel]}
                            min={-23}
                            max={-9}
                            step={1}
                            onValueChange={([v]) => normalization.setTargetLevel(v)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="theme" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <span className="font-medium">Accent Color</span>
                      <div className="grid grid-cols-4 gap-3">
                        {colors.map((color, i) => (
                          <button
                            key={color.name}
                            onClick={() => setAccentColor(i)}
                            className={cn(
                              "w-full aspect-square rounded-lg transition-all",
                              currentColor.name === color.name && "ring-2 ring-offset-2 ring-offset-background ring-white"
                            )}
                            style={{ backgroundColor: `hsl(${color.value})` }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioSettings;
