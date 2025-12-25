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
    const { title, artist, lyrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing song:', title, 'by', artist);

    const prompt = `Analyze this song and provide insights:

Song: "${title}" by ${artist}
${lyrics ? `Lyrics excerpt: ${lyrics.slice(0, 500)}` : ''}

Provide a detailed analysis in JSON format:
{
  "summary": "2-3 sentence overview of the song",
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "primary mood",
  "energy": "low/medium/high",
  "tempo": "slow/moderate/fast",
  "bestFor": ["activity1", "activity2"],
  "similarArtists": ["artist1", "artist2", "artist3"],
  "funFact": "interesting fact or interpretation",
  "era": "estimated musical era/decade style"
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
          { role: 'system', content: 'You are a music critic and analyst. Provide insightful, interesting analysis. Respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze song');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in song-insights:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      summary: "A captivating track that showcases the artist's unique style.",
      themes: ["emotion", "journey", "connection"],
      mood: "reflective",
      energy: "medium",
      tempo: "moderate",
      bestFor: ["evening listening", "focus time"],
      similarArtists: [],
      funFact: "Music connects us all",
      era: "contemporary"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
