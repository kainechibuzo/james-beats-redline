import React, { useState, useCallback, useEffect } from "react";

// 31. Keyboard Shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: string;
  handler: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === e.key.toLowerCase() &&
        !!s.ctrl === e.ctrlKey &&
        !!s.shift === e.shiftKey
      );

      if (shortcut) {
        e.preventDefault();
        shortcut.handler();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
};

// 32. Gesture Controls
export type SwipeDirection = "left" | "right" | "up" | "down";

export const useSwipeGestures = (
  onSwipe: (direction: SwipeDirection) => void,
  threshold = 50
) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        onSwipe(deltaX > 0 ? "right" : "left");
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        onSwipe(deltaY > 0 ? "down" : "up");
      }
    }

    setTouchStart(null);
  }, [touchStart, onSwipe, threshold]);

  return { handleTouchStart, handleTouchEnd };
};

// 33. Fullscreen Mode
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } catch (e) {
      console.error("Exit fullscreen error:", e);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
};

// 34. Mini Lyrics Display
export const useMiniLyrics = () => {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  return { enabled, position, setEnabled, setPosition };
};

// 35. Now Playing Animation
export type AnimationStyle = "wave" | "pulse" | "bounce" | "glow" | "none";

export const useNowPlayingAnimation = () => {
  const [style, setStyle] = useState<AnimationStyle>("wave");
  const [enabled, setEnabled] = useState(true);
  return { style, enabled, setStyle, setEnabled };
};

// 36. Album Art Zoom
export const useAlbumArtZoom = () => {
  const [isZoomed, setIsZoomed] = useState(false);
  const toggleZoom = useCallback(() => setIsZoomed(prev => !prev), []);
  return { isZoomed, toggleZoom };
};

// 37. Queue Actions
export const useQueueActions = () => {
  const [showOnlyUnplayed, setShowOnlyUnplayed] = useState(false);
  const [groupByAlbum, setGroupByAlbum] = useState(false);

  return { showOnlyUnplayed, groupByAlbum, setShowOnlyUnplayed, setGroupByAlbum };
};

// 38. Player Theme
export type PlayerTheme = "default" | "minimal" | "compact" | "large";

export const usePlayerTheme = () => {
  const [theme, setTheme] = useState<PlayerTheme>("default");
  return { theme, setTheme };
};

// 39. Notification Controls
export const useMediaNotifications = () => {
  const [enabled, setEnabled] = useState(true);

  const updateNotification = useCallback((title: string, artist: string, artwork?: string) => {
    if (!enabled || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: artwork ? [{ src: artwork, sizes: "512x512", type: "image/png" }] : undefined,
    });
  }, [enabled]);

  const setMediaHandlers = useCallback((handlers: {
    play?: () => void;
    pause?: () => void;
    nexttrack?: () => void;
    previoustrack?: () => void;
    seekto?: (details: MediaSessionActionDetails) => void;
  }) => {
    if (!("mediaSession" in navigator)) return;

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler || null);
      } catch (e) {
        console.warn(`Media session action ${action} not supported`);
      }
    });
  }, []);

  return { enabled, setEnabled, updateNotification, setMediaHandlers };
};

// 40. Accent Color Customization
export const ACCENT_COLORS = [
  { name: "Red", value: "348 83% 47%" },
  { name: "Purple", value: "270 70% 50%" },
  { name: "Blue", value: "220 70% 50%" },
  { name: "Green", value: "150 70% 40%" },
  { name: "Orange", value: "25 90% 50%" },
  { name: "Pink", value: "330 80% 60%" },
  { name: "Teal", value: "180 70% 40%" },
  { name: "Gold", value: "45 90% 50%" },
] as const;

export const useAccentColor = () => {
  const [colorIndex, setColorIndex] = useState(0);

  const setAccentColor = useCallback((index: number) => {
    setColorIndex(index);
    const color = ACCENT_COLORS[index].value;
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--ring", color);
  }, []);

  return { 
    currentColor: ACCENT_COLORS[colorIndex], 
    colors: ACCENT_COLORS, 
    setAccentColor 
  };
};
