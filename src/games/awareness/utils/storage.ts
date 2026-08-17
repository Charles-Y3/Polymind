import {
  Achievement,
  ChallengeResult,
  Language,
  LeaderboardEntry,
  PlayerProfile,
  SessionStats,
  SkillType,
} from '../types';
import { masteryRanks } from './i18n';

const PROFILE_KEY = 'perception_shift_profile_v1';
const SETTINGS_KEY = 'perception_shift_settings_v1';
const HISTORY_KEY = 'perception_shift_history_v1';

export const defaultProfile: PlayerProfile = {
  id: 'obs-' + Math.floor(1000 + Math.random() * 9000),
  username: 'Observer-' + Math.floor(1000 + Math.random() * 9000),
  avatar: '👁️',
  xp: 0,
  level: 1,
  unlockedLevel: 1,
  highestStreak: 0,
  totalGames: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  dailyStreak: 0,
  lastDailyDate: null,
  skillScores: {
    observation: 50,
    memory: 50,
    focus: 50,
    discrimination: 50,
    awareness: 50,
  },
  personalBests: {
    campaignScore: 0,
    dailyScore: 0,
    endlessScore: 0,
  },
  completedAchievements: {},
};

export const avatarOptions = ['👁️', '🦉', '🦅', '🔍', '⚡', '🌌', '🧬', '🎯', '🐱', '🧠'];

export interface AppSettings {
  language: Language;
  sound: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export const defaultSettings: AppSettings = {
  language: 'en',
  sound: true,
  highContrast: false,
  reducedMotion: false,
};

export const achievementsList: Achievement[] = [
  {
    id: 'first_look',
    title: { en: 'First Look', 'zh-CN': '初见微光', 'zh-TW': '初見微光' },
    description: { en: 'Complete your very first perception challenge.', 'zh-CN': '完成你的第一道感知挑战。', 'zh-TW': '完成你的第一道感知挑戰。' },
    icon: '🌱',
    xpReward: 100,
    progressMax: 1,
    getProgress: (p) => (p.totalAnswered >= 1 ? 1 : 0),
  },
  {
    id: 'sharp_eye',
    title: { en: 'Sharp Eye', 'zh-CN': '明察秋毫', 'zh-TW': '明察秋毫' },
    description: { en: 'Correctly solve 15 differences/oddities.', 'zh-CN': '正确找出 15 次差异与辨异目标。', 'zh-TW': '正確找出 15 次差異與辨異目標。' },
    icon: '👁️',
    xpReward: 250,
    progressMax: 15,
    getProgress: (p) => Math.min(15, p.totalCorrect),
  },
  {
    id: 'memory_keeper',
    title: { en: 'Memory Keeper', 'zh-CN': '过目不忘', 'zh-TW': '過目不忘' },
    description: { en: 'Achieve a Visual Memory rating of 75+.', 'zh-CN': '视觉记忆能力评分达到 75 分以上。', 'zh-TW': '視覺記憶能力評分達到 75 分以上。' },
    icon: '🧠',
    xpReward: 300,
    progressMax: 75,
    getProgress: (p) => Math.min(75, Math.floor(p.skillScores.memory || 50)),
  },
  {
    id: 'focus_master',
    title: { en: 'Focus Master', 'zh-CN': '定点聚焦', 'zh-TW': '定點聚焦' },
    description: { en: 'Achieve a Focus rating of 80+.', 'zh-CN': '聚焦专注评分达到 80 分以上。', 'zh-TW': '聚焦專注評分達到 80 分以上。' },
    icon: '🎯',
    xpReward: 350,
    progressMax: 80,
    getProgress: (p) => Math.min(80, Math.floor(p.skillScores.focus || 50)),
  },
  {
    id: 'streak_5',
    title: { en: 'Five in a Row', 'zh-CN': '五连洞察', 'zh-TW': '五連洞察' },
    description: { en: 'Reach a consecutive streak of 5 correct answers.', 'zh-CN': '获得连续 5 题正确答题连胜。', 'zh-TW': '獲得連續 5 題正確答題連勝。' },
    icon: '🔥',
    xpReward: 200,
    progressMax: 5,
    getProgress: (p) => Math.min(5, p.highestStreak),
  },
  {
    id: 'streak_10',
    title: { en: 'Unbroken Vision', 'zh-CN': '洞烛无双', 'zh-TW': '洞燭無雙' },
    description: { en: 'Reach a streak of 10 consecutive correct answers.', 'zh-CN': '达成连续 10 题完美无误答题。', 'zh-TW': '達成連續 10 題完美無誤答題。' },
    icon: '⚡',
    xpReward: 500,
    progressMax: 10,
    getProgress: (p) => Math.min(10, p.highestStreak),
  },
  {
    id: 'perfect_perception',
    title: { en: 'Perfect Perception', 'zh-CN': '全维洞察', 'zh-TW': '全維洞察' },
    description: { en: 'Achieve 100% accuracy across a full session.', 'zh-CN': '在一轮完整测评中达成 100% 满分正确率。', 'zh-TW': '在一輪完整測評中達成 100% 滿分正確率。' },
    icon: '✨',
    xpReward: 400,
    progressMax: 1,
    getProgress: (p, s) => (s && s.roundsPlayed >= 5 && s.accuracyPercent === 100 ? 1 : 0),
  },
  {
    id: 'anomaly_hunter',
    title: { en: 'Anomaly Hunter', 'zh-CN': '反常猎手', 'zh-TW': '反常獵手' },
    description: { en: 'Reach an Awareness rating of 80+.', 'zh-CN': '情境觉察评分达到 80 分以上。', 'zh-TW': '情境覺察評分達到 80 分以上。' },
    icon: '⚠️',
    xpReward: 350,
    progressMax: 80,
    getProgress: (p) => Math.min(80, Math.floor(p.skillScores.awareness || 50)),
  },
  {
    id: 'daily_observer',
    title: { en: 'Daily Observer', 'zh-CN': '每日巡礼', 'zh-TW': '每日巡禮' },
    description: { en: 'Complete a Daily Perception Challenge.', 'zh-CN': '完成一次每日感知统一定额挑战。', 'zh-TW': '完成一次每日感知統一定額挑戰。' },
    icon: '📅',
    xpReward: 300,
    progressMax: 1,
    getProgress: (p) => (p.dailyStreak >= 1 ? 1 : 0),
  },
  {
    id: 'master_perceiver',
    title: { en: 'Master Perceiver', 'zh-CN': '感知宗师', 'zh-TW': '感知宗師' },
    description: { en: 'Ascend to Level 10 (Master Perceiver).', 'zh-CN': '段位进阶晋升至 10 阶感知大师。', 'zh-TW': '段位進階晉升至 10 階感知大師。' },
    icon: '👑',
    xpReward: 1000,
    progressMax: 10,
    getProgress: (p) => Math.min(10, p.level),
  },
];

export function getStoredProfile(): PlayerProfile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProfile, ...parsed };
    }
  } catch {
    // fallback
  }
  return defaultProfile;
}

export function saveStoredProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return defaultSettings;
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function calculateMasteryLevel(xp: number): { level: number; rank: (typeof masteryRanks)[0]; nextRank?: (typeof masteryRanks)[0]; progressPercent: number } {
  let currentRank = masteryRanks[0];
  let nextRank: (typeof masteryRanks)[0] | undefined = masteryRanks[1];

  for (let i = masteryRanks.length - 1; i >= 0; i--) {
    if (xp >= masteryRanks[i].minXp) {
      currentRank = masteryRanks[i];
      nextRank = masteryRanks[i + 1];
      break;
    }
  }

  let progressPercent = 100;
  if (nextRank) {
    const currentTierXp = xp - currentRank.minXp;
    const tierSpan = nextRank.minXp - currentRank.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.floor((currentTierXp / tierSpan) * 100)));
  }

  return {
    level: currentRank.level,
    rank: currentRank,
    nextRank,
    progressPercent,
  };
}

export function updateProfileAfterChallenge(
  prevProfile: PlayerProfile,
  result: ChallengeResult
): { profile: PlayerProfile; newAchievements: Achievement[]; leveledUp: boolean } {
  const profile = { ...prevProfile };
  profile.totalAnswered += 1;

  if (result.isCorrect) {
    profile.totalCorrect += 1;
    const currentStreak = result.streak;
    if (currentStreak > profile.highestStreak) {
      profile.highestStreak = currentStreak;
    }
  }

  // Base XP gain: Correct = 50 + diff*15 + streak*10, Wrong = 10
  const xpEarned = result.isCorrect
    ? Math.floor(50 + result.difficulty * 15 + result.streak * 10 + (result.timeSpent < 3 ? 20 : 0))
    : 10;

  profile.xp += xpEarned;

  // Skill Score adjustment (Bayesian-like smoothed EMA)
  const currentSkillScore = profile.skillScores[result.skill] || 50;
  const performanceFactor = result.isCorrect
    ? Math.min(100, 70 + (10 - Math.min(10, result.timeSpent)) * 3)
    : Math.max(20, currentSkillScore - 6);
  
  profile.skillScores[result.skill] = Math.round(currentSkillScore * 0.85 + performanceFactor * 0.15);

  const prevLevel = profile.level;
  const mastery = calculateMasteryLevel(profile.xp);
  profile.level = mastery.level;
  const leveledUp = profile.level > prevLevel;

  // Check achievements
  const newAchievements: Achievement[] = [];
  achievementsList.forEach((ach) => {
    if (!profile.completedAchievements[ach.id]) {
      const progress = ach.getProgress(profile);
      if (progress >= ach.progressMax) {
        profile.completedAchievements[ach.id] = new Date().toISOString();
        profile.xp += ach.xpReward;
        newAchievements.push(ach);
      }
    }
  });

  saveStoredProfile(profile);
  return { profile, newAchievements, leveledUp };
}

// ----------------------------------------------------
// DYNAMIC LEADERBOARD SIMULATOR
// ----------------------------------------------------
const simulatedNames = [
  'EagleEye',
  'NovaSight',
  'ZenObserver',
  'Vigilant_X',
  'SharpClaw',
  'AeroScope',
  'PulseSeeker',
  'LumenGaze',
  'HyperFocus',
  'MiraTrace',
  'CipherLook',
  'Spectra_09',
  'KestrelView',
  'OmegaPoint',
  'FalconSpot',
];

export function generateLeaderboard(
  type: 'global' | 'daily' | 'weekly' | SkillType,
  playerProfile: PlayerProfile,
  todayScore: number = 0
): LeaderboardEntry[] {
  const seedMultiplier = type === 'daily' ? 1.0 : type === 'weekly' ? 1.4 : 1.8;
  const baseScores = [
    11450, 10890, 10420, 9980, 9620, 9310, 8940, 8670, 8420, 8150, 7890, 7620, 7340, 7120, 6890,
  ].map((s) => Math.floor(s * seedMultiplier));

  let playerScore = playerProfile.personalBests.campaignScore || 4500;
  if (type === 'daily') {
    playerScore = todayScore || playerProfile.personalBests.dailyScore || 6200;
  }

  const entries: LeaderboardEntry[] = simulatedNames.map((name, i) => ({
    id: `bot-${i}`,
    name,
    avatar: avatarOptions[i % avatarOptions.length],
    score: baseScores[i] || 5000,
    accuracy: Math.floor(88 + ((15 - i) / 15) * 11),
    masteryTitle: masteryRanks[Math.min(9, Math.floor(10 - i * 0.6))].title.en,
    rank: i + 1,
  }));

  // Insert player
  const playerRankTitle = calculateMasteryLevel(playerProfile.xp).rank.title.en;
  const playerEntry: LeaderboardEntry = {
    id: playerProfile.id,
    name: playerProfile.username + ' (You)',
    avatar: playerProfile.avatar,
    score: playerScore,
    accuracy: playerProfile.totalAnswered > 0 ? Math.round((playerProfile.totalCorrect / playerProfile.totalAnswered) * 100) : 92,
    masteryTitle: playerRankTitle,
    isPlayer: true,
    rank: 1,
  };

  entries.push(playerEntry);
  entries.sort((a, b) => b.score - a.score);

  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

export function getPercentile(score: number, maxExpected = 12000): number {
  const ratio = Math.min(1, Math.max(0.1, score / maxExpected));
  if (ratio > 0.92) return 1;
  if (ratio > 0.82) return 5;
  if (ratio > 0.7) return 10;
  if (ratio > 0.5) return 25;
  return 50;
}
