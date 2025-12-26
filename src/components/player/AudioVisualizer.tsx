import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  frequencyData: Uint8Array;
  variant?: "bars" | "wave" | "circle";
  className?: string;
}

const AudioVisualizer = ({ frequencyData, variant = "bars", className }: AudioVisualizerProps) => {
  const bars = Array.from(frequencyData).slice(0, 32);
  
  if (variant === "bars") {
    return (
      <div className={cn("flex items-end justify-center gap-[2px] h-16", className)}>
        {bars.map((value, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-primary to-primary/50 rounded-full"
            style={{ height: `${Math.max(4, (value / 255) * 100)}%` }}
            animate={{ height: `${Math.max(4, (value / 255) * 100)}%` }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
    );
  }

  if (variant === "wave") {
    const points = bars.map((value, i) => {
      const x = (i / (bars.length - 1)) * 100;
      const y = 50 - (value / 255) * 40;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className={cn("w-full h-16", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (variant === "circle") {
    return (
      <div className={cn("relative w-32 h-32", className)}>
        {bars.slice(0, 16).map((value, i) => {
          const angle = (i / 16) * 360;
          const height = 10 + (value / 255) * 30;
          
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 bottom-1/2 origin-bottom bg-primary rounded-full w-1"
              style={{
                height,
                transform: `translateX(-50%) rotate(${angle}deg)`,
              }}
              animate={{ height }}
              transition={{ duration: 0.05 }}
            />
          );
        })}
      </div>
    );
  }

  return null;
};

export default AudioVisualizer;
