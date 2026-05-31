import { useMemo } from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import SongCard from "@/components/home/SongCard";
import { useSongs, useRecentlyPlayed } from "@/hooks/useSongs";
import { useAlbums, useFeaturedAlbums } from "@/hooks/useAlbums";
import { useTrendingSongs, useFeaturedSongs, useFeaturedArtistsFromPlays } from "@/hooks/useTrendingSongs";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Disc, Users, ChevronRight, Play, FolderOpen, Shuffle, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { user } = useAuth();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: recentlyPlayed, isLoading: recentLoading } = useRecentlyPlayed();
  const { data: featuredAlbums, isLoading: albumsLoading } = useFeaturedAlbums();
  const { data: allAlbums } = useAlbums();
  const { data: trendingSongs, isLoading: trendingLoading } = useTrendingSongs(6);
  const { data: featuredSongs, isLoading: featuredLoading } = useFeaturedSongs(6);
  const { data: featuredArtists, isLoading: artistsLoading } = useFeaturedArtistsFromPlays(8);
  const { playSong } = usePlayer();
  const isMobile = useIsMobile();

  const recentAlbums = allAlbums?.slice(0, 6) || [];

  // Your Recent Mix - shuffle recently played songs into a "mix"
  const recentMix = recentlyPlayed && recentlyPlayed.length > 2
    ? [...recentlyPlayed].sort(() => Math.random() - 0.5).slice(0, 6)
    : null;

  // Your Throwbacks - songs older than 60 days from recently played or oldest songs
  const throwbacks = (() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    if (songs && songs.length > 0) {
      const oldSongs = songs
        .filter(s => new Date(s.created_at) < sixtyDaysAgo)
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      return oldSongs.length > 0 ? oldSongs : songs.slice(-6).reverse();
    }
    return null;
  })();

  const handlePlayAlbum = (albumTitle: string, artistName: string) => {
    const albumSongs = songs?.filter(
      song => song.album === albumTitle && song.artist === artistName
    ) || [];
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  };

  return (
    <div className="pb-32 animate-fade-in">
      <HeroSection />

      {/* Featured Artists - based on play counts */}
      {featuredArtists && featuredArtists.length > 0 && (
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Featured Artists</h2>
            <Link to="/search">
              <Button variant="ghost" size="sm" className={isMobile ? 'text-xs px-2' : ''}>
                See all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {featuredArtists.map((artist) => (
              <Link
                key={artist.name}
                to={`/artist/${encodeURIComponent(artist.name)}`}
                className="flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px] hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-muted to-card overflow-hidden flex items-center justify-center border border-border">
                  {artist.cover ? (
                    <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-center truncate max-w-[80px] md:max-w-[100px]">
                  {artist.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums Section */}
      {(featuredAlbums?.length || recentAlbums?.length) ? (
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className={`font-bold flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              <FolderOpen className="w-5 h-5 text-primary" />
              Albums
            </h2>
            <Link to="/albums">
              <Button variant="ghost" size="sm" className={isMobile ? 'text-xs px-2' : ''}>
                Browse all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {(featuredAlbums?.length ? featuredAlbums : recentAlbums).slice(0, 6).map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer"
                onClick={() => handlePlayAlbum(album.title, album.artist)}
              >
                <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-2 relative">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Disc className="w-10 h-10 md:w-12 md:h-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="font-medium text-sm truncate">{album.title}</p>
                <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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

      {/* Your Recent Mix */}
      {user && recentMix && recentMix.length > 0 && (
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className={`font-bold flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              <Shuffle className="w-5 h-5 text-primary" />
              Your Recent Mix
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className={isMobile ? 'text-xs px-2' : ''}
              onClick={() => {
                if (recentMix.length > 0) playSong(recentMix[0], recentMix);
              }}
            >
              Play all
              <Play className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {/* Gradient playlist cover */}
          <button
            onClick={() => { if (recentMix.length > 0) playSong(recentMix[0], recentMix); }}
            className="group w-full rounded-xl overflow-hidden mb-4 relative h-32 md:h-40 hover:scale-[1.01] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-500 to-violet-600" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex items-center justify-between px-5 md:px-8">
              <div className="text-left">
                <p className="text-white/70 text-xs uppercase tracking-wider font-medium">Personalized</p>
                <p className="text-white font-bold text-xl md:text-2xl mt-1 drop-shadow-md">Your Recent Mix</p>
                <p className="text-white/60 text-xs md:text-sm mt-1">{recentMix.length} tracks • Based on your listening</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 md:w-7 md:h-7 text-white ml-0.5" />
              </div>
            </div>
          </button>
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {recentMix.map((song) => (
              <SongCard key={`mix-${song.id}`} song={song} showAlbum compact />
            ))}
          </div>
        </section>
      )}

      {/* Your Throwbacks */}
      {throwbacks && throwbacks.length > 0 && (
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className={`font-bold flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              <Rewind className="w-5 h-5 text-primary" />
              Your Throwbacks
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className={isMobile ? 'text-xs px-2' : ''}
              onClick={() => {
                if (throwbacks.length > 0) playSong(throwbacks[0], throwbacks);
              }}
            >
              Play all
              <Play className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {/* Gradient playlist cover */}
          <button
            onClick={() => { if (throwbacks.length > 0) playSong(throwbacks[0], throwbacks); }}
            className="group w-full rounded-xl overflow-hidden mb-4 relative h-32 md:h-40 hover:scale-[1.01] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="relative h-full flex items-center justify-between px-5 md:px-8">
              <div className="text-left">
                <p className="text-white/70 text-xs uppercase tracking-wider font-medium">Nostalgia</p>
                <p className="text-white font-bold text-xl md:text-2xl mt-1 drop-shadow-md">Your Throwbacks</p>
                <p className="text-white/60 text-xs md:text-sm mt-1">{throwbacks.length} tracks • Rediscover old favorites</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 md:w-7 md:h-7 text-white ml-0.5" />
              </div>
            </div>
          </button>
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {throwbacks.map((song) => (
              <SongCard key={`throwback-${song.id}`} song={song} showAlbum compact />
            ))}
          </div>
        </section>
      )}

      {/* Featured Songs - based on play counts */}
      <section className="mb-6 md:mb-8">
        <h2 className={`font-bold mb-3 md:mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Featured Tracks</h2>
        {featuredLoading ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {Array.from({ length: isMobile ? 6 : 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="aspect-square rounded-md max-w-[120px] md:max-w-[180px]" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredSongs && featuredSongs.length > 0 ? (
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} showAlbum compact showPlayCount />
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

      {/* Trending Now - based on play counts */}
      {trendingSongs && trendingSongs.length > 0 && (
        <section>
          <h2 className={`font-bold mb-3 md:mb-4 ${isMobile ? 'text-lg' : 'text-2xl'}`}>Trending Now</h2>
          <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} showAlbum compact showPlayCount />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;