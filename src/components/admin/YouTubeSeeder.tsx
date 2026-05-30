import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Radio, Tv, Mic, Music } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Kind = "radio" | "live" | "podcasts" | "songs";

const PRESETS: Record<Kind, { label: string; query: string; genre?: string; category?: string }[]> = {
  radio: [
    { label: "Lofi Hip Hop", query: "lofi hip hop radio beats to relax", genre: "Hip Hop" },
    { label: "Jazz", query: "jazz cafe live radio", genre: "Jazz" },
    { label: "Afrobeats", query: "afrobeats live radio", genre: "Afrobeats" },
    { label: "Gospel", query: "gospel music live", genre: "Gospel" },
    { label: "Pop Hits", query: "pop music live radio", genre: "Pop" },
  ],
  live: [
    { label: "Formula 1", query: "F1 highlights live", category: "F1" },
    { label: "NBA", query: "NBA highlights live", category: "NBA" },
    { label: "Premier League", query: "Premier League highlights", category: "EPL" },
    { label: "UFC", query: "UFC highlights", category: "UFC" },
    { label: "Esports", query: "esports tournament live", category: "Esports" },
  ],
  podcasts: [
    { label: "Tech", query: "tech podcast 2025", genre: "Tech" },
    { label: "Business", query: "business podcast 2025", genre: "Business" },
    { label: "Comedy", query: "comedy podcast clips", genre: "Comedy" },
    { label: "True Crime", query: "true crime podcast", genre: "True Crime" },
  ],
  songs: [
    { label: "Trending", query: "trending songs 2025", genre: "Pop" },
    { label: "Afrobeats", query: "afrobeats hits 2025", genre: "Afrobeats" },
    { label: "Hip Hop", query: "hip hop hits 2025", genre: "Hip Hop" },
    { label: "R&B", query: "rnb hits 2025", genre: "R&B" },
  ],
};

const KIND_META: Record<Kind, { icon: any; label: string }> = {
  radio: { icon: Radio, label: "Radio Stations" },
  live: { icon: Tv, label: "Live / Sports" },
  podcasts: { icon: Mic, label: "Podcasts" },
  songs: { icon: Music, label: "Songs / Categories" },
};

const YouTubeSeeder = () => {
  const [kind, setKind] = useState<Kind>("radio");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [maxResults, setMaxResults] = useState(10);
  const [loading, setLoading] = useState<string | null>(null);
  const qc = useQueryClient();

  const invalidate = (k: Kind) => {
    if (k === "radio") qc.invalidateQueries({ queryKey: ["radio-stations"] });
    if (k === "live") qc.invalidateQueries({ queryKey: ["live-streams"] });
    if (k === "podcasts") qc.invalidateQueries({ queryKey: ["podcasts"] });
    if (k === "songs") qc.invalidateQueries({ queryKey: ["songs"] });
  };

  const run = async (k: Kind, q: string, opts: { genre?: string; category?: string; max?: number } = {}) => {
    const tag = `${k}:${q}`;
    setLoading(tag);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-fetch", {
        body: {
          kind: k,
          query: q,
          maxResults: opts.max ?? maxResults,
          genre: opts.genre,
          category: opts.category,
        },
      });
      if (error) throw error;
      toast.success(`Added ${data?.inserted ?? 0} ${k} items for "${q}"`);
      invalidate(k);
    } catch (err: any) {
      toast.error(err?.message ?? "Fetch failed");
    } finally {
      setLoading(null);
    }
  };

  const Icon = KIND_META[kind].icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> YouTube-powered content
        </CardTitle>
        <CardDescription>
          Pull live YouTube content into Radio, Live/Sports, Podcasts, or Songs. All items are
          played through the in-app YouTube player.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Section</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_META) as Kind[]).map((k) => (
                  <SelectItem key={k} value={k}>{KIND_META[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Search query</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. F1 highlights, jcole, lofi hip hop" />
          </div>
          <div>
            <Label>Tag (genre / category)</Label>
            <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="optional" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label className="whitespace-nowrap">Max results</Label>
          <Input
            type="number"
            min={1}
            max={25}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value) || 10)}
            className="w-24"
          />
          <Button
            disabled={!query || !!loading}
            onClick={() => run(kind, query, { genre: genre || undefined, category: genre || undefined })}
          >
            {loading === `${kind}:${query}` ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Icon className="w-4 h-4 mr-2" />}
            Fetch & save
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Quick presets — {KIND_META[kind].label}</h3>
          <div className="flex flex-wrap gap-2">
            {PRESETS[kind].map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                disabled={!!loading}
                onClick={() => run(kind, p.query, { genre: p.genre, category: p.category })}
              >
                {loading === `${kind}:${p.query}` && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeSeeder;
