// Mock Supabase Client for Demo Mode
// This file provides a completely local, credential-free implementation
// that mimics the Supabase API interface.

import type { Database } from './types';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface MockSession {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
  access_token: string;
  refresh_token: string;
}

interface MockAuthState {
  session: MockSession | null;
  user: MockSession['user'] | null;
}

// Demo user (always authenticated in demo mode)
const DEMO_USER_ID = 'demo-user-' + Math.random().toString(36).substring(7);
const DEMO_SESSION: MockSession = {
  user: {
    id: DEMO_USER_ID,
    email: 'demo@jamesbeats.local',
    user_metadata: {
      username: 'Demo User',
      display_name: 'Demo User',
    },
  },
  access_token: 'demo-token-' + Date.now(),
  refresh_token: 'demo-refresh-' + Date.now(),
};

class MockPostgrestBuilder {
  private data: any[] = [];
  private selectFields = '*';
  private filterChain: any[] = [];

  constructor(table: string, initialData: any[]) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filterChain.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filterChain.push({ type: 'neq', column, value });
    return this;
  }

  ilike(column: string, value: any) {
    this.filterChain.push({ type: 'ilike', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filterChain.push({ type: 'in', column, values });
    return this;
  }

  gte(column: string, value: any) {
    this.filterChain.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filterChain.push({ type: 'lte', column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filterChain.push({ type: 'lt', column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filterChain.push({ type: 'gt', column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.data.sort((a, b) => {
      if (a[column] < b[column]) return asc ? -1 : 1;
      if (a[column] > b[column]) return asc ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(n: number) {
    this.data = this.data.slice(0, n);
    return this;
  }

  private applyFilters() {
    return this.data.filter((row) => {
      return this.filterChain.every((filter) => {
        switch (filter.type) {
          case 'eq':
            return row[filter.column] === filter.value;
          case 'neq':
            return row[filter.column] !== filter.value;
          case 'ilike':
            return String(row[filter.column])
              .toLowerCase()
              .includes(String(filter.value).toLowerCase().replace(/%/g, ''));
          case 'in':
            return filter.values.includes(row[filter.column]);
          case 'gte':
            return row[filter.column] >= filter.value;
          case 'lte':
            return row[filter.column] <= filter.value;
          case 'lt':
            return row[filter.column] < filter.value;
          case 'gt':
            return row[filter.column] > filter.value;
          default:
            return true;
        }
      });
    });
  }

  async then(onResolve: (value: any) => void, onReject?: (error: any) => void) {
    try {
      const filtered = this.applyFilters();
      onResolve({ data: filtered, error: null });
    } catch (error) {
      onReject?.(error);
    }
  }

  async single() {
    const filtered = this.applyFilters();
    return { data: filtered[0] || null, error: null };
  }

  async maybeSingle() {
    const filtered = this.applyFilters();
    return { data: filtered[0] || null, error: null };
  }

  async update(values: any) {
    // Mock update
    return { data: values, error: null };
  }

  async delete() {
    return { data: null, error: null };
  }

  async insert(values: any) {
    return { data: values, error: null };
  }

  async upsert(values: any, options?: any) {
    return { data: values, error: null };
  }
}

class MockSupabaseClient {
  auth = {
    getSession: async () => ({
      data: { session: DEMO_SESSION },
      error: null,
    }),
    getUser: async () => ({
      data: { user: DEMO_SESSION.user },
      error: null,
    }),
    signUp: async (credentials: any) => ({ error: null }),
    signInWithPassword: async (credentials: any) => ({ error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Immediately trigger INITIAL_SESSION event
      setTimeout(() => callback('INITIAL_SESSION', DEMO_SESSION), 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  };

  from(table: string) {
    // Return mock data based on table name
    const mockDataMap: Record<string, any[]> = {
      songs: this.getMockSongs(),
      albums: this.getMockAlbums(),
      playlists: this.getMockPlaylists(),
      profiles: this.getMockProfiles(),
      liked_songs: [],
      recently_played: [],
      listening_activity: [],
      podcast_episodes: [],
      podcasts: [],
      radio_stations: [],
      live_streams: [],
      featured_artists: this.getMockFeaturedArtists(),
      mixes: this.getMockMixes(),
    };

    return new MockPostgrestBuilder(table, mockDataMap[table] || []);
  }

  private getMockSongs() {
    return [
      {
        id: 'song-1',
        title: 'Midnight Dreams',
        artist: 'Luna Echo',
        album: 'Night Collection',
        genre: 'Electronic',
        duration: 245,
        file_url: 'https://archive.org/download/Greatest_Hits/01-Greatest_Hits_01.mp3',
        cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        play_count: 1250,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-2',
        title: 'Neon Lights',
        artist: 'Synth Wave',
        album: 'Electric Dreams',
        genre: 'Synthwave',
        duration: 198,
        file_url: 'https://archive.org/download/Greatest_Hits/02-Greatest_Hits_02.mp3',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        play_count: 980,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-3',
        title: 'Ocean Waves',
        artist: 'Ambient Beats',
        album: 'Chill Sessions',
        genre: 'Ambient',
        duration: 320,
        file_url: 'https://archive.org/download/Greatest_Hits/03-Greatest_Hits_03.mp3',
        cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        play_count: 2100,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-4',
        title: 'Urban Pulse',
        artist: 'City Sounds',
        album: 'Metropolitan',
        genre: 'Hip-Hop',
        duration: 210,
        file_url: 'https://archive.org/download/Greatest_Hits/04-Greatest_Hits_04.mp3',
        cover_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        play_count: 1650,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-5',
        title: 'Jazz Corner',
        artist: 'Smooth Jazz Trio',
        album: 'Late Night',
        genre: 'Jazz',
        duration: 287,
        file_url: 'https://archive.org/download/Greatest_Hits/05-Greatest_Hits_05.mp3',
        cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop',
        play_count: 890,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-6',
        title: 'Rock Anthem',
        artist: 'The Rockers',
        album: 'Power Chords',
        genre: 'Rock',
        duration: 235,
        file_url: 'https://archive.org/download/Greatest_Hits/06-Greatest_Hits_06.mp3',
        cover_url: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
        play_count: 1420,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-7',
        title: 'Indie Vibes',
        artist: 'Indie Collective',
        album: 'Garage Sessions',
        genre: 'Indie',
        duration: 198,
        file_url: 'https://archive.org/download/Greatest_Hits/07-Greatest_Hits_07.mp3',
        cover_url: 'https://images.unsplash.com/photo-1508854066537-b85556ff1a52?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1508854066537-b85556ff1a52?w=300&h=300&fit=crop',
        play_count: 750,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-8',
        title: 'Pop Sensation',
        artist: 'Pop Stars',
        album: 'Hit Factory',
        genre: 'Pop',
        duration: 215,
        file_url: 'https://archive.org/download/Greatest_Hits/08-Greatest_Hits_08.mp3',
        cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        play_count: 3200,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-9',
        title: 'Classical Symphony',
        artist: 'Orchestra Ensemble',
        album: 'Symphonies',
        genre: 'Classical',
        duration: 445,
        file_url: 'https://archive.org/download/Greatest_Hits/09-Greatest_Hits_09.mp3',
        cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        play_count: 560,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
      {
        id: 'song-10',
        title: 'Electronic Pulse',
        artist: 'Synth Masters',
        album: 'Digital Age',
        genre: 'Electronic',
        duration: 267,
        file_url: 'https://archive.org/download/Greatest_Hits/10-Greatest_Hits_10.mp3',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        play_count: 1890,
        is_public: true,
        created_at: new Date().toISOString(),
        source: 'audius',
      },
    ];
  }

  private getMockAlbums() {
    return [
      {
        id: 'album-1',
        title: 'Night Collection',
        artist: 'Luna Echo',
        genre: 'Electronic',
        release_year: 2024,
        cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        description: 'A collection of ethereal electronic melodies',
        is_featured: true,
        is_public: true,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
      },
      {
        id: 'album-2',
        title: 'Electric Dreams',
        artist: 'Synth Wave',
        genre: 'Synthwave',
        release_year: 2024,
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        description: 'Retro-futuristic synthwave vibes',
        is_featured: true,
        is_public: true,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
      },
      {
        id: 'album-3',
        title: 'Chill Sessions',
        artist: 'Ambient Beats',
        genre: 'Ambient',
        release_year: 2024,
        cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        description: 'Relaxing ambient soundscapes',
        is_featured: false,
        is_public: true,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getMockPlaylists() {
    return [
      {
        id: 'playlist-1',
        name: 'Discover Weekly',
        description: 'Your personalized weekly recommendations',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        is_public: false,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
      },
      {
        id: 'playlist-2',
        name: 'Chill Vibes',
        description: 'Relaxing tracks for any mood',
        cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        is_public: true,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getMockProfiles() {
    return [
      {
        id: 'profile-1',
        user_id: DEMO_USER_ID,
        username: 'demouser',
        display_name: 'Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demouser',
        bio: 'Welcome to James Beats demo!',
        subscription_tier: 'premium',
        total_plays: 1250,
        total_likes: 45,
        followers_count: 120,
        following_count: 85,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getMockFeaturedArtists() {
    return [
      {
        id: 'artist-1',
        artist_name: 'Luna Echo',
        bio: 'Electronic producer crafting dreamscapes',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        is_verified: true,
        monthly_listeners: 125000,
      },
      {
        id: 'artist-2',
        artist_name: 'Synth Wave',
        bio: 'Retro-futuristic soundscapes',
        image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        is_verified: true,
        monthly_listeners: 89000,
      },
    ];
  }

  private getMockMixes() {
    return [
      {
        id: 'mix-1',
        title: 'Electronic Essentials',
        artist: 'Mix Master',
        youtube_video_id: 'demo-video-1',
        youtube_url: 'https://www.youtube.com/watch?v=demo1',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        total_duration: '2:15:00',
        is_featured: true,
        is_public: true,
        play_count: 5600,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// Export mock client as default
export const supabase = new MockSupabaseClient() as any;

// Type compatibility
export type { Database };
