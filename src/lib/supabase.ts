import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Playlist = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type Track = {
  id: string;
  playlist_id: string;
  youtube_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  duration: number;
  position: number;
  created_at: string;
};

export type PlaybackState = {
  id: string;
  user_id: string;
  current_track_id: string | null;
  position: number;
  is_playing: boolean;
  volume: number;
  updated_at: string;
};
