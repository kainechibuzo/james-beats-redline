/**
 * DEMO MODE: Mock Data for Public Showcase
 * This file contains safe, fictional data for the frontend-only demo version.
 * All real database calls are replaced with local data.
 */

export interface MockSong {
  id: string;
  user_id: string | null;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  duration: number;
  file_url: string;
  cover_url: string;
  thumbnail?: string;
  youtube_video_id?: string;
  youtube_url?: string;
  source?: string;
  play_count: number;
  is_public: boolean;
  created_at: string;
}

export interface MockAlbum {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  description: string | null;
  genre: string | null;
  release_year: number | null;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockPlaylist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Free audio samples from Soundhelix and Internet Archive
const FREE_AUDIO_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://archive.org/download/testmp3dir/good-morning.mp3",
];

// Placeholder album covers (placeholder.com is safe and doesn't require attribution)
const PLACEHOLDER_COVERS = [
  "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Album+1",
  "https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Album+2",
  "https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=Album+3",
  "https://via.placeholder.com/300x300/FFA07A/FFFFFF?text=Album+4",
  "https://via.placeholder.com/300x300/98D8C8/FFFFFF?text=Album+5",
  "https://via.placeholder.com/300x300/F7DC6F/FFFFFF?text=Album+6",
  "https://via.placeholder.com/300x300/BB8FCE/FFFFFF?text=Album+7",
  "https://via.placeholder.com/300x300/85C1E2/FFFFFF?text=Album+8",
];

const GENRES = ["Electronic", "House", "Techno", "Ambient", "Chillwave", "Synthwave", "Deep House", "Lo-Fi"];

// Mock Artists
export const MOCK_ARTISTS = [
  { name: "Luna Eclipse", cover: "https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=Luna", monthly_listeners: 145000 },
  { name: "Neon Pulse", cover: "https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=Neon", monthly_listeners: 298000 },
  { name: "Cyber Drift", cover: "https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=Cyber", monthly_listeners: 187000 },
  { name: "Violet Sound", cover: "https://via.placeholder.com/100x100/FFA07A/FFFFFF?text=Violet", monthly_listeners: 92000 },
  { name: "Cosmic Wave", cover: "https://via.placeholder.com/100x100/98D8C8/FFFFFF?text=Cosmic", monthly_listeners: 231000 },
  { name: "Echo Synth", cover: "https://via.placeholder.com/100x100/F7DC6F/FFFFFF?text=Echo", monthly_listeners: 156000 },
  { name: "Aurora Blue", cover: "https://via.placeholder.com/100x100/BB8FCE/FFFFFF?text=Aurora", monthly_listeners: 127000 },
  { name: "Solar Flare", cover: "https://via.placeholder.com/100x100/85C1E2/FFFFFF?text=Solar", monthly_listeners: 213000 },
];

// Mock Songs - Safe fictional data with free audio sources
export const MOCK_SONGS: MockSong[] = [
  {
    id: "demo-song-001",
    user_id: null,
    title: "Neon Dreams",
    artist: "Luna Eclipse",
    album: "Midnight Visions",
    genre: "Synthwave",
    duration: 180,
    file_url: FREE_AUDIO_SOURCES[0],
    cover_url: PLACEHOLDER_COVERS[0],
    play_count: 1524,
    is_public: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-002",
    user_id: null,
    title: "Electric Paradise",
    artist: "Neon Pulse",
    album: "Digital Horizons",
    genre: "House",
    duration: 240,
    file_url: FREE_AUDIO_SOURCES[1],
    cover_url: PLACEHOLDER_COVERS[1],
    play_count: 3421,
    is_public: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-003",
    user_id: null,
    title: "Cyber Drift",
    artist: "Cyber Drift",
    album: "Network Flow",
    genre: "Techno",
    duration: 210,
    file_url: FREE_AUDIO_SOURCES[2],
    cover_url: PLACEHOLDER_COVERS[2],
    play_count: 2156,
    is_public: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-004",
    user_id: null,
    title: "Violet Echo",
    artist: "Violet Sound",
    album: "Chromatic Dreams",
    genre: "Ambient",
    duration: 320,
    file_url: FREE_AUDIO_SOURCES[3],
    cover_url: PLACEHOLDER_COVERS[3],
    play_count: 987,
    is_public: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-005",
    user_id: null,
    title: "Cosmic Wave",
    artist: "Cosmic Wave",
    album: "Universal Sound",
    genre: "Deep House",
    duration: 270,
    file_url: FREE_AUDIO_SOURCES[4],
    cover_url: PLACEHOLDER_COVERS[4],
    play_count: 2834,
    is_public: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-006",
    user_id: null,
    title: "Echo Synth",
    artist: "Echo Synth",
    album: "Reflections",
    genre: "Electronic",
    duration: 195,
    file_url: FREE_AUDIO_SOURCES[5],
    cover_url: PLACEHOLDER_COVERS[5],
    play_count: 1654,
    is_public: true,
    created_at: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-007",
    user_id: null,
    title: "Aurora Rising",
    artist: "Aurora Blue",
    album: "Northern Lights",
    genre: "Chillwave",
    duration: 240,
    file_url: FREE_AUDIO_SOURCES[0],
    cover_url: PLACEHOLDER_COVERS[6],
    play_count: 2145,
    is_public: true,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-song-008",
    user_id: null,
    title: "Solar Pulse",
    artist: "Solar Flare",
    album: "Stellar Vibes",
    genre: "Lo-Fi",
    duration: 180,
    file_url: FREE_AUDIO_SOURCES[1],
    cover_url: PLACEHOLDER_COVERS[7],
    play_count: 3892,
    is_public: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Albums
export const MOCK_ALBUMS: MockAlbum[] = [
  {
    id: "demo-album-001",
    user_id: "demo-user",
    title: "Midnight Visions",
    artist: "Luna Eclipse",
    cover_url: PLACEHOLDER_COVERS[0],
    description: "A journey through neon-lit dreamscapes",
    genre: "Synthwave",
    release_year: 2024,
    is_featured: true,
    is_public: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-album-002",
    user_id: "demo-user",
    title: "Digital Horizons",
    artist: "Neon Pulse",
    cover_url: PLACEHOLDER_COVERS[1],
    description: "Electronic soundscapes for the digital age",
    genre: "House",
    release_year: 2024,
    is_featured: true,
    is_public: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-album-003",
    user_id: "demo-user",
    title: "Network Flow",
    artist: "Cyber Drift",
    cover_url: PLACEHOLDER_COVERS[2],
    description: "Raw techno beats for late-night sessions",
    genre: "Techno",
    release_year: 2024,
    is_featured: false,
    is_public: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Playlists
export const MOCK_PLAYLISTS: MockPlaylist[] = [
  {
    id: "demo-playlist-001",
    user_id: "demo-user",
    name: "Chill Vibes",
    description: "Relaxing electronic music for focus and meditation",
    cover_url: "https://via.placeholder.com/300x300/98D8C8/FFFFFF?text=Chill+Vibes",
    is_public: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-playlist-002",
    user_id: "demo-user",
    name: "Late Night Sessions",
    description: "Deep techno and house for all-nighters",
    cover_url: "https://via.placeholder.com/300x300/BB8FCE/FFFFFF?text=Late+Night",
    is_public: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-playlist-003",
    user_id: "demo-user",
    name: "Synthwave Dreams",
    description: "80s-inspired synthetic soundscapes",
    cover_url: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Synthwave",
    is_public: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Utility function to get random song
export const getRandomSongs = (count: number): MockSong[] => {
  const shuffled = [...MOCK_SONGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, MOCK_SONGS.length));
};

// Utility function to get songs by genre
export const getSongsByGenre = (genre: string): MockSong[] => {
  return MOCK_SONGS.filter(song => song.genre === genre);
};

// Utility function to get featured songs (sorted by play count)
export const getFeaturedSongs = (count: number): MockSong[] => {
  return [...MOCK_SONGS].sort((a, b) => b.play_count - a.play_count).slice(0, count);
};
