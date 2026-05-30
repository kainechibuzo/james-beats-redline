import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Player } from './components/Player';
import { TrackList } from './components/TrackList';
import { usePlayer } from './hooks/usePlayer';
import { useMediaSession } from './hooks/useMediaSession';
import { supabase, type Playlist, type Track } from './lib/supabase';
import { LogOut, Music } from 'lucide-react';

function MainApp() {
  const { user, signOut } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  const {
    currentTrack,
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
  } = usePlayer(tracks, user?.id || null);

  useMediaSession(currentTrack, isPlaying, {
    play: togglePlayPause,
    pause: togglePlayPause,
    previoustrack: playPreviousSong,
    nexttrack: playNextSong,
    seekto: (details) => seekTo(details.seekTime)
  });

  useEffect(() => {
    loadPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPlaylist = async () => {
    if (!user) return;

    const { data: playlists } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let currentPlaylist = playlists;

    if (!currentPlaylist) {
      const { data: newPlaylist, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: 'My Playlist'
        })
        .select()
        .maybeSingle();

      if (!error && newPlaylist) {
        currentPlaylist = newPlaylist;
      }
    }

    if (currentPlaylist) {
      setPlaylist(currentPlaylist);
      await loadTracks(currentPlaylist.id);
    }
  };

  const loadTracks = async (playlistId: string) => {
    const { data } = await supabase
      .from('tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (data) {
      setTracks(data);
    }
  };

  const handlePlayerReady = useCallback((playerId: string) => {
    initializePlayer(playerId);
  }, [initializePlayer]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">James Beats</h1>
              <p className="text-xs text-slate-400">Persistent playback</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <TrackList
        playlist={playlist}
        tracks={tracks}
        currentTrackId={currentTrack?.id || null}
        isPlaying={isPlaying}
        onTrackSelect={playTrack}
        onTracksUpdate={() => playlist && loadTracks(playlist.id)}
      />

      {/* Player */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={currentTrack?.duration || 0}
        volume={volume}
        onPlayPause={togglePlayPause}
        onNext={playNextSong}
        onPrevious={playPreviousSong}
        onSeek={seekTo}
        onVolumeChange={setPlayerVolume}
        onPlayerReady={handlePlayerReady}
      />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
}

export default App;
