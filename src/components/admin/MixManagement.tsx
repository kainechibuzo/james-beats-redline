import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search, Star, Eye, EyeOff } from "lucide-react";
import { extractYouTubeId, formatMixTime, type Mix, type MixTrack } from "@/hooks/useMixes";

interface DraftTrack {
  title: string;
  artist: string;
  timestamp: string; // mm:ss or hh:mm:ss
}

const parseTimestamp = (ts: string): number | null => {
  const parts = ts.trim().split(":").map((p) => p.trim());
  if (!parts.every((p) => /^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
};

const MixManagement = () => {
  const queryClient = useQueryClient();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tracks, setTracks] = useState<DraftTrack[]>([
    { title: "", artist: "", timestamp: "0:00" },
  ]);

  const { data: mixes, isLoading: loadingMixes } = useQuery({
    queryKey: ["admin-mixes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mixes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Mix[];
    },
  });

  const fetchMeta = useMutation({
    mutationFn: async (url: string) => {
      const id = extractYouTubeId(url);
      if (!id) throw new Error("Invalid YouTube URL or ID");
      const { data, error } = await supabase.functions.invoke("youtube-metadata", {
        body: { url },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as {
        videoId: string;
        title: string;
        artist: string;
        thumbnail: string;
        duration: string;
      };
    },
    onSuccess: (data) => {
      setVideoId(data.videoId);
      setTitle((prev) => prev || data.title);
      setArtist((prev) => prev || data.artist);
      setThumbnail(data.thumbnail);
      setTotalDuration(data.duration);
      toast.success("Metadata loaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setYoutubeUrl("");
    setTitle("");
    setArtist("");
    setThumbnail("");
    setTotalDuration("");
    setVideoId("");
    setIsPublic(true);
    setIsFeatured(false);
    setTracks([{ title: "", artist: "", timestamp: "0:00" }]);
  };

  const saveMix = useMutation({
    mutationFn: async () => {
      if (!videoId) throw new Error("Fetch metadata first");
      if (!title.trim()) throw new Error("Title is required");

      const parsedTracks: MixTrack[] = [];
      for (const [i, t] of tracks.entries()) {
        if (!t.title.trim() && !t.artist.trim() && !t.timestamp.trim()) continue;
        const secs = parseTimestamp(t.timestamp);
        if (secs === null) throw new Error(`Invalid timestamp on track ${i + 1}`);
        if (!t.title.trim()) throw new Error(`Title required on track ${i + 1}`);
        parsedTracks.push({
          title: t.title.trim(),
          artist: t.artist.trim() || artist || "Unknown",
          startSeconds: secs,
        });
      }
      parsedTracks.sort((a, b) => a.startSeconds - b.startSeconds);

      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from("mixes").insert({
        user_id: userRes.user?.id ?? null,
        title: title.trim(),
        artist: artist.trim() || null,
        youtube_video_id: videoId,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: thumbnail || null,
        total_duration: totalDuration || null,
        tracks: parsedTracks as unknown as never,
        is_public: isPublic,
        is_featured: isFeatured,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mix saved");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-mixes"] });
      queryClient.invalidateQueries({ queryKey: ["mixes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMix = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mixes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mix deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-mixes"] });
      queryClient.invalidateQueries({ queryKey: ["mixes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "is_public" | "is_featured"; value: boolean }) => {
      const { error } = await supabase.from("mixes").update({ [field]: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mixes"] });
      queryClient.invalidateQueries({ queryKey: ["mixes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a Mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>YouTube URL or Video ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <Button
                onClick={() => fetchMeta.mutate(youtubeUrl)}
                disabled={!youtubeUrl || fetchMeta.isPending}
              >
                {fetchMeta.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Fetch</span>
              </Button>
            </div>
          </div>

          {videoId && (
            <div className="flex gap-4 items-start rounded-lg border border-border p-3 bg-muted/30">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-32 aspect-video rounded object-cover"
                />
              )}
              <div className="flex-1 text-sm space-y-1">
                <p className="font-medium truncate">{title}</p>
                <p className="text-muted-foreground truncate">{artist}</p>
                <p className="text-xs text-muted-foreground">
                  Duration: {totalDuration} · ID: {videoId}
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mix Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Curator / Channel</Label>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} id="mix-public" />
              <Label htmlFor="mix-public">Public</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="mix-featured" />
              <Label htmlFor="mix-featured">Featured</Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tracklist (timestamps: mm:ss or hh:mm:ss)</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setTracks((t) => [...t, { title: "", artist: "", timestamp: "0:00" }])
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add track
              </Button>
            </div>
            <div className="space-y-2">
              {tracks.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_90px_auto] gap-2">
                  <Input
                    placeholder="Track title"
                    value={t.title}
                    onChange={(e) =>
                      setTracks((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <Input
                    placeholder="Artist"
                    value={t.artist}
                    onChange={(e) =>
                      setTracks((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, artist: e.target.value } : x)),
                      )
                    }
                  />
                  <Input
                    placeholder="0:00"
                    value={t.timestamp}
                    onChange={(e) =>
                      setTracks((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, timestamp: e.target.value } : x)),
                      )
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setTracks((arr) => arr.filter((_, j) => j !== i))}
                    disabled={tracks.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => saveMix.mutate()} disabled={saveMix.isPending || !videoId}>
              {saveMix.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Mix
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Mixes ({mixes?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {loadingMixes ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !mixes?.length ? (
              <p className="text-sm text-muted-foreground">No mixes yet.</p>
            ) : (
              <div className="space-y-2">
                {mixes.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-2"
                  >
                    <img
                      src={
                        m.thumbnail ||
                        `https://i.ytimg.com/vi/${m.youtube_video_id}/hqdefault.jpg`
                      }
                      alt={m.title}
                      className="w-20 aspect-video object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.artist ?? "—"} · {(m.tracks ?? []).length} tracks ·{" "}
                        {m.total_duration ?? formatMixTime(0)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={m.is_featured ? "Unfeature" : "Feature"}
                      onClick={() =>
                        toggleFlag.mutate({
                          id: m.id,
                          field: "is_featured",
                          value: !m.is_featured,
                        })
                      }
                    >
                      <Star
                        className={
                          m.is_featured
                            ? "w-4 h-4 fill-primary text-primary"
                            : "w-4 h-4"
                        }
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={m.is_public ? "Make private" : "Make public"}
                      onClick={() =>
                        toggleFlag.mutate({
                          id: m.id,
                          field: "is_public",
                          value: !m.is_public,
                        })
                      }
                    >
                      {m.is_public ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete "${m.title}"?`)) deleteMix.mutate(m.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MixManagement;