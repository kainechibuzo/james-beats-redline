import { useState } from "react";
import { Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SongCard from "@/components/home/SongCard";
import type { Song } from "@/hooks/useSongs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface Props {
  query: string;
}

const YouTubeSearch = ({ query }: Props) => {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [officialOnly, setOfficialOnly] = useState(true);
  const qc = useQueryClient();

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSongs(null);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-search", {
        body: { query: query.trim(), maxResults: 20, officialOnly },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSongs(data?.songs ?? []);
      qc.invalidateQueries({ queryKey: ["songs"] });
    } catch (e) {
      toast({
        title: "Search failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Youtube className="w-5 h-5" />
          Search YouTube
        </h2>
        <div className="flex items-center gap-3">
          <label className="text-xs flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={officialOnly}
              onChange={(e) => setOfficialOnly(e.target.checked)}
              className="accent-primary"
            />
            Official artist only
          </label>
          <Button onClick={runSearch} disabled={loading || !query.trim()} variant="default" size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>
      {songs && songs.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} compact />
          ))}
        </div>
      )}
      {songs && songs.length === 0 && (
        <p className="text-sm text-muted-foreground">No YouTube results.</p>
      )}
    </section>
  );
};

export default YouTubeSearch;
