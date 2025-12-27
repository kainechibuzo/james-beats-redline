import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";

const TrendingTags = () => {
  const { data: songs } = useSongs();

  // Extract unique genres from songs
  const genres = songs
    ? Array.from(new Set(songs.map((s) => s.genre).filter(Boolean)))
        .slice(0, 12)
        .map((genre) => ({
          name: genre,
          count: songs.filter((s) => s.genre === genre).length,
        }))
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Genres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <div key={genre.name}>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Hash className="w-3 h-3 mr-1" />
                {genre.name}
                <span className="ml-1 opacity-60">({genre.count})</span>
              </Badge>
            </div>
          ))}
          {genres.length === 0 && (
            <p className="text-sm text-muted-foreground">No genres found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTags;
