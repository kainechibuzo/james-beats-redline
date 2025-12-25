import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, date, guestCount, vibe } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Planning party mix for:', event);

    const prompt = `Plan a party playlist for:
Event: ${event || 'house party'}
Date/Occasion: ${date || 'weekend'}
Guest count: ${guestCount || '20-30'}
Desired vibe: ${vibe || 'fun and energetic'}

Create a JSON party plan:
{
  "playlistName": "catchy name",
  "tagline": "short catchy description",
  "timeline": [
    {
      "phase": "Guests arriving",
      "time": "first 30 min",
      "vibe": "welcoming, conversation-friendly",
      "genres": ["indie pop", "soft electronic"],
      "energy": 4
    },
    {
      "phase": "Party mode",
      "time": "1-2 hours",
      "vibe": "dance floor ready",
      "genres": ["dance", "pop hits"],
      "energy": 8
    },
    {
      "phase": "Late night",
      "time": "winding down",
      "vibe": "chill but still fun",
      "genres": ["r&b", "throwbacks"],
      "energy": 5
    }
  ],
  "mustPlay": ["type of songs you absolutely need"],
  "avoid": ["what to avoid for this party"],
  "djTips": ["tip for the playlist curator"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional party DJ and event planner. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to plan party mix');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(plan), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in party-planner:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      playlistName: "Ultimate Party Mix",
      tagline: "Let's get this party started!",
      timeline: [
        { phase: "Warm-up", time: "first 30 min", vibe: "chill", genres: ["pop"], energy: 5 }
      ],
      mustPlay: ["crowd favorites"],
      avoid: ["sad songs"],
      djTips: ["Read the room"]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
