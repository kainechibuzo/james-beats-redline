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
    const { userId, year } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get all listening data for the year
    const startOfYear = new Date(year, 0, 1).toISOString();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();

    const { data: listeningHistory } = await supabase
      .from("recently_played")
      .select("*, songs(*)")
      .eq("user_id", userId)
      .gte("played_at", startOfYear)
      .lte("played_at", endOfYear);

    const { data: likedSongsData } = await supabase
      .from("liked_songs")
      .select("*, songs(*)")
      .eq("user_id", userId)
      .gte("created_at", startOfYear)
      .lte("created_at", endOfYear);

    // Calculate stats
    const songCounts: Record<string, { count: number; song: any }> = {};
    const artistCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    let totalMinutes = 0;

    listeningHistory?.forEach(item => {
      const song = item.songs;
      if (!song) return;

      // Count songs
      if (!songCounts[song.id]) {
        songCounts[song.id] = { count: 0, song };
      }
      songCounts[song.id].count++;

      // Count artists
      artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1;

      // Count genres
      if (song.genre) {
        genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
      }

      // Calculate minutes
      totalMinutes += (song.duration || 180) / 60;
    });

    // Get top songs, artists, genres
    const topSongs = Object.values(songCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ song, count }) => ({ ...song, playCount: count }));

    const topArtists = Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, playCount: count }));

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, playCount: count }));

    // Generate listening personality with AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a fun, creative music analyst. Generate a short, catchy 'listening personality' title (2-4 words) and a fun description (1-2 sentences) based on the user's music taste."
          },
          {
            role: "user",
            content: `Based on this listening data, generate a listening personality:
            
Top Artists: ${topArtists.map(a => a.artist).join(", ")}
Top Genres: ${topGenres.map(g => g.genre).join(", ")}
Total Songs: ${listeningHistory?.length || 0}
Total Minutes: ${Math.round(totalMinutes)}

Return JSON: { "personality": "title", "description": "fun description" }`
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    let personality = { personality: "Music Explorer", description: "You have eclectic taste!" };
    if (response.ok) {
      const aiData = await response.json();
      try {
        personality = JSON.parse(aiData.choices[0].message.content);
      } catch {}
    }

    // Save to user_stats
    const { data: stats, error } = await supabase
      .from("user_stats")
      .upsert({
        user_id: userId,
        year,
        top_songs: topSongs,
        top_artists: topArtists,
        top_genres: topGenres,
        total_minutes: Math.round(totalMinutes),
        total_songs: listeningHistory?.length || 0,
        listening_personality: personality.personality,
      }, { onConflict: "user_id,year" })
      .select()
      .single();

    if (error) {
      console.error("DB error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ 
      stats,
      personality: personality.description,
      summary: {
        topSongs,
        topArtists,
        topGenres,
        totalMinutes: Math.round(totalMinutes),
        totalSongs: listeningHistory?.length || 0,
      }
    }), {
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
