import { useState, useCallback, useEffect, useRef } from "react";

interface EqualizerBand {
  frequency: number;
  gain: number;
}

const DEFAULT_BANDS: EqualizerBand[] = [
  { frequency: 60, gain: 0 },
  { frequency: 170, gain: 0 },
  { frequency: 310, gain: 0 },
  { frequency: 600, gain: 0 },
  { frequency: 1000, gain: 0 },
  { frequency: 3000, gain: 0 },
  { frequency: 6000, gain: 0 },
  { frequency: 12000, gain: 0 },
  { frequency: 14000, gain: 0 },
  { frequency: 16000, gain: 0 },
];

const PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  treble: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6],
  vocal: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
  rock: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4],
  electronic: [4, 3, 0, -2, -1, 2, 4, 3, 2, 3],
  jazz: [0, 0, 1, 2, 2, 2, 0, 1, 2, 3],
  classical: [0, 0, 0, 0, 0, 0, -2, -3, -3, -4],
};

export const useEqualizer = () => {
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_BANDS);
  const [preset, setPreset] = useState<string>("flat");
  const [enabled, setEnabled] = useState(false);

  const setBandGain = useCallback((index: number, gain: number) => {
    setBands(prev => prev.map((band, i) => 
      i === index ? { ...band, gain: Math.max(-12, Math.min(12, gain)) } : band
    ));
    setPreset("custom");
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const gains = PRESETS[presetName] || PRESETS.flat;
    setBands(prev => prev.map((band, i) => ({ ...band, gain: gains[i] || 0 })));
    setPreset(presetName);
  }, []);

  const reset = useCallback(() => {
    applyPreset("flat");
  }, [applyPreset]);

  return {
    bands,
    preset,
    presets: Object.keys(PRESETS),
    enabled,
    setEnabled,
    setBandGain,
    applyPreset,
    reset,
  };
};

export const useSleepTimer = () => {
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const onEndRef = useRef<() => void>();

  const start = useCallback((minutes: number, onEnd: () => void) => {
    const end = new Date(Date.now() + minutes * 60 * 1000);
    setEndTime(end);
    setRemaining(minutes * 60);
    onEndRef.current = onEnd;
  }, []);

  const cancel = useCallback(() => {
    setEndTime(null);
    setRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (!endTime) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime.getTime() - now) / 1000));
      setRemaining(diff);

      if (diff <= 0) {
        cancel();
        onEndRef.current?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTime, cancel]);

  return {
    isActive: !!endTime,
    remaining,
    start,
    cancel,
  };
};

export const useCrossfade = (defaultDuration: number = 5) => {
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState(defaultDuration);

  const updateDuration = useCallback((newDuration: number) => {
    setDuration(Math.max(0, Math.min(12, newDuration)));
  }, []);

  return {
    enabled,
    duration,
    setEnabled,
    setDuration: updateDuration,
  };
};

export const usePlaybackSpeed = () => {
  const [speed, setSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const nextSpeed = useCallback(() => {
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  }, [speed]);

  return {
    speed,
    speeds,
    setSpeed,
    nextSpeed,
  };
};

export const useAudioNormalization = () => {
  const [enabled, setEnabled] = useState(false);
  const [targetLevel, setTargetLevel] = useState(-14); // LUFS

  return {
    enabled,
    targetLevel,
    setEnabled,
    setTargetLevel: (level: number) => setTargetLevel(Math.max(-24, Math.min(-6, level))),
  };
};

export const useGaplessPlayback = () => {
  const [enabled, setEnabled] = useState(true);
  return { enabled, setEnabled };
};
