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
    const { title, artist, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating lyrics for:', title, 'by', artist);

    const prompt = `Generate creative song lyrics for a song called "${title}" by ${artist}.
Mood: ${mood || 'emotional'}

Create lyrics with:
- Verse 1 (4 lines)
- Chorus (4 lines)  
- Verse 2 (4 lines)
- Bridge (2 lines)
- Final Chorus (4 lines)

Format as JSON with structure:
{
  "sections": [
    {"type": "verse1", "lines": ["line1", "line2", "line3", "line4"]},
    {"type": "chorus", "lines": ["line1", "line2", "line3", "line4"]},
    ...
  ],
  "theme": "brief theme description"
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
          { role: 'system', content: 'You are a talented songwriter. Create original, meaningful lyrics. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate lyrics');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const lyrics = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(lyrics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in generate-lyrics:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      sections: [
        { type: "verse1", lines: ["Words echo in the night", "Dancing through the light", "Finding what we seek", "When hearts begin to speak"] }
      ],
      theme: "A journey of discovery"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
