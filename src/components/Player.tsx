import { useEffect } from 'react';
import type { Track } from '../lib/supabase';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlayerReady: (playerId: string) => void;
}

export function Player({
  currentTrack,
  isPlaying,
  currentTime,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onPlayerReady
}: PlayerProps) {
  useEffect(() => {
    onPlayerReady('youtube-player');
  }, [onPlayerReady]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (currentTrack?.duration || currentTime);
    onSeek(Math.floor(newTime));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/90 backdrop-blur-xl border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack?.thumbnail_url ? (
              <img
                src={currentTrack.thumbnail_url}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center">
                <Play className="w-6 h-6 text-slate-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-medium truncate">
                {currentTrack?.title || 'No track selected'}
              </p>
              <p className="text-slate-400 text-sm truncate">
                {currentTrack?.artist || 'Select a song to play'}
              </p>
            </div>
          </div>

          {/* YouTube player hidden */}
          <div id="youtube-player" className="hidden" />

          {/* Controls */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onPrevious}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={!currentTrack}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={onPlayPause}
                className="p-3 bg-green-500 hover:bg-green-600 rounded-full text-white shadow-lg transition-all disabled:opacity-50"
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={onNext}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={!currentTrack}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-xs text-slate-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1 bg-slate-700 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-green-500 rounded-full relative"
                  style={{
                    width: currentTrack
                      ? `${(currentTime / currentTrack.duration) * 100}%`
                      : '0%'
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs text-slate-400 w-10">
                {currentTrack ? formatTime(currentTrack.duration) : '0:00'}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-slate-700 rounded-full accent-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
