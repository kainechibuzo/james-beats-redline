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
    const { type, userId, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch user's listening history
    const { data: recentlyPlayed } = await supabase
      .from("recently_played")
      .select("song_id, played_at, songs(*)")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(50);

    const { data: likedSongs } = await supabase
      .from("liked_songs")
      .select("song_id, songs(*)")
      .eq("user_id", userId)
      .limit(100);

    const { data: allSongs } = await supabase
      .from("songs")
      .select("*")
      .eq("is_public", true)
      .limit(500);

    // Generate playlist name based on type
    let playlistName = "";
    let systemPrompt = "";
    const currentHour = new Date().getHours();
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

    switch (type) {
      case "discover_weekly":
        playlistName = "Discover Weekly";
        systemPrompt = `You are a music recommendation AI. Based on the user's listening history, create a Discover Weekly playlist of 30 songs they haven't heard but would love. Focus on new discoveries and deep cuts from similar artists or genres.`;
        break;
      case "release_radar":
        playlistName = "Release Radar";
        systemPrompt = `You are a music recommendation AI. Create a Release Radar playlist featuring the newest releases from artists the user follows and related acts. Focus on fresh, recent music.`;
        break;
      case "daily_mix":
        playlistName = `Daily Mix ${Math.ceil(Math.random() * 6)}`;
        systemPrompt = `You are a music recommendation AI. Create a Daily Mix that blends the user's favorite tracks with new recommendations for endless listening. Mix familiar favorites with fresh discoveries.`;
        break;
      case "daylist":
        const timeOfDay = currentHour < 12 ? "Morning" : currentHour < 17 ? "Afternoon" : currentHour < 21 ? "Evening" : "Late Night";
        const quirkyDescriptors = ["Cozy", "Energetic", "Melancholic", "Dreamy", "Upbeat", "Nostalgic", "Groovy", "Indie", "Lo-Fi", "Acoustic"];
        const randomDescriptor = quirkyDescriptors[Math.floor(Math.random() * quirkyDescriptors.length)];
        playlistName = `${randomDescriptor} ${dayOfWeek} ${timeOfDay}`;
        systemPrompt = `You are a music recommendation AI. Create a Daylist - a highly specific, quirky playlist that updates throughout the day. The playlist should match the time (${timeOfDay}), day (${dayOfWeek}), and have a ${randomDescriptor.toLowerCase()} vibe. Be creative with song selections!`;
        break;
      case "ai_generated":
        playlistName = mood ? `${mood} Mix` : "AI Generated Mix";
        systemPrompt = `You are a music recommendation AI. Create a custom playlist based on the user's prompt: "${mood}". Be creative and match the exact vibe requested.`;
        break;
      default:
        throw new Error("Invalid playlist type");
    }

    const recentSongs = recentlyPlayed?.map((r: any) => r.songs).filter(Boolean) || [];
    const likedSongsList = likedSongs?.map((l: any) => l.songs).filter(Boolean) || [];
    const availableSongs = allSongs || [];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here's the user's music data:
            
Recently played: ${JSON.stringify(recentSongs.slice(0, 20).map((s: any) => ({ title: s?.title, artist: s?.artist, genre: s?.genre })))}

Liked songs: ${JSON.stringify(likedSongsList.slice(0, 20).map((s: any) => ({ title: s?.title, artist: s?.artist, genre: s?.genre })))}

Available songs in library: ${JSON.stringify(availableSongs.map((s: any) => ({ id: s.id, title: s.title, artist: s.artist, genre: s.genre })))}

Generate a playlist description (2-3 sentences) and select songs from the available library that best match. Return as JSON with format:
{
  "description": "playlist description",
  "songIds": ["id1", "id2", ...],
  "commentary": "DJ-style commentary about this playlist"
}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", errorText);
      throw new Error("AI generation failed");
    }

    const aiResponse = await response.json();
    let playlistData;
    try {
      playlistData = JSON.parse(aiResponse.choices[0].message.content);
    } catch {
      playlistData = { description: "A curated mix just for you", songIds: allSongs?.slice(0, 10).map(s => s.id) || [], commentary: "" };
    }

    // Calculate expiry based on type
    let expiresAt;
    const now = new Date();
    switch (type) {
      case "discover_weekly":
        // Expires next Monday
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        expiresAt = new Date(now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
        break;
      case "release_radar":
        // Expires next Friday
        const daysUntilFriday = (12 - now.getDay()) % 7 || 7;
        expiresAt = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
        break;
      case "daily_mix":
        // Expires in 24 hours
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "daylist":
        // Expires in 4 hours
        expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        break;
      default:
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Save playlist to database
    const { data: playlist, error } = await supabase
      .from("generated_playlists")
      .upsert({
        user_id: userId,
        type,
        name: playlistName,
        description: playlistData.description,
        songs: playlistData.songIds,
        metadata: { commentary: playlistData.commentary },
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,type" })
      .select()
      .single();

    if (error) {
      console.error("DB error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ playlist, commentary: playlistData.commentary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
