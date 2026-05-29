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

const ytFetch = async (path: string, params: Record<string, string>) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube API ${path} ${res.status}: ${await res.text()}`);
  return res.json();
};

const collectVideoIds = async (
  kind: string,
  value: string,
  region: string,
  maxResults: number,
): Promise<string[]> => {
  const limit = Math.min(Math.max(maxResults, 1), 50);

  if (kind === "trending") {
    const data = await ytFetch("videos", {
      part: "id",
      chart: "mostPopular",
      videoCategoryId: "10", // Music
      regionCode: region || "US",
      maxResults: String(limit),
    });
    return (data.items ?? []).map((i: any) => i.id);
  }

  if (kind === "search") {
    const data = await ytFetch("search", {
      part: "id",
      q: value,
      type: "video",
      videoCategoryId: "10",
      maxResults: String(limit),
      regionCode: region || "US",
    });
    return (data.items ?? [])
      .map((i: any) => i.id?.videoId)
      .filter((v: unknown): v is string => typeof v === "string");
  }

  if (kind === "playlist") {
    // value can be playlist ID or playlist URL
    let playlistId = value.trim();
    const m = playlistId.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (m) playlistId = m[1];
    const data = await ytFetch("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: String(limit),
    });
    return (data.items ?? [])
      .map((i: any) => i.contentDetails?.videoId)
      .filter((v: unknown): v is string => typeof v === "string");
  }

  return [];
};

const fetchVideoDetails = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const data = await ytFetch("videos", {
    part: "snippet,contentDetails",
    id: ids.join(","),
  });
  return (data.items ?? []).map((item: any) => {
    const snippet = item.snippet ?? {};
    const thumbs = snippet.thumbnails ?? {};
    const thumbnail =
      thumbs.maxres?.url ??
      thumbs.standard?.url ??
      thumbs.high?.url ??
      thumbs.medium?.url ??
      thumbs.default?.url ??
      `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
    return {
      youtube_video_id: item.id,
      youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
      title: snippet.title ?? "Untitled",
      artist: snippet.channelTitle ?? "Unknown",
      thumbnail,
      cover_url: thumbnail,
      duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
      genre: snippet.tags?.[0] ?? null,
      is_public: true,
      source: "youtube",
      file_url: null,
      user_id: null,
    };
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Optional: ingest one specific source by id, else loop all enabled
    let sourceId: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body?.source_id) sourceId = body.source_id;
    }

    let q = supabase.from("ingestion_sources").select("*").eq("enabled", true);
    if (sourceId) q = q.eq("id", sourceId);
    const { data: sources, error: srcErr } = await q;
    if (srcErr) throw srcErr;

    const results: any[] = [];

    for (const src of sources ?? []) {
      try {
        const ids = await collectVideoIds(src.kind, src.value, src.region, src.max_results);
        const rows = await fetchVideoDetails(ids);

        let inserted = 0;
        if (rows.length > 0) {
          const { data, error } = await supabase
            .from("songs")
            .upsert(rows, { onConflict: "youtube_video_id", ignoreDuplicates: true })
            .select("id");
          if (error) throw error;
          inserted = data?.length ?? 0;
        }

        await supabase
          .from("ingestion_sources")
          .update({ last_run_at: new Date().toISOString(), last_error: null })
          .eq("id", src.id);

        results.push({ id: src.id, kind: src.kind, value: src.value, fetched: ids.length, inserted });
      } catch (err) {
        const msg = (err as Error).message;
        await supabase
          .from("ingestion_sources")
          .update({ last_run_at: new Date().toISOString(), last_error: msg })
          .eq("id", src.id);
        results.push({ id: src.id, error: msg });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});