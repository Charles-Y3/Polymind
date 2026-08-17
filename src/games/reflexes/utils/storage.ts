import { LeaderboardEntry, PlayerStats } from '../types';

const STORAGE_KEYS = {
  STATS: 'tilt_balance_stats_v1',
  LEADERBOARD: 'tilt_balance_leaderboard_v1',
};

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  totalTimeSurvived: 0,
  highestScore: 0,
  totalObstaclesDodged: 0,
  totalPowerUpsCollected: 0,
  starsEarned: { 1: 0 },
  unlockedSkins: ['chrome', 'neon'],
  currentSkinId: 'chrome',
  playerName: 'Balancer',
  soundEnabled: true,
  hapticsEnabled: true,
  sensitivity: 1.0,
  invertX: false,
  invertY: false,
  controlMode: 'hybrid',
  hasCalibrated: false,
  selectedStarterPowerUp: 'none',
  language: 'en',
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    playerName: 'ZenMaster',
    score: 12500,
    mode: 'endless',
    timeSurvived: 185,
    date: '2026-08-01',
    skinId: 'rainbow',
  },
  {
    id: 'lb_2',
    playerName: 'GyroKing',
    score: 9800,
    mode: 'endless',
    timeSurvived: 142,
    date: '2026-08-03',
    skinId: 'fire',
  },
  {
    id: 'lb_3',
    playerName: 'TiltPro',
    score: 8200,
    mode: 'endless',
    timeSurvived: 120,
    date: '2026-08-05',
    skinId: 'neon',
  },
  {
    id: 'lb_4',
    playerName: 'Baller99',
    score: 6400,
    mode: 'endless',
    timeSurvived: 95,
    date: '2026-08-06',
    skinId: 'chrome',
  },
  {
    id: 'lb_5',
    playerName: 'OrbitRider',
    score: 4900,
    mode: 'endless',
    timeSurvived: 72,
    date: '2026-08-07',
    skinId: 'dark_matter',
  },
];

export function getPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // Fallback if storage blocked
  }
}

export function deduplicateEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();

  for (const entry of entries) {
    const key = entry.playerName ? entry.playerName.trim().toLowerCase() : '';
    if (!key) continue;
    const existing = map.get(key);
    if (!existing || entry.score > existing.score) {
      map.set(key, entry);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
      return deduplicateEntries(INITIAL_LEADERBOARD);
    }
    const parsed: LeaderboardEntry[] = JSON.parse(raw);
    return deduplicateEntries(parsed);
  } catch {
    return deduplicateEntries(INITIAL_LEADERBOARD);
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): { updated: LeaderboardEntry[]; rank: number } {
  const current = getLeaderboard();
  const normalized = entry.playerName ? entry.playerName.trim().toLowerCase() : '';

  const existingIndex = current.findIndex(
    (e) => e.playerName.trim().toLowerCase() === normalized && e.mode === entry.mode
  );
  let updatedList: LeaderboardEntry[];
  let entryId = `lb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  if (existingIndex !== -1) {
    const existing = current[existingIndex];
    if (entry.score > existing.score) {
      const updatedEntry: LeaderboardEntry = {
        ...entry,
        id: existing.id,
        date: new Date().toISOString().split('T')[0],
      };
      updatedList = [...current];
      updatedList[existingIndex] = updatedEntry;
      entryId = existing.id;
    } else {
      updatedList = [...current];
      entryId = existing.id;
    }
  } else {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: entryId,
      date: new Date().toISOString().split('T')[0],
    };
    updatedList = [...current, newEntry];
  }

  const deduplicated = deduplicateEntries(updatedList).slice(0, 50);
  const rankIndex = deduplicated.findIndex((e) => e.playerName.trim().toLowerCase() === normalized);
  const rank = rankIndex !== -1 ? rankIndex + 1 : deduplicated.length;

  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(deduplicated));
  } catch {
    // Ignore error
  }
  return { updated: deduplicated, rank };
}

export function clearLeaderboard(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
  } catch {
    // Ignore
  }
}
