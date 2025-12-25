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
    const { focusType, duration, preference } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Creating focus session for:', focusType, duration, 'min');

    const prompt = `Design a focus/study music session:
Focus type: ${focusType || 'deep work'}
Duration: ${duration || 60} minutes
Preference: ${preference || 'instrumental'}

Create a JSON session plan:
{
  "sessionName": "creative name",
  "description": "brief description",
  "segments": [
    {
      "name": "segment name",
      "duration": 15,
      "style": "lo-fi/classical/ambient/electronic",
      "characteristics": ["no lyrics", "steady rhythm", "minimal dynamics"],
      "purpose": "what this segment helps with"
    }
  ],
  "tips": ["productivity tip 1", "tip 2"],
  "breaks": [
    {"after": 25, "duration": 5, "activity": "stretch/breathe"}
  ],
  "ambiance": "suggested background sound like rain, cafe, etc"
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
          { role: 'system', content: 'You are a productivity expert designing optimal focus soundscapes. Respond with JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create focus session');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const session = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(session), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid response format');
  } catch (error: unknown) {
    console.error('Error in focus-session:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionName: "Deep Focus",
      description: "Optimized for concentration",
      segments: [
        { name: "Entry", duration: 15, style: "ambient", characteristics: ["calm"], purpose: "ease into focus" }
      ],
      tips: ["Eliminate distractions", "Stay hydrated"],
      breaks: [{ after: 25, duration: 5, activity: "stretch" }],
      ambiance: "soft rain"
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
