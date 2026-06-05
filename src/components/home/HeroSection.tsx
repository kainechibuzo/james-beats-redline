import abstractMusicHero from "@/assets/abstract-music-3.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8"
      style={{
        backgroundImage: `url(${abstractMusicHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <h2 className="text-3xl md:text-5xl font-bold mb-2 animate-fade-in">
          Feel the Beat
        </h2>
        <p className="text-base md:text-xl text-muted-foreground animate-fade-in">
          Discover millions of songs from artists around the world
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
