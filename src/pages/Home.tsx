import HeroSection from "@/components/home/HeroSection";
import DJSection from "@/components/home/DJSection";
import SongCard from "@/components/home/SongCard";
import { useSongs, useRecentlyPlayed } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { user } = useAuth();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: recentlyPlayed, isLoading: recentLoading } = useRecentlyPlayed();

  const featuredSongs = songs?.slice(0, 6) || [];
  const trendingSongs = songs?.slice(0, 4) || [];

  return (
    <div className="pb-32 animate-fade-in">
      <HeroSection />
      
      <DJSection />

      {/* Recently Played - only for logged in users */}
      {user && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recently Played</h2>
            <Link to="/recent">
              <Button variant="ghost" size="sm">See all</Button>
            </Link>
          </div>
          {recentLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : recentlyPlayed && recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentlyPlayed.slice(0, 6).map((song) => (
                <SongCard key={`${song.id}-${song.played_at}`} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recently played songs yet</p>
              <p className="text-sm">Start listening to build your history!</p>
            </div>
          )}
        </section>
      )}

      {/* Featured Songs */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Featured Tracks</h2>
        {songsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No songs yet</h3>
            <p className="text-sm mb-4">Be the first to upload a track!</p>
            {user && (
              <Link to="/upload">
                <Button variant="glow">Upload Song</Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Trending Now */}
      {trendingSongs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
