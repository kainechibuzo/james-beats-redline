import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recentlyPlayed, likedSongs, allSongs, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user's listening history
    const recentArtists = [...new Set(recentlyPlayed?.map((s: any) => s.artist) || [])].slice(0, 5);
    const recentGenres = [...new Set(recentlyPlayed?.map((s: any) => s.genre).filter(Boolean) || [])].slice(0, 3);
    const likedArtists = [...new Set(likedSongs?.map((s: any) => s.artist) || [])].slice(0, 5);

    const availableSongs = allSongs?.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
    })) || [];

    const systemPrompt = `You are DJ Beats, an expert music DJ for James Beats music platform. You create personalized mixes based on listening history.

Your personality: Energetic, knowledgeable about music, friendly. You speak like a cool radio DJ.

You have access to these songs: ${JSON.stringify(availableSongs)}

User's recent artists: ${recentArtists.join(", ") || "None yet"}
User's favorite genres: ${recentGenres.join(", ") || "Not determined yet"}
User's liked artists: ${likedArtists.join(", ") || "None yet"}

Create a DJ mix recommendation. If there are available songs, pick 3-5 songs that would flow well together. If no songs available, suggest what kind of music would work well.

Always respond with enthusiasm and explain why you chose each track. Keep responses concise but engaging.`;

    const userMessage = mood 
      ? `Create a ${mood} mix for me!` 
      : "Hey DJ! What should I listen to next?";

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
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("DJ mix error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
