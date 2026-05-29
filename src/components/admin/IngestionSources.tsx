import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Play, Plus, Radio, Search, ListVideo, Trash2 } from "lucide-react";

type Kind = "trending" | "search" | "playlist";

interface Source {
  id: string;
  kind: Kind;
  value: string;
  region: string;
  max_results: number;
  enabled: boolean;
  last_run_at: string | null;
  last_error: string | null;
}

const KIND_META: Record<Kind, { icon: any; label: string; help: string }> = {
  trending: { icon: Radio, label: "Trending music", help: "Pulls YouTube's Most Popular music chart for the region." },
  search: { icon: Search, label: "Search query", help: "Runs a YouTube search every day (e.g. 'afrobeats 2026')." },
  playlist: { icon: ListVideo, label: "YouTube playlist", help: "Syncs all videos from a public YouTube playlist (paste URL or ID)." },
};

const IngestionSources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  // New source form
  const [kind, setKind] = useState<Kind>("trending");
  const [value, setValue] = useState("");
  const [region, setRegion] = useState("US");
  const [maxResults, setMaxResults] = useState(15);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ingestion_sources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSources((data as Source[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (kind !== "trending" && !value.trim()) {
      toast.error("Please provide a search query or playlist URL/ID");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("ingestion_sources").insert({
      kind,
      value: kind === "trending" ? "" : value.trim(),
      region: region.toUpperCase().slice(0, 2) || "US",
      max_results: Math.min(Math.max(maxResults, 1), 50),
      enabled: true,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setValue("");
    toast.success("Source added");
    load();
  };

  const toggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from("ingestion_sources").update({ enabled }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("ingestion_sources").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const runNow = async (id?: string) => {
    setRunning(id ?? "all");
    const { data, error } = await supabase.functions.invoke("youtube-ingest", {
      body: id ? { source_id: id } : {},
    });
    setRunning(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    const results = (data as any)?.results ?? [];
    const totalInserted = results.reduce((n: number, r: any) => n + (r.inserted ?? 0), 0);
    const errs = results.filter((r: any) => r.error);
    if (errs.length) toast.error(`${errs.length} source(s) failed; ${totalInserted} new song(s) imported`);
    else toast.success(`Imported ${totalInserted} new song(s)`);
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add daily ingestion source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending music</SelectItem>
                  <SelectItem value="search">Search query</SelectItem>
                  <SelectItem value="playlist">YouTube playlist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                {kind === "trending" ? "Not required" : kind === "search" ? "Search query" : "Playlist URL or ID"}
              </Label>
              <Input
                value={value}
                disabled={kind === "trending"}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  kind === "search"
                    ? "e.g. afrobeats 2026"
                    : kind === "playlist"
                    ? "https://youtube.com/playlist?list=…"
                    : "—"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Max</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value || "10", 10))}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{KIND_META[kind].help}</p>

          <div className="flex gap-2">
            <Button onClick={add} disabled={adding} variant="glow">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add source
            </Button>
            <Button onClick={() => runNow()} disabled={running !== null} variant="outline">
              {running === "all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run all now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sources</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sources yet. Add one above — the daily job runs at 03:00 UTC.
            </p>
          ) : (
            <div className="space-y-3">
              {sources.map((s) => {
                const Icon = KIND_META[s.kind].icon;
                return (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{KIND_META[s.kind].label}</span>
                          <Badge variant="secondary">{s.region}</Badge>
                          <Badge variant="outline">max {s.max_results}</Badge>
                        </div>
                        {s.value && (
                          <p className="text-sm text-muted-foreground truncate mt-1">{s.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Last run: {s.last_run_at ? new Date(s.last_run_at).toLocaleString() : "never"}
                        </p>
                        {s.last_error && (
                          <p className="text-xs text-destructive mt-1 truncate">⚠ {s.last_error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={s.enabled} onCheckedChange={(c) => toggle(s.id, c)} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runNow(s.id)}
                        disabled={running !== null}
                      >
                        {running === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IngestionSources;