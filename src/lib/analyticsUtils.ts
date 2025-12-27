// Analytics utility functions for tracking and insights

// 21. Track event with debouncing
const eventQueue: { event: string; data: any; timestamp: number }[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

export function trackEvent(event: string, data?: any): void {
  eventQueue.push({ event, data, timestamp: Date.now() });
  
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushEvents, 5000);
}

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  // Store locally for now, can be sent to analytics service
  const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  stored.push(...events);
  localStorage.setItem('analytics_events', JSON.stringify(stored.slice(-1000)));
}

// 22. Calculate engagement score
export function calculateEngagementScore(metrics: {
  playCount: number;
  likeCount: number;
  shareCount: number;
  playlistAdds: number;
  avgListenDuration: number;
  totalDuration: number;
}): number {
  const listenRatio = metrics.avgListenDuration / Math.max(metrics.totalDuration, 1);
  const interactionScore = metrics.likeCount * 2 + metrics.shareCount * 3 + metrics.playlistAdds * 2;
  const playScore = Math.log10(metrics.playCount + 1) * 10;
  
  return Math.round(listenRatio * 40 + interactionScore + playScore);
}

// 23. Generate listening insights
export function generateListeningInsights(playHistory: { genre: string; artist: string; duration: number; timestamp: number }[]): {
  topGenres: string[];
  topArtists: string[];
  peakHours: number[];
  avgSessionDuration: number;
} {
  const genreCounts = new Map<string, number>();
  const artistCounts = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);
  let totalDuration = 0;
  
  for (const play of playHistory) {
    genreCounts.set(play.genre, (genreCounts.get(play.genre) || 0) + 1);
    artistCounts.set(play.artist, (artistCounts.get(play.artist) || 0) + 1);
    hourCounts[new Date(play.timestamp).getHours()]++;
    totalDuration += play.duration;
  }
  
  const topGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);
  const topArtists = [...artistCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a]) => a);
  const peakHours = hourCounts.map((c, i) => ({ hour: i, count: c })).sort((a, b) => b.count - a.count).slice(0, 3).map(h => h.hour);
  
  return {
    topGenres,
    topArtists,
    peakHours,
    avgSessionDuration: playHistory.length > 0 ? totalDuration / playHistory.length : 0,
  };
}

// 24. Track session duration
let sessionStart: number | null = null;
let lastActivity: number | null = null;

export function startSession(): void {
  sessionStart = Date.now();
  lastActivity = sessionStart;
}

export function recordActivity(): void {
  lastActivity = Date.now();
}

export function getSessionDuration(): number {
  if (!sessionStart) return 0;
  return (lastActivity || Date.now()) - sessionStart;
}

// 25. Calculate retention metrics
export function calculateRetentionMetrics(visits: Date[]): {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  retentionRate: number;
} {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const daily = new Set(visits.filter(v => v >= dayAgo).map(v => v.toDateString())).size;
  const weekly = new Set(visits.filter(v => v >= weekAgo).map(v => v.toDateString())).size;
  const monthly = new Set(visits.filter(v => v >= monthAgo).map(v => v.toDateString())).size;
  
  return {
    dailyActiveUsers: daily,
    weeklyActiveUsers: weekly,
    monthlyActiveUsers: monthly,
    retentionRate: monthly > 0 ? (weekly / monthly) * 100 : 0,
  };
}

// 26. Heatmap data generator for play times
export function generatePlaytimeHeatmap(plays: { timestamp: number }[]): number[][] {
  const heatmap: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
  
  for (const play of plays) {
    const date = new Date(play.timestamp);
    heatmap[date.getDay()][date.getHours()]++;
  }
  
  return heatmap;
}

// 27. Calculate skip rate
export function calculateSkipRate(plays: { completed: boolean }[]): number {
  if (plays.length === 0) return 0;
  const skipped = plays.filter(p => !p.completed).length;
  return (skipped / plays.length) * 100;
}

// 28. Predict user preferences using collaborative filtering (simplified)
export function predictPreferences(
  userPlays: string[],
  allUserPlays: Map<string, string[]>
): string[] {
  const similarUsers: { userId: string; similarity: number }[] = [];
  
  allUserPlays.forEach((plays, userId) => {
    const common = userPlays.filter(p => plays.includes(p)).length;
    const similarity = common / Math.sqrt(userPlays.length * plays.length);
    if (similarity > 0.1) similarUsers.push({ userId, similarity });
  });
  
  similarUsers.sort((a, b) => b.similarity - a.similarity);
  
  const recommendations = new Set<string>();
  for (const { userId } of similarUsers.slice(0, 10)) {
    const theirPlays = allUserPlays.get(userId) || [];
    for (const song of theirPlays) {
      if (!userPlays.includes(song)) recommendations.add(song);
    }
  }
  
  return [...recommendations].slice(0, 20);
}

// 29. Generate trend analysis
export function analyzeTrends(data: { value: number; timestamp: number }[]): {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  average: number;
} {
  if (data.length < 2) return { trend: 'stable', changePercent: 0, average: data[0]?.value || 0 };
  
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;
  const changePercent = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  return {
    trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
    changePercent,
    average: sorted.reduce((a, b) => a + b.value, 0) / sorted.length,
  };
}

// 30. Calculate music taste diversity score
export function calculateDiversityScore(plays: { genre: string; artist: string }[]): number {
  const uniqueGenres = new Set(plays.map(p => p.genre)).size;
  const uniqueArtists = new Set(plays.map(p => p.artist)).size;
  const total = plays.length;
  
  if (total === 0) return 0;
  
  const genreDiversity = Math.min(1, uniqueGenres / 10);
  const artistDiversity = Math.min(1, uniqueArtists / (total * 0.5));
  
  return Math.round((genreDiversity * 50 + artistDiversity * 50));
}
