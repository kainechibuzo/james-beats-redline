import HeroSection from "@/components/home/HeroSection";
import SongCard from "@/components/home/SongCard";
import { useSongs, useRecentlyPlayed } from "@/hooks/useSongs";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { user } = useAuth();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: recentlyPlayed, isLoading: recentLoading } = useRecentlyPlayed();
  const isMobile = useIsMobile();

  const featuredSongs = songs?.slice(0, 6) || [];
  const trendingSongs = songs?.slice(0, 4) || [];

  return (
    <div className="pb-32 animate-fade-in">
      <HeroSection />

      {/* Recently Played - only for logged in users */}
      {user && (
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Recently Played</h2>
            <Link to="/recent">
              <Button variant="ghost" size="sm" className={isMobile ? 'text-xs px-2' : ''}>See all</Button>
            </Link>
          </div>
          {recentLoading ? (
            <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
              {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="aspect-square rounded-md max-w-[120px] md:max-w-[180px]" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              ))}
            </div>
          ) : recentlyPlayed && recentlyPlayed.length > 0 ? (
            <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
              {recentlyPlayed.slice(0, isMobile ? 6 : 6).map((song) => (
                <SongCard key={`${song.id}-${song.played_at}`} song={song} showAlbum compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8 text-muted-foreground">
              <Music className={`mx-auto mb-2 opacity-50 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
              <p className={isMobile ? 'text-sm' : ''}>No recently played songs yet</p>
              <p className="text-xs md:text-sm">Start listening to build your history!</p>
            </div>
          )}
        </section>
      )}

      {/* Featured Songs */}
      <section className="mb-6 md:mb-8">
        <h2 className={`font-bold mb-3 md:mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Featured Tracks</h2>
        {songsLoading ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {Array.from({ length: isMobile ? 6 : 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="aspect-square rounded-md max-w-[120px] md:max-w-[180px]" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredSongs.length > 0 ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} showAlbum compact />
            ))}
          </div>
        ) : (
          <div className={`text-center text-muted-foreground bg-card rounded-lg border border-border ${isMobile ? 'py-8' : 'py-12'}`}>
            <Music className={`mx-auto mb-3 md:mb-4 opacity-50 ${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`} />
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No songs yet</h3>
            <p className="text-xs md:text-sm mb-3 md:mb-4">Be the first to upload a track!</p>
            {user && (
              <Link to="/upload">
                <Button variant="glow" size={isMobile ? "sm" : "default"}>Upload Song</Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Trending Now */}
      {trendingSongs.length > 0 && (
        <section>
          <h2 className={`font-bold mb-3 md:mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Trending Now</h2>
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} showAlbum compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
