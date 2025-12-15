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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
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
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
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
          total_likes?: number
          total_plays?: number
          updated_at?: string
          user_id?: string
          username?: string | null
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
      songs: {
        Row: {
          album: string | null
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
      [_ in never]: never
    }
    Enums: {
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
      subscription_tier: ["free", "premium", "artist"],
    },
  },
} as const
