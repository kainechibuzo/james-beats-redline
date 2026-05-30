import { useState } from 'react';
import { supabase, type Track, type Playlist } from '../lib/supabase';
import { Play, Trash2, Plus, Search } from 'lucide-react';

interface TrackListProps {
  playlist: Playlist | null;
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onTracksUpdate: () => void;
}

export function TrackList({
  playlist,
  tracks,
  currentTrackId,
  isPlaying,
  onTrackSelect,
  onTracksUpdate
}: TrackListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      );
      // Note: In production, use YouTube Data API v3
      // For demo, we'll use the video ID directly
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const addTrack = async (youtubeId: string, title: string) => {
    if (!playlist) return;

    const maxPosition = Math.max(...tracks.map(t => t.position), -1);

    const { error } = await supabase.from('tracks').insert({
      playlist_id: playlist.id,
      youtube_id: youtubeId,
      title: title,
      artist: 'YouTube',
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      position: maxPosition + 1
    });

    if (!error) {
      onTracksUpdate();
      setShowAddModal(false);
      setSearchQuery('');
    }
  };

  const removeTrack = async (trackId: string) => {
    const { error } = await supabase.from('tracks').delete().eq('id', trackId);

    if (!error) {
      onTracksUpdate();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32">
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {playlist?.name || 'My Playlist'}
            </h2>
            <p className="text-slate-400 text-sm">
              {tracks.length} song{tracks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Song
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 mb-2">No songs in your playlist</p>
            <p className="text-slate-500 text-sm">
              Click "Add Song" to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => onTrackSelect(index)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                  currentTrackId === track.id
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                  <img
                    src={track.thumbnail_url}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  {currentTrackId === track.id && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    currentTrackId === track.id ? 'text-green-400' : 'text-white'
                  }`}>
                    {track.title}
                  </p>
                  <p className="text-slate-400 text-sm truncate">
                    {track.artist}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track.id);
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Song Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Add Song</h3>
              <p className="text-slate-400 text-sm mb-4">
                Enter YouTube video ID (e.g., dQw4w9WgXcQ)
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="YouTube video ID"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addTrack(searchQuery, `Track ${tracks.length + 1}`)}
                  disabled={!searchQuery.trim()}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Add Song
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
