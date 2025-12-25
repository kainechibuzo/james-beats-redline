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
    const { activity, duration, intensity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating workout mix for:', activity, duration, 'min');

    const prompt = `Create a workout playlist structure for:
Activity: ${activity || 'general workout'}
Duration: ${duration || 30} minutes
Intensity: ${intensity || 'moderate'}

Return a JSON playlist plan:
{
  "name": "creative playlist name",
  "description": "motivating description",
  "phases": [
    {
      "name": "Warm-up",
      "duration": 5,
      "bpmRange": "100-120",
      "genres": ["pop", "electronic"],
      "energy": "building"
    },
    {
      "name": "Peak",
      "duration": 20,
      "bpmRange": "140-160",
      "genres": ["edm", "hip-hop"],
      "energy": "high"
    },
    {
      "name": "Cool-down",
      "duration": 5,
      "bpmRange": "90-110",
      "genres": ["ambient", "chill"],
      "energy": "decreasing"
    }
  ],
  "motivationalQuote": "inspiring quote for the workout"
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
          { role: 'system', content: 'You are a fitness DJ creating optimal workout soundtracks. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate workout mix');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const mix = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(mix), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in workout-mix:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      name: "Power Hour",
      description: "Get moving with this energizing mix",
      phases: [
        { name: "Warm-up", duration: 5, bpmRange: "100-120", genres: ["pop"], energy: "building" },
        { name: "Peak", duration: 20, bpmRange: "140-160", genres: ["electronic"], energy: "high" },
        { name: "Cool-down", duration: 5, bpmRange: "90-110", genres: ["ambient"], energy: "decreasing" }
      ],
      motivationalQuote: "Push your limits!"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
