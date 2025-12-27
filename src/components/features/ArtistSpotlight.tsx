import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Music, CheckCircle } from "lucide-react";
import { useFeaturedArtists } from "@/hooks/useAdmin";
import { Link } from "react-router-dom";

const ArtistSpotlight = () => {
  const { data: featuredArtists } = useFeaturedArtists();

  if (!featuredArtists || featuredArtists.length === 0) return null;

  const topArtist = featuredArtists[0];

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Artist Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Link to={`/artist/${encodeURIComponent(topArtist.artist_name)}`}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
              {topArtist.image_url ? (
                <img src={topArtist.image_url} alt={topArtist.artist_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{topArtist.artist_name}</h3>
                {topArtist.is_verified && (
                  <CheckCircle className="w-4 h-4 text-primary fill-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {topArtist.bio || "Featured artist on James Beats"}
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {(topArtist.monthly_listeners || 0).toLocaleString()} listeners
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ArtistSpotlight;
