import { useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Music, Users, Clock, X, Disc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSongs } from "@/hooks/useSongs";
import { useAlbums } from "@/hooks/useAlbums";
import SongCard from "@/components/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import YouTubeSearch from "@/components/search/YouTubeSearch";
import {
  useSearchHistory,
  useAddSearchHistory,
  useRemoveSearchHistory,
  useClearSearchHistory,
} from "@/hooks/useSearchHistory";

const GENRES = [
  { title: "Pop", color: "bg-pink-500" },
  { title: "Hip-Hop", color: "bg-orange-500" },
  { title: "Electronic", color: "bg-purple-500" },
  { title: "Rock", color: "bg-red-500" },
  { title: "R&B", color: "bg-amber-500" },
  { title: "Jazz", color: "bg-blue-500" },
  { title: "Classical", color: "bg-indigo-500" },
  { title: "Country", color: "bg-green-500" },
];

const Search = () => {
  const [query, setQuery] = useState("");
  const { data: songs, isLoading } = useSongs();
  const { data: albums } = useAlbums();
  const { data: searchHistory = [] } = useSearchHistory();
  const addHistory = useAddSearchHistory();
  const removeHistory = useRemoveSearchHistory();
  const clearHistoryMut = useClearSearchHistory();

  // Filter songs
  const filteredSongs = songs?.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.album?.toLowerCase().includes(query.toLowerCase()) ||
      song.genre?.toLowerCase().includes(query.toLowerCase())
  );

  // Get unique artists from songs
  const artists = songs
    ? Array.from(new Set(songs.map(s => s.artist)))
        .filter(artist => artist.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
    : [];

  // Filter albums
  const filteredAlbums = albums?.filter(
    (album) =>
      album.title.toLowerCase().includes(query.toLowerCase()) ||
      album.artist.toLowerCase().includes(query.toLowerCase())
  );

  const searchResults = query.length > 0 ? filteredSongs : [];

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim()) {
      addHistory.mutate(term.trim());
    }
  };

  return (
    <div className="pb-32 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search songs, artists, albums..."
          className="pl-12 h-12 text-base bg-card border-border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {query.length > 0 ? (
        <div className="space-y-8">
          {/* Artists Section */}
          {artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Artists
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {artists.map((artist) => (
                  <Link
                    key={artist}
                    to={`/artist/${encodeURIComponent(artist)}`}
                    className="flex flex-col items-center gap-2 min-w-[100px]"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-center truncate max-w-[100px]">
                      {artist}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {filteredAlbums && filteredAlbums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Disc className="w-5 h-5" />
                Albums
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filteredAlbums.slice(0, 12).map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="min-w-[140px] hover:opacity-80 transition-opacity"
                  >
                    <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-2">
                      {album.cover_url ? (
                        <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Disc className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{album.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Songs Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Songs
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {searchResults.map((song) => (
                  <SongCard key={song.id} song={song} showAlbum compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No songs found for "{query}"</p>
              </div>
            )}
          </section>

          {/* YouTube direct search */}
          <YouTubeSearch query={query} />
        </div>

      ) : (
        <>
          {/* Search History */}
          {searchHistory.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h2>
                <Button variant="ghost" size="sm" onClick={() => clearHistoryMut.mutate()}>
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((entry) => (
                  <div key={entry.id}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20 gap-1 pr-1"
                    >
                      <span onClick={() => handleSearch(entry.query)}>{entry.query}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistory.mutate(entry.id);
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Browse by Genre */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Browse by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {GENRES.map((genre) => (
                <button
                  key={genre.title}
                  onClick={() => handleSearch(genre.title.toLowerCase())}
                  className={`${genre.color} rounded-lg p-6 h-32 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 text-left`}
                >
                  <h3 className="text-2xl font-bold text-white">{genre.title}</h3>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Search;