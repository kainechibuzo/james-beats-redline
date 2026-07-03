import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Cloud, Music4, Search } from "lucide-react";

const GENRES = [
  "All",
  "Hip-Hop/Rap",
  "R&B/Soul",
  "Electronic",
  "Pop",
  "Rock",
  "Alternative",
  "Ambient",
  "Jazz",
  "Latin",
  "Reggae",
  "House",
  "Techno",
  "Dubstep",
  "Trap",
  "Lo-Fi",
];

const AudiusSeeder = () => {
  const [genre, setGenre] = useState("All");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [busy, setBusy] = useState<string | null>(null);

  const invoke = async (
    label: string,
    body: { kind: "trending" | "search"; value?: string; limit: number },
  ) => {
    setBusy(label);
    try {
      const { data, error } = await supabase.functions.invoke("audius-ingest", { body });
      if (error) throw error;
      const d = data as { inserted?: number; skipped?: number; fetched?: number; error?: string };
      if (d?.error) throw new Error(d.error);
      toast.success(
        `${label}: added ${d.inserted ?? 0} new / ${d.skipped ?? 0} dupes (fetched ${d.fetched ?? 0})`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ingest failed";
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          Audius Catalog Seeder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Import free full-length tracks from Audius. Songs stream natively — no YouTube.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Limit per import</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Math.min(100, Math.max(1, Number(e.target.value) || 50)))}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Trending by genre</label>
            <div className="flex gap-2">
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                onClick={() =>
                  invoke(`Trending ${genre}`, {
                    kind: "trending",
                    value: genre === "All" ? undefined : genre,
                    limit,
                  })
                }
                disabled={busy !== null}
              >
                {busy?.startsWith("Trending") ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music4 className="w-4 h-4" />}
                Import
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Search & import</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Kendrick Lamar, ambient, chill"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!query.trim()) return toast.error("Enter a search term");
                  invoke(`Search "${query}"`, { kind: "search", value: query.trim(), limit });
                }}
                disabled={busy !== null || !query.trim()}
              >
                {busy?.startsWith("Search") ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Import
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudiusSeeder;
