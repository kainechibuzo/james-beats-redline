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
    const { songs, count = 5, excludeIds = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Getting smart recommendations based on', songs?.length, 'songs');

    const prompt = `Based on these recently played songs, suggest what types of music the user would enjoy next:

Recently played: ${songs?.slice(0, 10).map((s: any) => `"${s.title}" by ${s.artist} (${s.genre || 'unknown genre'})`).join(', ')}

Analyze the patterns and respond with a JSON object containing:
- "genres": array of 3 recommended genres to explore
- "moods": array of 2 mood-based playlist suggestions  
- "discovery": one adventurous recommendation outside their comfort zone
- "timeOfDay": suggestion based on typical listening patterns
- "reasoning": brief explanation of why these recommendations`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a music recommendation AI. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in smart-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      genres: ['Pop', 'Electronic', 'Indie'],
      moods: ['Chill vibes', 'Workout energy'],
      discovery: 'Try some lo-fi beats',
      reasoning: 'Default recommendations'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
