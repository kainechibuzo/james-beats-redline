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
    const { recentlyPlayed, likedSongs, allSongs, mood, previousMood, isFullDay } = await req.json();
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

    // Determine if this is a vibe switch
    const isVibeSwitch = previousMood && mood && previousMood !== mood;

    let systemPrompt: string;
    let userMessage: string;

    if (isFullDay) {
      // Full day playlist mode - create a structured day playlist
      systemPrompt = `You are DJ Beats, a Gen Z music curator. Create a full-day playlist schedule.

Available songs: ${JSON.stringify(availableSongs)}

Structure your response EXACTLY like this:
MORNING (6AM-12PM): [list 3-5 upbeat/energetic song titles]
AFTERNOON (12PM-6PM): [list 3-5 chill/focus song titles]  
EVENING (6PM-10PM): [list 3-5 vibe/mood song titles]
NIGHT (10PM+): [list 3-5 relaxing/late night song titles]

Keep descriptions short and Gen Z. Use slang naturally like "lowkey", "hits different", "no cap", "valid", "fire". Maximum 15 words per section intro.`;

      userMessage = "Create my full day playlist schedule!";
    } else if (isVibeSwitch) {
      // Vibe switch - DJ speaks to announce the transition
      systemPrompt = `You are DJ Beats, a Gen Z music curator. The user is switching from ${previousMood} to ${mood} mood.

CRITICAL RULES:
- Maximum 15 words ONLY
- Sound natural and Gen Z (use "lowkey", "bet", "hits different", "valid", "no cap", "fire", "fr fr")
- Announce the vibe switch briefly
- Be hyped but concise

Example responses:
- "switching to ${mood} mode, this bout to hit different fr fr"
- "bet, ${mood} vibes coming up, you're gonna love this lowkey"
- "aight we going ${mood} now, no cap this playlist fire"

Available songs: ${JSON.stringify(availableSongs.slice(0, 20))}`;

      userMessage = `Switching from ${previousMood} to ${mood}!`;
    } else {
      // Normal mode - no speech, just song selection
      systemPrompt = `You are DJ Beats selecting songs. Pick 3-5 songs that match the vibe.

Available songs: ${JSON.stringify(availableSongs)}

User's recent artists: ${recentArtists.join(", ") || "None"}
User's liked artists: ${likedArtists.join(", ") || "None"}

Respond ONLY with song titles, one per line. No extra text. No explanations.`;

      userMessage = mood ? `${mood} vibe songs` : "Good songs for me";
    }

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
