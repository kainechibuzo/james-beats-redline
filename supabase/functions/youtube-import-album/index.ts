import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const parseDuration = (iso: string): number => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return parseInt(m[1] ?? "0") * 3600 + parseInt(m[2] ?? "0") * 60 + parseInt(m[3] ?? "0");
};

const yt = async (path: string, params: Record<string, string>) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${await res.text()}`);
  return res.json();
};

const extractPlaylistId = (input: string): string => {
  const m = input.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : input.trim();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY missing");
    const { playlistUrl, asAlbum = true, userId } = await req.json();
    if (!playlistUrl) throw new Error("playlistUrl required");
    if (asAlbum && !userId) throw new Error("userId required when asAlbum=true");

    const playlistId = extractPlaylistId(playlistUrl);

    // Playlist meta
    const meta = await yt("playlists", { part: "snippet", id: playlistId });
    const playlist = meta.items?.[0];
    if (!playlist) throw new Error("Playlist not found");
    const pSnippet = playlist.snippet ?? {};
    const playlistTitle = pSnippet.title ?? "YouTube Playlist";
    const playlistArtist = pSnippet.channelTitle ?? "Various";
    const pThumbs = pSnippet.thumbnails ?? {};
    const playlistCover =
      pThumbs.maxres?.url ?? pThumbs.high?.url ?? pThumbs.medium?.url ?? pThumbs.default?.url ?? null;

    // Page through items
    const videoIds: string[] = [];
    let pageToken: string | undefined;
    for (let i = 0; i < 5; i++) {
      const params: Record<string, string> = {
        part: "contentDetails",
        playlistId,
        maxResults: "50",
      };
      if (pageToken) params.pageToken = pageToken;
      const page = await yt("playlistItems", params);
      for (const it of page.items ?? []) {
        const id = it.contentDetails?.videoId;
        if (id) videoIds.push(id);
      }
      pageToken = page.nextPageToken;
      if (!pageToken) break;
    }

    if (videoIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, inserted: 0, albumId: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch details in chunks of 50
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let albumId: string | null = null;
    if (asAlbum) {
      const { data: album, error } = await supabase
        .from("albums")
        .insert({
          user_id: userId,
          title: playlistTitle,
          artist: playlistArtist,
          cover_url: playlistCover,
          is_public: true,
          description: `Imported from YouTube playlist`,
        })
        .select("id")
        .single();
      if (error) throw error;
      albumId = album.id;
    }

    const rows: any[] = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const det = await yt("videos", { part: "snippet,contentDetails", id: chunk.join(",") });
      for (const item of det.items ?? []) {
        const s = item.snippet ?? {};
        const thumbs = s.thumbnails ?? {};
        const thumbnail =
          thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ??
          `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
        rows.push({
          youtube_video_id: item.id,
          youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
          title: s.title ?? "Untitled",
          artist: s.channelTitle ?? playlistArtist,
          album: asAlbum ? playlistTitle : null,
          album_id: albumId,
          thumbnail,
          cover_url: thumbnail,
          duration: parseDuration(item.contentDetails?.duration ?? "PT0S"),
          is_public: true,
          source: "youtube",
          file_url: null,
          user_id: null,
        });
      }
    }

    const { data: inserted, error: upErr } = await supabase
      .from("songs")
      .upsert(rows, { onConflict: "youtube_video_id", ignoreDuplicates: false })
      .select("id");
    if (upErr) throw upErr;

    return new Response(
      JSON.stringify({
        ok: true,
        albumId,
        title: playlistTitle,
        inserted: inserted?.length ?? 0,
        total: rows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
