import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import abstractMusicHero from "@/assets/abstract-music-3.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative h-96 rounded-lg overflow-hidden mb-8"
      style={{
        backgroundImage: `url(${abstractMusicHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-8">
        <h2 className="text-5xl font-bold mb-2 animate-fade-in">
          Feel the Beat
        </h2>
        <p className="text-xl text-muted-foreground mb-6 animate-fade-in">
          Discover millions of songs from artists around the world
        </p>
        <div className="flex gap-4 animate-fade-in">
          <Button variant="glow" size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            Play Now
          </Button>
          <Button variant="outline" size="lg">
            Browse Playlists
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
