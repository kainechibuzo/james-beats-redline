import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Headphones, Radio, Sparkles, Download, Upload, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import welcomeHero from "@/assets/welcome-hero.jpg";
import heroMusic from "@/assets/hero-music.jpg";
import heroMusic2 from "@/assets/hero-music-2.jpg";
import heroMusic3 from "@/assets/hero-music-3.jpg";
import heroMusic4 from "@/assets/hero-music-4.jpg";

const heroImages = [welcomeHero, heroMusic, heroMusic2, heroMusic3, heroMusic4];

const otherProducts = [
  { name: "Air AI Monitor", description: "Smart air quality tracking" },
  { name: "DigiMarket", description: "Digital marketplace platform" },
  { name: "Aero Engine Maker", description: "Aviation engineering tools" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      navigate("/home", { replace: true });
    } else {
      setIsVisible(true);
    }
  }, [navigate]);

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check if PWA is installable
  useEffect(() => {
    const checkPwa = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setShowPwaPrompt(true);
      }
    };
    checkPwa();
  }, []);

  const handleEnter = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    navigate("/home");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background overflow-y-auto"
      >
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex]}
              alt="Happy people enjoying music"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-8 px-6 text-center">
          {/* Floating Music Notes Animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              >
                <Headphones className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              >
                <Music className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
              >
                <Radio className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Logo and Title */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-4"
          >
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-2">
              James <span className="text-primary">Beats</span>
            </h1>
            <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Where Music Lives
              <Sparkles className="w-4 h-4" />
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted-foreground max-w-md mb-6"
          >
            Stream millions of songs, connect with artists, and let our AI DJ create the perfect mix for every moment.
          </motion.p>

          {/* Free Upload Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4, type: "spring" }}
            className="mb-6"
          >
            <div className="bg-primary/20 border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">100% FREE to Upload Your Music!</span>
            </div>
          </motion.div>

          {/* PWA Download Prompt */}
          {showPwaPrompt && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-6 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 max-w-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Install James Beats</p>
                  <p className="text-xs text-muted-foreground">
                    Add to home screen for the best experience!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enter Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="w-full max-w-sm mb-6"
          >
            <Button
              variant="glow"
              size="lg"
              onClick={handleEnter}
              className="w-full text-lg py-6 gap-2"
            >
              <Music className="w-5 h-5" />
              Enter James Beats
            </Button>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-6 mb-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <Music className="w-4 h-4" />
              Free Upload
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-4 h-4" />
              AI DJ
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="w-4 h-4" />
              Playlists
            </span>
          </motion.div>

          {/* Other Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="w-full max-w-md mb-6"
          >
            <p className="text-xs text-muted-foreground mb-3">Try our other products</p>
            <div className="flex flex-wrap justify-center gap-2">
              {otherProducts.map((product) => (
                <motion.div
                  key={product.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <div className="text-left">
                      <p className="text-xs font-medium">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-xs text-muted-foreground"
          >
            © 2024 James Beats. All rights reserved.
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Welcome;
