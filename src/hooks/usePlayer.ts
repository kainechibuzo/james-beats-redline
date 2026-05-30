import { useState, useEffect, useCallback, useRef } from 'react';
import YouTubePlayer from 'youtube-player';
import { supabase, type Track } from '../lib/supabase';

type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

// YouTube Player State constants
const YT_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export function usePlayer(tracks: Track[], userId: string | null) {
  const [playerState, setPlayerState] = useState<PlayerState>('unstarted');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const playerIdRef = useRef<string | null>(null);

  const currentTrack = tracks[currentTrackIndex] || null;

  const loadPlaybackState = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('playback_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      const trackIndex = tracks.findIndex(t => t.id === data.current_track_id);
      if (trackIndex !== -1) {
        setCurrentTrackIndex(trackIndex);
      }
      setCurrentTime(data.position);
      setVolume(data.volume);
      setIsPlaying(data.is_playing);
    }
  }, [userId, tracks]);

  useEffect(() => {
    if (tracks.length > 0) {
      loadPlaybackState();
    }
  }, [tracks, loadPlaybackState]);

  const savePlaybackState = useCallback(async (
    trackId: string | null,
    pos: number,
    playing: boolean,
    vol: number
  ) => {
    if (!userId) return;

    const { data: existing } = await supabase
      .from('playback_state')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('playback_state')
        .update({
          current_track_id: trackId,
          position: pos,
          is_playing: playing,
          volume: vol,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('playback_state')
        .insert({
          user_id: userId,
          current_track_id: trackId,
          position: pos,
          is_playing: playing,
          volume: vol
        });
    }
  }, [userId]);

  const initializePlayer = useCallback(async (elementId: string) => {
    if (playerRef.current) return;

    playerRef.current = YouTubePlayer(elementId, {
      playerVars: {
        autoplay: 0,
        controls: 1,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      }
    });

    playerIdRef.current = elementId;

    playerRef.current.on('stateChange', (event: any) => {
      const stateMap: Record<number, PlayerState> = {
        '-1': 'unstarted',
        '0': 'ended',
        '1': 'playing',
        '2': 'paused',
        '3': 'buffering',
        '5': 'cued'
      };
      const state = stateMap[event.data] || 'unstarted';
      setPlayerState(state);

      // Auto-play next track when current track ends
      if (event.data === YT_PLAYER_STATE.ENDED) {
        playNextSong();
      }

      if (event.data === YT_PLAYER_STATE.PLAYING) {
        setIsPlaying(true);
        if (currentTrack) {
          savePlaybackState(currentTrack.id, currentTime, true, volume);
        }
      } else if (event.data === YT_PLAYER_STATE.PAUSED) {
        setIsPlaying(false);
        if (currentTrack) {
          savePlaybackState(currentTrack.id, currentTime, false, volume);
        }
      }
    });

    playerRef.current.on('ready', async () => {
      if (currentTrack) {
        await playerRef.current.loadVideoById(currentTrack.youtube_id);
        await playerRef.current.setVolume(volume * 100);
        if (currentTime > 0) {
          await playerRef.current.seekTo(currentTime, true);
        }
      }
    });

    setInterval(async () => {
      if (playerRef.current && isPlaying) {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(Math.floor(time));
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, currentTime, volume, isPlaying, savePlaybackState]);

  const playNextSong = useCallback(async () => {
    if (tracks.length === 0) return;

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    const nextTrack = tracks[nextIndex];

    if (playerRef.current && nextTrack) {
      await playerRef.current.loadVideoById(nextTrack.youtube_id);
      await playerRef.current.playVideo();
    }

    savePlaybackState(nextTrack?.id || null, 0, true, volume);
  }, [tracks, currentTrackIndex, savePlaybackState, volume]);

  const playPreviousSong = useCallback(async () => {
    if (tracks.length === 0) return;

    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    const prevTrack = tracks[prevIndex];

    if (playerRef.current && prevTrack) {
      await playerRef.current.loadVideoById(prevTrack.youtube_id);
      await playerRef.current.playVideo();
    }

    savePlaybackState(prevTrack?.id || null, 0, true, volume);
  }, [tracks, currentTrackIndex, savePlaybackState, volume]);

  const playTrack = useCallback(async (index: number) => {
    if (index < 0 || index >= tracks.length) return;

    setCurrentTrackIndex(index);
    const track = tracks[index];

    if (playerRef.current && track) {
      await playerRef.current.loadVideoById(track.youtube_id);
      await playerRef.current.playVideo();
    }

    savePlaybackState(track.id, 0, true, volume);
  }, [tracks, savePlaybackState, volume]);

  const togglePlayPause = useCallback(async () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      await playerRef.current.pauseVideo();
    } else {
      await playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!playerRef.current) return;
    await playerRef.current.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const setPlayerVolume = useCallback(async (vol: number) => {
    if (!playerRef.current) return;
    await playerRef.current.setVolume(vol * 100);
    setVolume(vol);
    if (currentTrack) {
      savePlaybackState(currentTrack.id, currentTime, isPlaying, vol);
    }
  }, [currentTrack, currentTime, isPlaying, savePlaybackState]);

  return {
    playerState,
    currentTrack,
    currentTrackIndex,
    currentTime,
    volume,
    isPlaying,
    initializePlayer,
    playNextSong,
    playPreviousSong,
    playTrack,
    togglePlayPause,
    seekTo,
    setPlayerVolume
  };
}
