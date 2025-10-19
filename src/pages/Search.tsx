import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import PlaylistCard from "@/components/home/PlaylistCard";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const Search = () => {
  const categories = [
    { title: "Pop", color: "bg-pink-500", image: album1 },
    { title: "Hip-Hop", color: "bg-orange-500", image: album2 },
    { title: "Electronic", color: "bg-purple-500", image: album3 },
    { title: "Rock", color: "bg-red-500", image: album1 },
    { title: "Jazz", color: "bg-blue-500", image: album2 },
    { title: "Classical", color: "bg-indigo-500", image: album3 },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="What do you want to listen to?"
          className="pl-12 h-12 text-base bg-card border-border"
        />
      </div>

      <h2 className="text-2xl font-bold mb-4">Browse All</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`${category.color} rounded-lg p-6 h-40 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200`}
          >
            <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
            <img
              src={category.image}
              alt={category.title}
              className="absolute bottom-0 right-0 w-24 h-24 object-cover transform rotate-12 translate-x-2 translate-y-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
