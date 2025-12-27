import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Music, Clock, Heart } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLikedSongs, useRecentlyPlayed } from "@/hooks/useSongs";

const StatsWidget = () => {
  const { data: profile } = useProfile();
  const { data: likedSongs } = useLikedSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();

  const stats = [
    { label: "Total Plays", value: profile?.total_plays || 0, icon: TrendingUp, color: "text-green-400" },
    { label: "Liked Songs", value: likedSongs?.length || 0, icon: Heart, color: "text-pink-400" },
    { label: "Recent Plays", value: recentlyPlayed?.length || 0, icon: Clock, color: "text-blue-400" },
    { label: "Total Likes", value: profile?.total_likes || 0, icon: Music, color: "text-purple-400" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted rounded-lg">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsWidget;
