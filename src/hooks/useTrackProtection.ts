import { useEffect, useCallback } from "react";

export const useTrackProtection = (enabled: boolean = true) => {
  const preventContextMenu = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Prevent right-click on audio elements and images
    if (
      target.tagName === "AUDIO" ||
      target.tagName === "VIDEO" ||
      target.closest("audio") ||
      target.closest("video") ||
      target.closest("[data-protected]")
    ) {
      e.preventDefault();
      return false;
    }
  }, []);

  const preventKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Prevent Ctrl+S, Ctrl+Shift+I (DevTools)
    if (
      (e.ctrlKey && e.key === "s") ||
      (e.ctrlKey && e.shiftKey && e.key === "I")
    ) {
      e.preventDefault();
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboardShortcuts);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboardShortcuts);
    };
  }, [enabled, preventContextMenu, preventKeyboardShortcuts]);
};

// Utility to generate audio fingerprint for duplicate detection
export const generateAudioFingerprint = async (file: File): Promise<string> => {
  const arrayBuffer = await file.slice(0, 10000).arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};
