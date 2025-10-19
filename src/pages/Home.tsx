import HeroSection from "@/components/home/HeroSection";
import PlaylistCard from "@/components/home/PlaylistCard";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";

const Home = () => {
  const playlists = [
    {
      title: "Today's Top Hits",
      description: "The hottest tracks right now",
      image: album1,
    },
    {
      title: "Urban Vibes",
      description: "Feel the rhythm of the city",
      image: album2,
    },
    {
      title: "Electronic Dreams",
      description: "Dive into electronic beats",
      image: album3,
    },
    {
      title: "Chill Lounge",
      description: "Relax and unwind",
      image: album1,
    },
    {
      title: "Workout Energy",
      description: "Get pumped with high-energy tracks",
      image: album2,
    },
    {
      title: "Midnight Sessions",
      description: "Perfect for late night vibes",
      image: album3,
    },
  ];

  return (
    <div className="pb-32 animate-fade-in">
      <HeroSection />

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.map((playlist, index) => (
            <PlaylistCard key={index} {...playlist} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.slice(0, 4).map((playlist, index) => (
            <PlaylistCard key={index} {...playlist} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.slice(2).map((playlist, index) => (
            <PlaylistCard key={index} {...playlist} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
