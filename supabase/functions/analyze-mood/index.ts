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
    const { songs, currentMood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing mood for', songs?.length, 'songs, current mood:', currentMood);

    const prompt = `Analyze these song titles and artists to determine the listener's mood and suggest similar vibes:

Songs: ${songs?.map((s: any) => `"${s.title}" by ${s.artist}`).join(', ').slice(0, 500)}

Current detected mood: ${currentMood || 'unknown'}

Respond with a JSON object containing:
- "mood": one word describing the dominant mood (e.g., "energetic", "chill", "melancholic", "upbeat", "romantic")
- "moodScore": 1-100 intensity score
- "recommendation": short suggestion for what to listen to next
- "colors": array of 2 hex colors that match the mood
- "emoji": single emoji representing the mood`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a music mood analyzer. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('Failed to analyze mood');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const moodData = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(moodData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in analyze-mood:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      mood: 'neutral',
      moodScore: 50,
      recommendation: 'Keep listening to discover your vibe',
      colors: ['#C41E3A', '#1a1a1a'],
      emoji: '🎵'
    }), {
      status: 200, // Return defaults on error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
