import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const APP = "jamesbeats";

let cachedHost: string | null = null;
async function getHost(): Promise<string> {
  if (cachedHost) return cachedHost;
  const res = await fetch("https://api.audius.co");
  const j = await res.json();
  const list: string[] = j?.data ?? [];
  if (!list.length) throw new Error("No Audius discovery hosts available");
  cachedHost = list[Math.floor(Math.random() * list.length)];
  return cachedHost;
}

type AudiusTrack = {
  id: string;
  title: string;
  duration: number;
  genre?: string;
  mood?: string;
  release_date?: string;
  user?: { name?: string; handle?: string };
  artwork?: Record<string, string>;
};

function mapTrack(t: AudiusTrack, host: string) {
  const cover =
    t.artwork?.["1000x1000"] ||
    t.artwork?.["480x480"] ||
    t.artwork?.["150x150"] ||
    null;
  const artist = t.user?.name || t.user?.handle || "Unknown Artist";
  return {
    title: t.title,
    artist,
    genre: t.genre ?? null,
    duration: Math.max(0, Math.floor(t.duration || 0)),
    cover_url: cover,
    thumbnail: cover,
    file_url: `${host}/v1/tracks/${t.id}/stream?app_name=${APP}`,
    source: "audius",
    youtube_video_id: `audius:${t.id}`,
    is_public: true,
  };
}

async function fetchTracks(kind: string, value: string | undefined, limit: number) {
  const host = await getHost();
  let url = "";
  if (kind === "trending") {
    const g = value ? `&genre=${encodeURIComponent(value)}` : "";
    url = `${host}/v1/tracks/trending?time=week${g}&app_name=${APP}`;
  } else if (kind === "search") {
    if (!value) throw new Error("search requires a value");
    url = `${host}/v1/tracks/search?query=${encodeURIComponent(value)}&app_name=${APP}`;
  } else {
    throw new Error(`Unknown kind: ${kind}`);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audius fetch failed: ${res.status}`);
  const j = await res.json();
  const rows: AudiusTrack[] = (j?.data ?? []).slice(0, limit);
  return { host, rows };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || "trending");
    const value: string | undefined = body.value ? String(body.value) : undefined;
    const limit = Math.min(100, Math.max(1, Number(body.limit) || 50));

    const { host, rows } = await fetchTracks(kind, value, limit);
    const mapped = rows.map((t) => mapTrack(t, host)).filter((r) => r.title && r.artist);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let inserted = 0;
    let skipped = 0;
    for (const row of mapped) {
      const { error } = await supabase
        .from("songs")
        .upsert(row, { onConflict: "youtube_video_id", ignoreDuplicates: true });
      if (error) skipped++;
      else inserted++;
    }

    return new Response(
      JSON.stringify({ ok: true, fetched: rows.length, inserted, skipped, host }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
