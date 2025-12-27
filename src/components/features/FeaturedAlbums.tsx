import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc, Star } from "lucide-react";
import { useFeaturedAlbums } from "@/hooks/useAlbums";
import { Link } from "react-router-dom";

const FeaturedAlbums = () => {
  const { data: albums, isLoading } = useFeaturedAlbums();

  if (isLoading || !albums || albums.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          Featured Albums
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {albums.slice(0, 6).map((album) => (
            <div key={album.id} className="group cursor-pointer">
              <div className="aspect-square rounded-lg bg-muted overflow-hidden relative">
                {album.cover_url ? (
                  <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                    <Disc className="w-8 h-8 text-purple-500/50" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium mt-2 truncate">{album.title}</p>
              <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedAlbums;
