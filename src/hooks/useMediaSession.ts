import { useEffect } from 'react';
import type { Track } from '../lib/supabase';

interface MediaSessionHandlers {
  play: () => void;
  pause: () => void;
  previoustrack: () => void;
  nexttrack: () => void;
  seekto: (details: { seekTime: number }) => void;
}

export function useMediaSession(
  currentTrack: Track | null,
  isPlaying: boolean,
  handlers: MediaSessionHandlers
) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const updateMediaSession = () => {
      if (!currentTrack) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: currentTrack.thumbnail_url
          ? [
              { src: currentTrack.thumbnail_url, sizes: '512x512', type: 'image/jpeg' }
            ]
          : []
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    };

    updateMediaSession();
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const actionHandlers: [string, (details?: any) => void][] = [
      ['play', handlers.play],
      ['pause', handlers.pause],
      ['previoustrack', handlers.previoustrack],
      ['nexttrack', handlers.nexttrack],
      ['seekto', (details: { seekTime: number }) => handlers.seekto(details)]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch (error) {
        console.warn(`Media session action "${action}" not supported`);
      }
    }

    return () => {
      for (const [action] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
        } catch (error) {
          // cleanup
        }
      }
    };
  }, [handlers]);
}
