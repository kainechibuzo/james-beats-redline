// Audio utility functions

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatPlayCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const calculateProgress = (current: number, total: number): number => {
  if (!total || total === 0) return 0;
  return (current / total) * 100;
};

export const generateWaveform = (length: number = 50): number[] => {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
};

export const normalizeVolume = (volume: number): number => {
  return Math.max(0, Math.min(1, volume));
};

// Calculate beats per minute estimation from duration
export const estimateBPM = (duration: number): number => {
  // Simple estimation - longer songs tend to be slower
  if (duration < 180) return Math.floor(Math.random() * 30) + 120; // 120-150 BPM
  if (duration < 300) return Math.floor(Math.random() * 40) + 90; // 90-130 BPM
  return Math.floor(Math.random() * 30) + 70; // 70-100 BPM
};

// Parse genre from song metadata or infer from title
export const inferGenre = (title: string, existingGenre?: string): string => {
  if (existingGenre) return existingGenre;
  
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("remix") || lowerTitle.includes("edit")) return "Electronic";
  if (lowerTitle.includes("acoustic")) return "Acoustic";
  if (lowerTitle.includes("live")) return "Live";
  if (lowerTitle.includes("instrumental")) return "Instrumental";
  return "Unknown";
};

// Create a color based on string (for consistent avatar colors)
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
