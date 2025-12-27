import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, Trash2, CheckCircle, Users, Music, Star 
} from "lucide-react";
import { useFeaturedArtists } from "@/hooks/useAdmin";
import { usePromoteArtist, useRemoveFeaturedArtist } from "@/hooks/useArtistPromotion";
import { useSongs } from "@/hooks/useSongs";

const ArtistPromotion = () => {
  const { data: featuredArtists } = useFeaturedArtists();
  const { data: songs } = useSongs();
  const promoteArtist = usePromoteArtist();
  const removeArtist = useRemoveFeaturedArtist();

  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [monthlyListeners, setMonthlyListeners] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Get unique artists from songs
  const allArtists = songs
    ? Array.from(new Set(songs.map((s) => s.artist)))
    : [];

  const handlePromote = () => {
    if (!artistName.trim()) return;
    promoteArtist.mutate({
      artistName: artistName.trim(),
      bio: bio || undefined,
      imageUrl: imageUrl || undefined,
      monthlyListeners: parseInt(monthlyListeners) || 0,
      isVerified,
    });
    setArtistName("");
    setBio("");
    setImageUrl("");
    setMonthlyListeners("");
    setIsVerified(false);
  };

  const handleQuickPromote = (name: string) => {
    promoteArtist.mutate({
      artistName: name,
      isVerified: false,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Promote Artist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Artist Name *</Label>
              <Input
                placeholder="Enter artist name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Artist biography..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Listeners</Label>
              <Input
                type="number"
                placeholder="0"
                value={monthlyListeners}
                onChange={(e) => setMonthlyListeners(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={isVerified} onCheckedChange={setIsVerified} />
              <Label>Verified Artist</Label>
            </div>
          </div>
          <Button
            onClick={handlePromote}
            disabled={!artistName.trim() || promoteArtist.isPending}
            className="gap-2"
          >
            <Star className="w-4 h-4" />
            Promote Artist
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Quick Promote from Artists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allArtists.slice(0, 20).map((artist) => {
              const isFeatured = featuredArtists?.some((fa) => fa.artist_name === artist);
              return (
                <Button
                  key={artist}
                  variant={isFeatured ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isFeatured && handleQuickPromote(artist)}
                  disabled={isFeatured}
                >
                  {artist}
                  {isFeatured && <CheckCircle className="w-3 h-3 ml-1" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Featured Artists ({featuredArtists?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {featuredArtists?.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
                      {artist.image_url ? (
                        <img
                          src={artist.image_url}
                          alt={artist.artist_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{artist.artist_name}</p>
                        {artist.is_verified && (
                          <CheckCircle className="w-4 h-4 text-primary fill-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(artist.monthly_listeners || 0).toLocaleString()} listeners
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeArtist.mutate(artist.id)}
                    disabled={removeArtist.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!featuredArtists?.length && (
                <p className="text-center py-8 text-muted-foreground">
                  No featured artists yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistPromotion;
