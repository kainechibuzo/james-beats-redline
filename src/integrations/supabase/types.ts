export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          artist: string
          cover_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          is_featured: boolean
          is_public: boolean
          release_year: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          release_year?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          release_year?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blends: {
        Row: {
          created_at: string
          id: string
          name: string
          participants: Json
          songs: Json | null
          taste_match_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          participants?: Json
          songs?: Json | null
          taste_match_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          participants?: Json
          songs?: Json | null
          taste_match_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      featured_artists: {
        Row: {
          artist_name: string
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          is_verified: boolean | null
          monthly_listeners: number | null
        }
        Insert: {
          artist_name: string
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
        }
        Update: {
          artist_name?: string
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          monthly_listeners?: number | null
        }
        Relationships: []
      }
      followed_podcasts: {
        Row: {
          created_at: string
          id: string
          podcast_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          podcast_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          podcast_id?: string
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      generated_playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          name: string
          songs: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          songs?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          songs?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jam_sessions: {
        Row: {
          created_at: string
          current_position: number | null
          current_song_id: string | null
          host_id: string
          id: string
          invite_code: string
          is_playing: boolean | null
          name: string
          participants: Json | null
          queue: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_position?: number | null
          current_song_id?: string | null
          host_id: string
          id?: string
          invite_code: string
          is_playing?: boolean | null
          name: string
          participants?: Json | null
          queue?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_position?: number | null
          current_song_id?: string | null
          host_id?: string
          id?: string
          invite_code?: string
          is_playing?: boolean | null
          name?: string
          participants?: Json | null
          queue?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_sessions_current_song_id_fkey"
            columns: ["current_song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_albums: {
        Row: {
          album_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_albums_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_radio_stations: {
        Row: {
          created_at: string
          id: string
          station_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          station_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          station_id?: string
          user_id?: string
        }
        Relationships: []
      }
      liked_songs: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_activity: {
        Row: {
          id: string
          is_active: boolean | null
          song_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          song_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          song_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listening_activity_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          host_name: string | null
          id: string
          is_live: boolean
          scheduled_at: string | null
          stream_url: string
          title: string
          viewer_count: number
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          host_name?: string | null
          id?: string
          is_live?: boolean
          scheduled_at?: string | null
          stream_url: string
          title: string
          viewer_count?: number
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          host_name?: string | null
          id?: string
          is_live?: boolean
          scheduled_at?: string | null
          stream_url?: string
          title?: string
          viewer_count?: number
        }
        Relationships: []
      }
      lyrics: {
        Row: {
          behind_the_lyrics: string | null
          content: Json
          created_at: string
          id: string
          language: string | null
          song_id: string
          synced: boolean
        }
        Insert: {
          behind_the_lyrics?: string | null
          content?: Json
          created_at?: string
          id?: string
          language?: string | null
          song_id: string
          synced?: boolean
        }
        Update: {
          behind_the_lyrics?: string | null
          content?: Json
          created_at?: string
          id?: string
          language?: string | null
          song_id?: string
          synced?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lyrics_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      mixes: {
        Row: {
          artist: string | null
          created_at: string
          id: string
          is_featured: boolean
          is_public: boolean
          play_count: number
          thumbnail: string | null
          title: string
          total_duration: string | null
          tracks: Json
          updated_at: string
          user_id: string | null
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_public?: boolean
          play_count?: number
          thumbnail?: string | null
          title: string
          total_duration?: string | null
          tracks?: Json
          updated_at?: string
          user_id?: string | null
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_public?: boolean
          play_count?: number
          thumbnail?: string | null
          title?: string
          total_duration?: string | null
          tracks?: Json
          updated_at?: string
          user_id?: string | null
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: []
      }
      playlist_collaborators: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          role?: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_collaborators_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playlist_songs: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          position?: number
          song_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          audio_url: string
          description: string | null
          duration: number | null
          id: string
          play_count: number
          podcast_id: string
          published_at: string
          title: string
        }
        Insert: {
          audio_url: string
          description?: string | null
          duration?: number | null
          id?: string
          play_count?: number
          podcast_id: string
          published_at?: string
          title: string
        }
        Update: {
          audio_url?: string
          description?: string | null
          duration?: number | null
          id?: string
          play_count?: number
          podcast_id?: string
          published_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          host: string | null
          id: string
          is_featured: boolean
          rss_url: string | null
          subscriber_count: number
          title: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          host?: string | null
          id?: string
          is_featured?: boolean
          rss_url?: string | null
          subscriber_count?: number
          title: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          host?: string | null
          id?: string
          is_featured?: boolean
          rss_url?: string | null
          subscriber_count?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          followers_count: number
          following_count: number
          id: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          terms_accepted_at: string | null
          total_likes: number
          total_plays: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          terms_accepted_at?: string | null
          total_likes?: number
          total_plays?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          terms_accepted_at?: string | null
          total_likes?: number
          total_plays?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      radio_stations: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          genre: string | null
          id: string
          is_featured: boolean
          is_live: boolean
          listener_count: number
          name: string
          stream_url: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_live?: boolean
          listener_count?: number
          name: string
          stream_url: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_live?: boolean
          listener_count?: number
          name?: string
          stream_url?: string
        }
        Relationships: []
      }
      recently_played: {
        Row: {
          id: string
          played_at: string
          song_id: string
          user_id: string
        }
        Insert: {
          id?: string
          played_at?: string
          song_id: string
          user_id: string
        }
        Update: {
          id?: string
          played_at?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_played_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          new_users: number | null
          storage_used_mb: number | null
          total_plays: number | null
          total_uploads: number | null
          total_users: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          new_users?: number | null
          storage_used_mb?: number | null
          total_plays?: number | null
          total_uploads?: number | null
          total_users?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          new_users?: number | null
          storage_used_mb?: number | null
          total_plays?: number | null
          total_uploads?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          album: string | null
          album_id: string | null
          artist: string
          cover_url: string | null
          created_at: string
          duration: number | null
          file_url: string
          genre: string | null
          id: string
          is_public: boolean
          play_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          album?: string | null
          album_id?: string | null
          artist: string
          cover_url?: string | null
          created_at?: string
          duration?: number | null
          file_url: string
          genre?: string | null
          id?: string
          is_public?: boolean
          play_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          album?: string | null
          album_id?: string | null
          artist?: string
          cover_url?: string | null
          created_at?: string
          duration?: number | null
          file_url?: string
          genre?: string | null
          id?: string
          is_public?: boolean
          play_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          id: string
          listening_personality: string | null
          month: number | null
          top_artists: Json | null
          top_genres: Json | null
          top_songs: Json | null
          total_minutes: number | null
          total_songs: number | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          listening_personality?: string | null
          month?: number | null
          top_artists?: Json | null
          top_genres?: Json | null
          top_songs?: Json | null
          total_minutes?: number | null
          total_songs?: number | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          listening_personality?: string | null
          month?: number | null
          top_artists?: Json | null
          top_genres?: Json | null
          top_songs?: Json | null
          total_minutes?: number | null
          total_songs?: number | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subscription_tier: "free" | "premium" | "artist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      subscription_tier: ["free", "premium", "artist"],
    },
  },
} as const
