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
  if (duration < 180) return Math.floor(Math.random() * 30) + 120;
  if (duration < 300) return Math.floor(Math.random() * 40) + 90;
  return Math.floor(Math.random() * 30) + 70;
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

// 1. Normalize audio data levels
export function normalizeAudioData(audioData: Float32Array): Float32Array {
  const max = Math.max(...Array.from(audioData).map(Math.abs));
  if (max === 0) return audioData;
  return audioData.map(sample => sample / max);
}

// 2. Calculate audio peak level
export function calculatePeakLevel(audioData: Float32Array): number {
  return Math.max(...Array.from(audioData).map(Math.abs));
}

// 3. Calculate RMS (Root Mean Square) for loudness
export function calculateRMS(audioData: Float32Array): number {
  const sum = audioData.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sum / audioData.length);
}

// 4. Detect silence in audio
export function detectSilence(audioData: Float32Array, threshold = 0.01): boolean {
  return calculateRMS(audioData) < threshold;
}

// 5. Calculate tempo estimation from beat intervals
export function estimateTempo(beatIntervals: number[]): number {
  if (beatIntervals.length < 2) return 120;
  const avgInterval = beatIntervals.reduce((a, b) => a + b, 0) / beatIntervals.length;
  return Math.round(60000 / avgInterval);
}

// 6. Generate waveform data for visualization
export function generateWaveformData(audioBuffer: AudioBuffer, samples = 100): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j] || 0);
    }
    waveform.push(sum / blockSize);
  }
  
  return waveform;
}

// 7. Apply fade in effect
export function applyFadeIn(audioData: Float32Array, fadeSamples: number): Float32Array {
  const result = new Float32Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    const multiplier = i < fadeSamples ? i / fadeSamples : 1;
    result[i] = audioData[i] * multiplier;
  }
  return result;
}

// 8. Apply fade out effect
export function applyFadeOut(audioData: Float32Array, fadeSamples: number): Float32Array {
  const result = new Float32Array(audioData.length);
  const startFade = audioData.length - fadeSamples;
  for (let i = 0; i < audioData.length; i++) {
    const multiplier = i >= startFade ? (audioData.length - i) / fadeSamples : 1;
    result[i] = audioData[i] * multiplier;
  }
  return result;
}

// 9. Calculate crossfade duration based on tempo
export function calculateCrossfadeDuration(tempo: number): number {
  const beatsPerSecond = tempo / 60;
  return Math.max(2, Math.min(8, 4 / beatsPerSecond));
}

// 10. Detect audio format from file header
export function detectAudioFormat(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  
  if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) return 'mp3';
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'mp3';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'wav';
  if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return 'flac';
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'm4a';
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'ogg';
  
  return null;
}
