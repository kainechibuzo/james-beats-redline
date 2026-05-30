import { useEffect, useCallback, useState } from "react";

/**
 * Custom hook to manage screen wake lock during music playback
 * Keeps the device screen on while music is playing on mobile/tablet devices
 * Uses the Screen Wake Lock API: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */
export const useWakeLock = (isPlaying: boolean) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  // Check if Screen Wake Lock API is supported
  useEffect(() => {
    const supported = "wakeLock" in navigator;
    setIsSupported(supported);
  }, []);

  // Request wake lock when music starts playing
  const requestWakeLock = useCallback(async () => {
    if (!isSupported || isActive) return;

    try {
      const sentinel = await (navigator as any).wakeLock.request("screen");
      setWakeLockSentinel(sentinel);
      setIsActive(true);
      console.log("Wake lock activated - screen will stay on during playback");

      // Handle wake lock release (when screen is turned off by user)
      sentinel.addEventListener("release", () => {
        console.log("Wake lock was released");
        setIsActive(false);
      });
    } catch (err) {
      console.error("Failed to request wake lock:", err);
    }
  }, [isSupported, isActive]);

  // Release wake lock when music stops or component unmounts
  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockSentinel) return;

    try {
      await wakeLockSentinel.release();
      setWakeLockSentinel(null);
      setIsActive(false);
      console.log("Wake lock released");
    } catch (err) {
      console.error("Failed to release wake lock:", err);
    }
  }, [wakeLockSentinel]);

  // Manage wake lock based on playing state
  useEffect(() => {
    if (isPlaying && isSupported) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      // Cleanup on unmount or when effect re-runs
      if (!isPlaying) {
        releaseWakeLock();
      }
    };
  }, [isPlaying, isSupported, requestWakeLock, releaseWakeLock]);

  // Handle page visibility changes (release wake lock when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && wakeLockSentinel) {
        releaseWakeLock();
      } else if (!document.hidden && isPlaying) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, wakeLockSentinel, requestWakeLock, releaseWakeLock]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
};
