import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const parseDuration = (iso: string): number => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    parseInt(m[1] ?? "0", 10) * 3600 +
    parseInt(m[2] ?? "0", 10) * 60 +
    parseInt(m[3] ?? "0", 10)
  );
};

const yt = async (path: string, params: Record<string, string>) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${await res.text()}`);
  return res.json();
};

const isOfficialChannel = (channelTitle: string, query: string): boolean => {
  const c = (channelTitle || "").toLowerCase();
  if (c.endsWith("- topic")) return true;
  if (c.includes("vevo")) return true;
  const q = query.toLowerCase().trim();
  if (q && c.includes(q)) return true;
  return false;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY missing");
    const { query, maxResults = 15, officialOnly = false } = await req.json().catch(() => ({}));
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fetchCount = officialOnly ? 50 : Math.min(Math.max(maxResults, 1), 25);

    const search = await yt("search", {
      part: "id",
      q: query,
      type: "video",
      videoCategoryId: "10",
      maxResults: String(fetchCount),
    });
    const ids = (search.items ?? [])
      .map((i: any) => i.id?.videoId)
      .filter((v: unknown): v is string => typeof v === "string");

    if (ids.length === 0) {
      return new Response(JSON.stringify({ ok: true, songs: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const details = await yt("videos", {
      part: "snippet,contentDetails",
      id: ids.join(","),
    });

    let rows = (details.items ?? []).map((item: any) => {
      const s = item.snippet ?? {};
      const thumbs = s.thumbnails ?? {};
      const thumbnail =
        thumbs.maxres?.url ?? thumbs.standard?.url ?? thumbs.high?.url ??
        thumbs.medium?.url ?? thumbs.default?.url ??
        `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
      const channelTitle = s.channelTitle ?? "Unknown";
      // Clean " - Topic" suffix for display
      const artistName = channelTitle.replace(/\s*-\s*Topic\s*$/i, "").replace(/VEVO$/i, "").trim() || channelTitle;
      return {
        _channelTitle: channelTitle,
        youtube_video_id: item.id,
        youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
        title: s.title ?? "Untitled",
        artist: artistName,
        thumbnail,
        cover_url: thumbnail,
        duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
        is_public: true,
        source: "youtube",
        file_url: null,
        user_id: null,
      };
    });

    if (officialOnly) {
      rows = rows.filter((r: any) => isOfficialChannel(r._channelTitle, query));
    }
    rows = rows.slice(0, Math.min(Math.max(maxResults, 1), 25));
    const finalIds = rows.map((r: any) => r.youtube_video_id);
    rows.forEach((r: any) => delete r._channelTitle);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (rows.length > 0) {
      await supabase.from("songs").upsert(rows, {
        onConflict: "youtube_video_id",
        ignoreDuplicates: true,
      });
    }

    const { data: songs } = finalIds.length
      ? await supabase.from("songs").select("*").in("youtube_video_id", finalIds)
      : { data: [] as any[] };


    // Preserve YouTube relevance order
    const order = new Map(ids.map((id: string, i: number) => [id, i]));
    const sorted = (songs ?? []).sort(
      (a: any, b: any) =>
        (order.get(a.youtube_video_id) ?? 0) - (order.get(b.youtube_video_id) ?? 0),
    );

    return new Response(JSON.stringify({ ok: true, songs: sorted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
