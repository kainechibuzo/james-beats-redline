import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListeningStats, useTopTracks } from "@/hooks/useStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Music, Clock, TrendingUp, Users, Disc, Heart, 
  Calendar, Sun, Moon, Sunrise, Share2, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const YearlyRecap = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useListeningStats();
  const { data: topTracks, isLoading: tracksLoading } = useTopTracks("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Calendar className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Year in Music</h1>
        <p className="text-muted-foreground mb-6">Sign in to see your personalized listening recap</p>
        <Button variant="glow" asChild>
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    );
  }

  const isLoading = statsLoading || tracksLoading;

  if (isLoading) {
    return (
      <div className="pb-32 animate-fade-in">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate additional stats
  const totalHours = Math.floor((stats?.totalMinutes || 0) / 60);
  const uniqueArtists = stats?.topArtists?.length || 0;
  const topGenre = stats?.topGenres?.[0]?.genre || "Various";
  const streak = stats?.listeningStreak || 0;

  // Genre distribution
  const totalGenrePlays = stats?.topGenres?.reduce((acc, g) => acc + g.count, 0) || 1;
  const genrePercentages = stats?.topGenres?.map(g => ({
    genre: g.genre,
    percentage: Math.round((g.count / totalGenrePlays) * 100),
  })) || [];

  // Listening personality based on top genre and habits
  const getPersonality = () => {
    if (!topGenre) return "Music Explorer";
    const personalities: Record<string, string> = {
      "Electronic": "Beat Rider",
      "Pop": "Chart Chaser",
      "Rock": "Riff Master",
      "Hip Hop": "Flow State",
      "Jazz": "Smooth Operator",
      "Classical": "Timeless Soul",
      "Ambient": "Zen Master",
      "Indie": "Taste Maker",
    };
    return personalities[topGenre] || "Music Explorer";
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My Year in Music",
        text: `I listened to ${totalHours} hours of music this year! My top genre was ${topGenre}. #YearInMusic`,
        url: window.location.origin,
      });
    } catch {
      navigator.clipboard.writeText(
        `I listened to ${totalHours} hours of music this year! My top genre was ${topGenre}. Check your stats at ${window.location.origin}`
      );
      toast.success("Copied to clipboard!");
    }
  };

  const slides = [
    // Slide 1: Total Listening Time
    {
      bg: "from-primary/30 to-primary/5",
      content: (
        <div className="text-center">
          <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">This year you listened to</p>
          <h2 className="text-5xl font-bold text-primary mb-2">{stats?.totalMinutes?.toLocaleString()}</h2>
          <p className="text-xl">minutes of music</p>
          <p className="text-sm text-muted-foreground mt-4">That's {totalHours} hours of pure vibes!</p>
        </div>
      ),
    },
    // Slide 2: Total Songs
    {
      bg: "from-blue-500/30 to-blue-500/5",
      content: (
        <div className="text-center">
          <Music className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">You played</p>
          <h2 className="text-5xl font-bold text-blue-400 mb-2">{stats?.totalSongs?.toLocaleString()}</h2>
          <p className="text-xl">songs</p>
          <p className="text-sm text-muted-foreground mt-4">
            From {uniqueArtists} different artists
          </p>
        </div>
      ),
    },
    // Slide 3: Top Artists
    {
      bg: "from-purple-500/30 to-purple-500/5",
      content: (
        <div className="text-center">
          <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Your Top Artists</p>
          <div className="space-y-3">
            {stats?.topArtists?.slice(0, 5).map((artist, i) => (
              <div
                key={artist.artist}
                className="flex items-center gap-3 bg-background/30 rounded-lg p-3"
              >
                <span className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-background">
                  {i + 1}
                </span>
                <span className="flex-1 text-left font-medium truncate">{artist.artist}</span>
                <span className="text-sm text-muted-foreground">{artist.count} plays</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 4: Top Songs
    {
      bg: "from-green-500/30 to-green-500/5",
      content: (
        <div className="text-center">
          <Heart className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Your Top Songs</p>
          <div className="space-y-2">
            {topTracks?.slice(0, 5).map((track: any, i: number) => (
              <div
                key={track.id}
                className="flex items-center gap-3 bg-background/30 rounded-lg p-2"
              >
                <span className="w-5 h-5 bg-green-400 rounded flex items-center justify-center text-xs font-bold text-background">
                  {i + 1}
                </span>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium truncate text-sm">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground">{track.playCount}x</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 5: Genre Distribution
    {
      bg: "from-orange-500/30 to-orange-500/5",
      content: (
        <div className="text-center">
          <Disc className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Genre Distribution</p>
          <div className="space-y-3">
            {genrePercentages.slice(0, 5).map((genre) => (
              <div key={genre.genre}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{genre.genre}</span>
                  <span className="text-muted-foreground">{genre.percentage}%</span>
                </div>
                <Progress value={genre.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 6: Listening Streak & Personality
    {
      bg: "from-pink-500/30 to-pink-500/5",
      content: (
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Your listening streak</p>
          <h2 className="text-4xl font-bold text-pink-400 mb-4">{streak} days</h2>
          
          <div className="mt-6 p-4 bg-background/30 rounded-xl">
            <p className="text-xs text-muted-foreground mb-2">Your Listening Personality</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {getPersonality()}
            </h3>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
          Your Year in Music
        </h1>
        <p className="text-muted-foreground">
          {new Date().getFullYear()} Listening Recap
        </p>
      </div>

      {/* Slides Carousel */}
      <div className="relative mb-8">
        <div
          className={`bg-gradient-to-br ${slides[currentSlide].bg} rounded-2xl p-8 min-h-[400px] flex items-center justify-center border border-border transition-all duration-500`}
        >
          {slides[currentSlide].content}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto opacity-50 hover:opacity-100"
            onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto opacity-50 hover:opacity-100"
            onClick={() => setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalHours}</p>
            <p className="text-xs text-muted-foreground">Hours Listened</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Music className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalSongs || 0}</p>
            <p className="text-xs text-muted-foreground">Songs Played</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{uniqueArtists}</p>
            <p className="text-xs text-muted-foreground">Artists</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Button */}
      <Button
        variant="glow"
        className="w-full gap-2"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4" />
        Share Your Recap
      </Button>
    </div>
  );
};

export default YearlyRecap;
