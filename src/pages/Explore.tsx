import { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, Music, TrendingUp, Radio, Headphones, Zap, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenreExplorer, useNewReleases, useTrendingSongs as useTrending } from "@/hooks/useDiscovery";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import SongCard from "@/components/home/SongCard";
import { MOODS } from "@/hooks/useDiscovery";

const GENRE_COLORS: Record<string, string> = {
  "Pop": "from-pink-600 to-rose-500",
  "Rock": "from-red-700 to-orange-600",
  "Hip-Hop": "from-yellow-600 to-amber-500",
  "R&B": "from-purple-700 to-violet-500",
  "Electronic": "from-cyan-600 to-blue-500",
  "Jazz": "from-amber-700 to-yellow-500",
  "Classical": "from-slate-600 to-gray-500",
  "Country": "from-orange-700 to-amber-600",
  "Reggae": "from-green-700 to-emerald-500",
  "Metal": "from-gray-800 to-gray-600",
  "Indie": "from-teal-600 to-emerald-500",
  "Soul": "from-indigo-700 to-purple-500",
  "Folk": "from-lime-700 to-green-600",
  "Latin": "from-red-600 to-pink-500",
  "Blues": "from-blue-800 to-indigo-600",
};

const getGenreColor = (genre: string) => {
  return GENRE_COLORS[genre] || "from-primary/80 to-primary/40";
};

const Explore = () => {
  const isMobile = useIsMobile();
  const { data: genres, isLoading: genresLoading } = useGenreExplorer();
  const { data: newReleases, isLoading: newReleasesLoading } = useNewReleases(30);
  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { data: allSongs } = useSongs();
  const { playSong } = usePlayer();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
    // Play random songs when mood is selected
    if (allSongs && allSongs.length > 0) {
      const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled.slice(0, 20));
    }
  };

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className={`font-bold flex items-center gap-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          <Compass className="w-7 h-7 text-primary" />
          Explore
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Discover new music, genres, and moods</p>
      </div>

      {/* Mood Selector */}
      <section className="mb-8">
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Sparkles className="w-5 h-5 text-primary" />
          Play by Mood
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                selectedMood === mood.id
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-border bg-card hover:bg-card/80 hover:scale-105"
              }`}
            >
              <span className="text-2xl md:text-3xl">{mood.emoji}</span>
              <span className="text-[10px] md:text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Browse by Genre */}
      <section className="mb-8">
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Globe className="w-5 h-5 text-primary" />
          Browse Genres
        </h2>
        {genresLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : genres && genres.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genres.map(({ genre, count }) => (
              <button
                key={genre}
                onClick={() => {
                  const genreSongs = allSongs?.filter(s => s.genre === genre) || [];
                  if (genreSongs.length > 0) {
                    const shuffled = [...genreSongs].sort(() => Math.random() - 0.5);
                    playSong(shuffled[0], shuffled);
                  }
                }}
                className={`relative overflow-hidden rounded-xl p-4 md:p-5 text-left bg-gradient-to-br ${getGenreColor(genre)} hover:scale-[1.02] transition-transform duration-200`}
              >
                <h3 className="font-bold text-white text-sm md:text-base">{genre}</h3>
                <p className="text-white/70 text-xs mt-1">{count} tracks</p>
                <Music className="absolute bottom-2 right-2 w-8 h-8 text-white/20" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No genres found yet</p>
          </div>
        )}
      </section>

      {/* New Releases */}
      <section className="mb-8">
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Zap className="w-5 h-5 text-primary" />
          New Releases
        </h2>
        {newReleasesLoading ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : newReleases && newReleases.length > 0 ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
            {newReleases.slice(0, 12).map((song) => (
              <SongCard key={song.id} song={song} compact showAlbum />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new releases this month</p>
          </div>
        )}
      </section>

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section className="mb-8">
          <h2 className={`font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </h2>
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
            {trending.slice(0, 12).map((song) => (
              <SongCard key={song.id} song={song} compact showAlbum showPlayCount />
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          <Radio className="w-5 h-5 text-primary" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/dj">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
              <Headphones className="w-6 h-6 text-purple-400" />
              <div>
                <p className="font-medium text-sm">DJ Mode</p>
                <p className="text-xs text-muted-foreground">AI-powered mixes</p>
              </div>
            </div>
          </Link>
          <Link to="/liked">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
              <Heart className="w-6 h-6 text-pink-400" />
              <div>
                <p className="font-medium text-sm">Liked Songs</p>
                <p className="text-xs text-muted-foreground">Your favorites</p>
              </div>
            </div>
          </Link>
          <Link to="/albums">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
              <Music className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="font-medium text-sm">Albums</p>
                <p className="text-xs text-muted-foreground">Full collections</p>
              </div>
            </div>
          </Link>
          <Link to="/recap">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary transition-colors">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <p className="font-medium text-sm">Year in Music</p>
                <p className="text-xs text-muted-foreground">Your recap</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Explore;
