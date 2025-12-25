import { useState } from "react";
import { Search as SearchIcon, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSongs } from "@/hooks/useSongs";
import SongCard from "@/components/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";

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

  const filteredSongs = songs?.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.album?.toLowerCase().includes(query.toLowerCase()) ||
      song.genre?.toLowerCase().includes(query.toLowerCase())
  );

  const searchResults = query.length > 0 ? filteredSongs : [];

  return (
    <div className="pb-32 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="What do you want to listen to?"
          className="pl-12 h-12 text-base bg-card border-border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Results for "{query}"
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
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </section>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map((genre) => (
              <button
                key={genre.title}
                onClick={() => setQuery(genre.title.toLowerCase())}
                className={`${genre.color} rounded-lg p-6 h-32 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 text-left`}
              >
                <h3 className="text-2xl font-bold text-white">{genre.title}</h3>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
