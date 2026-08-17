import { AgeTier, BgmMode, CategoryId, DiscoveryItem, FontSize, GameMode, Language, LeaderboardRecord, PlayerStats } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY_STATS = 'wyc_player_stats_v1';
const STORAGE_KEY_DISCOVERIES = 'wyc_discoveries_v1';
const STORAGE_KEY_SETTINGS = 'wyc_settings_v1';
const STORAGE_KEY_LEADERBOARD = 'wyc_leaderboard_records_v1';

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Curious', titleZhSimp: '好奇新手', titleZhTrad: '好奇新手', emoji: '🌱' },
  { level: 2, xp: 200, title: 'Learner', titleZhSimp: '求知学者', titleZhTrad: '求知學者', emoji: '🌿' },
  { level: 3, xp: 500, title: 'Explorer', titleZhSimp: '知识探索者', titleZhTrad: '知識探索者', emoji: '🌳' },
  { level: 4, xp: 1000, title: 'Discoverer', titleZhSimp: '见闻发现家', titleZhTrad: '見聞發現家', emoji: '🧭' },
  { level: 5, xp: 1800, title: 'Scholar', titleZhSimp: '博学者', titleZhTrad: '博學者', emoji: '📚' },
  { level: 6, xp: 2800, title: 'Thinker', titleZhSimp: '深思哲人', titleZhTrad: '深思哲人', emoji: '🧠' },
  { level: 7, xp: 4000, title: 'Strategist', titleZhSimp: '运筹通才', titleZhTrad: '運籌通才', emoji: '🎯' },
  { level: 8, xp: 5500, title: 'Sage', titleZhSimp: '通识圣者', titleZhTrad: '通識聖者', emoji: '💡' },
  { level: 9, xp: 7500, title: 'Master', titleZhSimp: '明理宗师', titleZhTrad: '明理宗師', emoji: '🔮' },
  { level: 10, xp: 10000, title: 'Grandmaster', titleZhSimp: '百科宗师', titleZhTrad: '百科宗師', emoji: '👑' },
  { level: 11, xp: 13500, title: 'Titan', titleZhSimp: '知识泰坦', titleZhTrad: '知識泰坦', emoji: '⚡' },
  { level: 12, xp: 18000, title: 'Oracle', titleZhSimp: '先知觉者', titleZhTrad: '先知覺者', emoji: '🌌' },
  { level: 13, xp: 24000, title: 'Paragon', titleZhSimp: '万物典范', titleZhTrad: '萬物典範', emoji: '🌟' },
  { level: 14, xp: 31000, title: 'Arch-Scholar', titleZhSimp: '渊博学尊', titleZhTrad: '淵博學尊', emoji: '🏛️' },
  { level: 15, xp: 40000, title: 'Supreme Legend', titleZhSimp: '究极传说', titleZhTrad: '究極傳說', emoji: '🔱' },
  { level: 16, xp: 51000, title: 'Cosmic Intellect', titleZhSimp: '宇宙心智', titleZhTrad: '宇宙心智', emoji: '🔥' },
  { level: 17, xp: 64000, title: 'Galaxy Chronicler', titleZhSimp: '银河编年家', titleZhTrad: '銀河編年家', emoji: '🪐' },
  { level: 18, xp: 79000, title: 'Eternal Polymath', titleZhSimp: '永恒博学家', titleZhTrad: '永恆博學家', emoji: '💠' },
  { level: 19, xp: 96000, title: 'Celestial Luminary', titleZhSimp: '寰宇洞见尊', titleZhTrad: '寰宇洞見尊', emoji: '💫' },
  { level: 20, xp: 115000, title: 'Omniscient Entity', titleZhSimp: '全知全能者', titleZhTrad: '全知全能者', emoji: '🌌' },
];

export function getLevelInfo(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || { ...LEVEL_THRESHOLDS[i], xp: current.xp * 2 };
      break;
    }
  }

  const xpInCurrentLevel = xp - current.xp;
  const xpNeededForNextLevel = next.xp - current.xp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)));

  return {
    level: current.level,
    title: current.title,
    titleZhSimp: current.titleZhSimp,
    titleZhTrad: current.titleZhTrad,
    emoji: current.emoji,
    currentXp: xp,
    nextXp: next.xp,
    progressPercent,
  };
}

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  playerName: 'You (Challenger)',
  playerAvatar: '🧠',
  playerCountry: '🌐',
  xp: 0,
  level: 1,
  levelTitle: 'Curious',
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  livesRemaining: 3,
  categoryStats: {
    world: { attempted: 0, correct: 0 },
    animals: { attempted: 0, correct: 0 },
    science: { attempted: 0, correct: 0 },
    history: { attempted: 0, correct: 0 },
    nature: { attempted: 0, correct: 0 },
    human_body: { attempted: 0, correct: 0 },
    space: { attempted: 0, correct: 0 },
    culture: { attempted: 0, correct: 0 },
    everyday: { attempted: 0, correct: 0 },
    mixed: { attempted: 0, correct: 0 },
  },
  dailyChallengeCompletedDates: [],
  dailyBestScore: 0,
  deceptiveCorrect: 0,
  unlockedAchievements: [],
};

export interface SettingsState {
  language: Language;
  soundEnabled: boolean;
  bgmMode: BgmMode;
  fontSize: FontSize;
  ageTier: AgeTier;
  customGeminiApiKey?: string;
  encryptedApiKeyPayload?: string;
  isKeyEncrypted?: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  language: 'en',
  soundEnabled: true,
  bgmMode: 'off',
  fontSize: 'normal',
  ageTier: 'teen',
  customGeminiApiKey: '',
  encryptedApiKeyPayload: '',
  isKeyEncrypted: false,
};

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) return DEFAULT_PLAYER_STATS;
    const parsed = JSON.parse(raw);
    const merged: PlayerStats = {
      ...DEFAULT_PLAYER_STATS,
      ...parsed,
      categoryStats: {
        ...DEFAULT_PLAYER_STATS.categoryStats,
        ...(parsed.categoryStats || {}),
      },
    };
    // Ensure streak consistency
    merged.currentStreak = Math.max(0, merged.currentStreak || 0);
    merged.bestStreak = Math.max(merged.bestStreak || 0, merged.currentStreak);
    const lvl = getLevelInfo(merged.xp || 0);
    merged.level = lvl.level;
    merged.levelTitle = lvl.title;
    return merged;
  } catch {
    return DEFAULT_PLAYER_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // Ignore storage quota
  }
}

export function loadDiscoveries(): DiscoveryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISCOVERIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDiscoveryItem(item: DiscoveryItem): DiscoveryItem[] {
  const current = loadDiscoveries();
  const exists = current.find((d) => d.id === item.id || d.questionId === item.questionId);
  let updated: DiscoveryItem[];
  if (exists) {
    updated = current.filter((d) => d.id !== item.id && d.questionId !== item.questionId);
  } else {
    updated = [item, ...current];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_DISCOVERIES, JSON.stringify(updated));
  }
  return updated;
}

export function loadSettings(): SettingsState {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const validAgeTiers: AgeTier[] = ['kids', 'teen', 'adult'];
    const validBgmModes: BgmMode[] = ['off', 'calm', 'arcade'];
    const validFontSizes: FontSize[] = ['normal', 'large', 'xl'];
    const ageTier = validAgeTiers.includes(parsed?.ageTier) ? parsed.ageTier : DEFAULT_SETTINGS.ageTier;
    const bgmMode = validBgmModes.includes(parsed?.bgmMode) ? parsed.bgmMode : DEFAULT_SETTINGS.bgmMode;
    const fontSize = validFontSizes.includes(parsed?.fontSize) ? parsed.fontSize : DEFAULT_SETTINGS.fontSize;
    return { ...DEFAULT_SETTINGS, ...parsed, ageTier, bgmMode, fontSize };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SettingsState) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = { ...settings };
    if (toSave.isKeyEncrypted && toSave.encryptedApiKeyPayload) {
      toSave.customGeminiApiKey = '';
    }
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(toSave));
  } catch {
    // Ignore
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadLeaderboardRecords(): LeaderboardRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchServerLeaderboard(): Promise<LeaderboardRecord[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.records)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(data.records));
          } catch {
            // Ignore
          }
        }
        return data.records;
      }
    }
  } catch (err) {
    console.warn('Unable to sync leaderboard from server:', err);
  }
  return loadLeaderboardRecords();
}

export function saveLeaderboardRecord(record: LeaderboardRecord): LeaderboardRecord[] {
  const current = loadLeaderboardRecords();
  const normalizedName = (record.name || '').trim().toLowerCase();

  // Deduplicate locally: merge records with matching name or id so each player only occupies 1 row
  const matched = current.filter(
    (r) => r.id === record.id || (normalizedName && r.name.trim().toLowerCase() === normalizedName)
  );
  const remaining = current.filter(
    (r) => r.id !== record.id && (!normalizedName || r.name.trim().toLowerCase() !== normalizedName)
  );

  let bestStreak = record.streak || 0;
  let bestXp = record.xp || 0;
  let bestScore = record.score || 0;
  let bestTotalQuestions = record.totalQuestions || 0;

  matched.forEach((m) => {
    if (m.streak > bestStreak) bestStreak = m.streak;
    if (m.xp > bestXp) bestXp = m.xp;
    if (m.score > bestScore) bestScore = m.score;
    if ((m.totalQuestions || 0) > bestTotalQuestions) bestTotalQuestions = m.totalQuestions || 0;
  });

  const mergedRecord: LeaderboardRecord = {
    ...record,
    streak: bestStreak,
    xp: bestXp,
    score: bestScore,
    totalQuestions: bestTotalQuestions,
  };

  const updated = [mergedRecord, ...remaining];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // Asynchronously send to server to enforce server-side IP & username single-row deduplication
  fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mergedRecord),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && Array.isArray(data.records) && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(data.records));
        } catch {
          // Ignore
        }
      }
    })
    .catch((err) => console.warn('Background leaderboard sync error:', err));

  return updated;
}
