import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const extractId = (input: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
};

// ISO 8601 duration -> "H:MM:SS" or "M:SS"
const parseDuration = (iso: string): string => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const s = parseInt(m[3] ?? "0", 10);
  const ss = s.toString().padStart(2, "0");
  if (h > 0) return `${h}:${min.toString().padStart(2, "0")}:${ss}`;
  return `${min}:${ss}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "YOUTUBE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { url } = await req.json().catch(() => ({ url: "" }));
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'url' in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const videoId = extractId(url.trim());
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Could not extract a YouTube video ID from input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    apiUrl.searchParams.set("part", "snippet,contentDetails");
    apiUrl.searchParams.set("id", videoId);
    apiUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const res = await fetch(apiUrl.toString());
    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "YouTube API request failed", details: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) {
      return new Response(
        JSON.stringify({ error: "Video not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const snippet = item.snippet ?? {};
    const thumbs = snippet.thumbnails ?? {};
    const thumbnail =
      thumbs.maxres?.url ??
      thumbs.standard?.url ??
      thumbs.high?.url ??
      thumbs.medium?.url ??
      thumbs.default?.url ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return new Response(
      JSON.stringify({
        videoId,
        title: snippet.title ?? "",
        artist: snippet.channelTitle ?? "",
        description: snippet.description ?? "",
        thumbnail,
        duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
        publishedAt: snippet.publishedAt ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});