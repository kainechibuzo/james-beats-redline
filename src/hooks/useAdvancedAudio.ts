import { useState, useCallback, useRef, useEffect } from "react";

// 1. Equalizer with presets
export interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

const DEFAULT_BANDS: EqualizerBand[] = [
  { frequency: 60, gain: 0, label: "60Hz" },
  { frequency: 170, gain: 0, label: "170Hz" },
  { frequency: 310, gain: 0, label: "310Hz" },
  { frequency: 600, gain: 0, label: "600Hz" },
  { frequency: 1000, gain: 0, label: "1kHz" },
  { frequency: 3000, gain: 0, label: "3kHz" },
  { frequency: 6000, gain: 0, label: "6kHz" },
  { frequency: 12000, gain: 0, label: "12kHz" },
  { frequency: 14000, gain: 0, label: "14kHz" },
  { frequency: 16000, gain: 0, label: "16kHz" },
];

export const EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass_boost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  treble_boost: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6],
  vocal: [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0],
  rock: [4, 3, 2, 1, 0, -1, 0, 2, 3, 4],
  pop: [-1, 0, 2, 3, 4, 3, 2, 1, 0, -1],
  jazz: [3, 2, 1, 2, -2, -2, 0, 1, 2, 3],
  classical: [4, 3, 2, 1, 0, 0, 0, 2, 3, 4],
  electronic: [4, 3, 0, -2, -1, 0, 1, 3, 4, 4],
  hiphop: [5, 4, 3, 1, -1, -1, 1, 2, 3, 2],
} as const;

export type EQPresetName = keyof typeof EQ_PRESETS;

export const useEqualizer = () => {
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_BANDS);
  const [preset, setPreset] = useState<EQPresetName>("flat");
  const [enabled, setEnabled] = useState(false);

  const setBandGain = useCallback((index: number, gain: number) => {
    setBands(prev => prev.map((band, i) => 
      i === index ? { ...band, gain: Math.max(-12, Math.min(12, gain)) } : band
    ));
    setPreset("flat");
  }, []);

  const applyPreset = useCallback((presetName: EQPresetName) => {
    const gains = EQ_PRESETS[presetName];
    setBands(prev => prev.map((band, i) => ({ ...band, gain: gains[i] })));
    setPreset(presetName);
  }, []);

  const reset = useCallback(() => {
    applyPreset("flat");
  }, [applyPreset]);

  return { bands, preset, enabled, setBandGain, applyPreset, reset, setEnabled };
};

// 2. Sleep Timer
export const useSleepTimer = (onTimerEnd: () => void) => {
  const [isActive, setIsActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<number>();

  const start = useCallback((minutes: number) => {
    setIsActive(true);
    setRemaining(minutes * 60);
  }, []);

  const cancel = useCallback(() => {
    setIsActive(false);
    setRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isActive && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, remaining, onTimerEnd]);

  return { isActive, remaining, start, cancel };
};

// 3. Crossfade
export const useCrossfade = (defaultDuration = 5) => {
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState(defaultDuration);
  return { enabled, duration, setEnabled, setDuration };
};

// 4. Playback Speed
export const usePlaybackSpeed = () => {
  const [speed, setSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  const nextSpeed = useCallback(() => {
    setSpeed(prev => {
      const idx = speeds.indexOf(prev);
      return speeds[(idx + 1) % speeds.length];
    });
  }, []);

  return { speed, speeds, setSpeed, nextSpeed };
};

// 5. Audio Normalization
export const useAudioNormalization = () => {
  const [enabled, setEnabled] = useState(false);
  const [targetLevel, setTargetLevel] = useState(-14); // LUFS
  return { enabled, targetLevel, setEnabled, setTargetLevel };
};

// 6. Gapless Playback
export const useGaplessPlayback = () => {
  const [enabled, setEnabled] = useState(true);
  return { enabled, setEnabled };
};

// 7. A-B Repeat
export const useABRepeat = () => {
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const setA = useCallback((time: number) => {
    setPointA(time);
    setPointB(null);
    setEnabled(false);
  }, []);

  const setB = useCallback((time: number) => {
    if (pointA !== null && time > pointA) {
      setPointB(time);
      setEnabled(true);
    }
  }, [pointA]);

  const clear = useCallback(() => {
    setPointA(null);
    setPointB(null);
    setEnabled(false);
  }, []);

  return { pointA, pointB, enabled, setA, setB, clear };
};

// 8. Audio Visualizer Data
export const useAudioVisualizer = (audioElement: HTMLAudioElement | null) => {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(64));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>();
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    try {
      if (!contextRef.current) {
        contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!sourceRef.current) {
        sourceRef.current = contextRef.current.createMediaElementSource(audioElement);
        analyzerRef.current = contextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 128;
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(contextRef.current.destination);
      }

      const updateVisualizer = () => {
        if (analyzerRef.current) {
          const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
          analyzerRef.current.getByteFrequencyData(data);
          setFrequencyData(data);
        }
        animationRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (e) {
      console.error("Visualizer error:", e);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [audioElement]);

  return frequencyData;
};

// 9. Bookmark timestamps
export interface Bookmark {
  id: string;
  songId: string;
  time: number;
  label: string;
  createdAt: Date;
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const addBookmark = useCallback((songId: string, time: number, label: string) => {
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      songId,
      time,
      label,
      createdAt: new Date(),
    };
    setBookmarks(prev => [...prev, bookmark]);
    return bookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const getBookmarksForSong = useCallback((songId: string) => {
    return bookmarks.filter(b => b.songId === songId);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, getBookmarksForSong };
};

// 10. Play Later queue
export const usePlayLater = () => {
  const [playLaterQueue, setPlayLaterQueue] = useState<string[]>([]);

  const addToPlayLater = useCallback((songId: string) => {
    setPlayLaterQueue(prev => [...prev, songId]);
  }, []);

  const removeFromPlayLater = useCallback((songId: string) => {
    setPlayLaterQueue(prev => prev.filter(id => id !== songId));
  }, []);

  const clearPlayLater = useCallback(() => {
    setPlayLaterQueue([]);
  }, []);

  return { playLaterQueue, addToPlayLater, removeFromPlayLater, clearPlayLater };
};
