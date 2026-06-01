import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, ListMusic, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const YouTubePlaylistImporter = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [asAlbum, setAsAlbum] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ albumId: string | null; title: string; inserted: number } | null>(null);

  const run = async () => {
    if (!url.trim() || !user) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-import-album", {
        body: { playlistUrl: url.trim(), asAlbum, userId: user.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ albumId: data.albumId, title: data.title, inserted: data.inserted });
      toast.success(`Imported ${data.inserted} tracks${data.albumId ? ` as album "${data.title}"` : ""}`);
      qc.invalidateQueries({ queryKey: ["songs"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListMusic className="w-5 h-5" /> Import YouTube Playlist / Album
        </CardTitle>
        <CardDescription>
          Paste a YouTube playlist URL (or full album playlist) to ingest every track. Optionally
          creates a James Beats album that groups them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Playlist URL or ID</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=PL..."
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={asAlbum} onCheckedChange={setAsAlbum} id="as-album" />
            <Label htmlFor="as-album" className="cursor-pointer">Create album</Label>
          </div>
          <Button onClick={run} disabled={!url.trim() || loading || !user}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Import
          </Button>
        </div>
        {result && (
          <div className="text-sm bg-muted/40 rounded-md p-3 flex items-center justify-between">
            <span>Imported {result.inserted} tracks — {result.title}</span>
            {result.albumId && (
              <Button asChild size="sm" variant="ghost">
                <Link to={`/album/${result.albumId}`}>
                  Open <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubePlaylistImporter;
