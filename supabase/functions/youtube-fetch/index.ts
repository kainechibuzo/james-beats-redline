import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const parseDuration = (iso: string): number => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return parseInt(m[1] ?? "0", 10) * 3600 + parseInt(m[2] ?? "0", 10) * 60 + parseInt(m[3] ?? "0", 10);
};

const yt = async (path: string, params: Record<string, string>) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${await res.text()}`);
  return res.json();
};

const pickThumb = (s: any, videoId: string) => {
  const t = s?.thumbnails ?? {};
  return t.maxres?.url ?? t.standard?.url ?? t.high?.url ?? t.medium?.url ?? t.default?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
};

async function searchVideos(query: string, maxResults: number, eventType?: "live" | "completed") {
  const params: Record<string, string> = {
    part: "id,snippet",
    q: query,
    type: "video",
    maxResults: String(Math.min(Math.max(maxResults, 1), 25)),
  };
  if (eventType) params.eventType = eventType;
  const search = await yt("search", params);
  return (search.items ?? []).filter((i: any) => i.id?.videoId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY missing");
    const { kind, query, maxResults = 10, genre, category = "general" } = await req.json();
    if (!kind || !query) throw new Error("kind and query required");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (kind === "radio") {
      // Live YouTube streams as radio stations
      const items = await searchVideos(query, maxResults, "live");
      const rows = items.map((i: any) => {
        const vid = i.id.videoId;
        return {
          name: i.snippet?.title ?? query,
          description: i.snippet?.channelTitle ?? "",
          stream_url: `https://www.youtube.com/watch?v=${vid}`,
          cover_url: pickThumb(i.snippet, vid),
          genre: genre ?? null,
          is_live: true,
          is_featured: false,
          listener_count: 0,
        };
      });
      if (rows.length) {
        // No unique constraint — clear matching genre/query bucket and re-insert
        if (genre) await supabase.from("radio_stations").delete().eq("genre", genre);
        await supabase.from("radio_stations").insert(rows);
      }
      return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (kind === "live") {
      // Live or recent sports / events into live_streams
      const items = await searchVideos(query, maxResults, "live");
      const rows = items.map((i: any) => {
        const vid = i.id.videoId;
        return {
          title: i.snippet?.title ?? query,
          description: i.snippet?.description ?? "",
          stream_url: `https://www.youtube.com/watch?v=${vid}`,
          cover_url: pickThumb(i.snippet, vid),
          host_name: i.snippet?.channelTitle ?? null,
          category,
          is_live: true,
          viewer_count: 0,
        };
      });
      if (rows.length) {
        await supabase.from("live_streams").delete().eq("category", category);
        await supabase.from("live_streams").insert(rows);
      }
      return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (kind === "podcasts") {
      // Each video becomes a podcast w/ a single "episode"
      const items = await searchVideos(query, maxResults);
      const ids = items.map((i: any) => i.id.videoId);
      const details = ids.length
        ? (await yt("videos", { part: "snippet,contentDetails", id: ids.join(",") })).items ?? []
        : [];
      let inserted = 0;
      for (const item of details) {
        const vid = item.id;
        const cover = pickThumb(item.snippet, vid);
        const { data: pod } = await supabase
          .from("podcasts")
          .insert({
            title: item.snippet?.title ?? query,
            description: item.snippet?.description ?? "",
            host: item.snippet?.channelTitle ?? null,
            cover_url: cover,
            category: genre ?? category,
            is_featured: false,
            subscriber_count: 0,
          })
          .select()
          .single();
        if (pod) {
          await supabase.from("podcast_episodes").insert({
            podcast_id: pod.id,
            title: item.snippet?.title ?? "Episode",
            description: item.snippet?.description ?? "",
            audio_url: `https://www.youtube.com/watch?v=${vid}`,
            duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
          });
          inserted++;
        }
      }
      return new Response(JSON.stringify({ ok: true, inserted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (kind === "songs") {
      const items = await searchVideos(query, maxResults);
      const ids = items.map((i: any) => i.id.videoId);
      if (!ids.length) return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      const details = await yt("videos", { part: "snippet,contentDetails", id: ids.join(",") });
      const rows = (details.items ?? []).map((item: any) => {
        const vid = item.id;
        const thumb = pickThumb(item.snippet, vid);
        return {
          youtube_video_id: vid,
          youtube_url: `https://www.youtube.com/watch?v=${vid}`,
          title: item.snippet?.title ?? "Untitled",
          artist: item.snippet?.channelTitle ?? "Unknown",
          thumbnail: thumb,
          cover_url: thumb,
          genre: genre ?? null,
          duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
          is_public: true,
          source: "youtube",
          file_url: null,
          user_id: null,
        };
      });
      await supabase.from("songs").upsert(rows, { onConflict: "youtube_video_id", ignoreDuplicates: true });
      return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown kind: ${kind}`);
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
