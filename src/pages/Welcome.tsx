import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Headphones, Radio, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import welcomeHero from "@/assets/welcome-hero.jpg";

const Welcome = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      navigate("/home", { replace: true });
    } else {
      setIsVisible(true);
    }
  }, [navigate]);

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
        className="fixed inset-0 z-50 bg-background overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={welcomeHero}
            alt="Happy people enjoying music"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-6 text-center">
          {/* Floating Music Notes Animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
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
            className="mb-6"
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
            className="text-muted-foreground max-w-md mb-10"
          >
            Stream millions of songs, connect with artists, and let our AI DJ create the perfect mix for every moment.
          </motion.p>

          {/* Enter Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-sm"
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
            className="flex items-center gap-6 mt-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <Music className="w-4 h-4" />
              Upload
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Welcome;
