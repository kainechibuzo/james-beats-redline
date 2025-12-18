import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, mood, songIds, name, description } = await req.json();
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create the playlist
    const playlistName = name || `DJ Mix - ${mood || "Custom"}`;
    const playlistDesc = description || `AI-generated ${mood || "custom"} playlist by DJ Beats`;

    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .insert({
        user_id: userId,
        name: playlistName,
        description: playlistDesc,
        is_public: false,
      })
      .select()
      .single();

    if (playlistError) {
      console.error("Error creating playlist:", playlistError);
      throw new Error("Failed to create playlist");
    }

    // Add songs to the playlist
    if (songIds && songIds.length > 0) {
      const playlistSongs = songIds.map((songId: string, index: number) => ({
        playlist_id: playlist.id,
        song_id: songId,
        position: index,
      }));

      const { error: songsError } = await supabase
        .from("playlist_songs")
        .insert(playlistSongs);

      if (songsError) {
        console.error("Error adding songs to playlist:", songsError);
        // Don't throw - playlist is created, just songs failed
      }
    }

    return new Response(
      JSON.stringify({ success: true, playlist }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create DJ playlist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
