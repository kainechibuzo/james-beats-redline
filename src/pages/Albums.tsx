import { Link } from "react-router-dom";
import { useAlbums, useFeaturedAlbums } from "@/hooks/useAlbums";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Disc, Star, Music } from "lucide-react";

const Albums = () => {
  const { data: albums, isLoading } = useAlbums();
  const { data: featuredAlbums } = useFeaturedAlbums();

  return (
    <div className="pb-32 animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">Albums</h1>
      <p className="text-muted-foreground mb-8">Browse all public albums</p>

      {/* Featured Albums Section */}
      {featuredAlbums && featuredAlbums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Albums
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredAlbums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3 relative">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Disc className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {album.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                {album.genre && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {album.genre}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Albums Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">All Albums</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                  {album.cover_url ? (
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Disc className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {album.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                {album.release_year && (
                  <p className="text-xs text-muted-foreground">{album.release_year}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No albums yet</h3>
            <p className="text-sm">Be the first to create an album!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Albums;
