import { PersonalBest, PlayerProgress, SkillAxis } from '../types';

const PROGRESS_KEY = 'machine_mind_player_progress_v1';

const DEFAULT_MIND_PROFILE: Record<SkillAxis, number> = {
  patternRecognition: 30,
  deduction: 30,
  circuitLogic: 30,
  hypothesisTesting: 30,
  spatialReasoning: 30,
  ruleInference: 30,
};

const NAME_ADJECTIVES = ['Shadow', 'Silent', 'Iron', 'Ghost', 'Velvet', 'Copper', 'Midnight', 'Rapid'];
const NAME_NOUNS = ['Fox', 'Cipher', 'Locksmith', 'Wraith', 'Falcon', 'Viper', 'Ronin', 'Specter'];

function randomVaultName(): string {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${adj}${noun}${num}`;
}

export const defaultProgress: PlayerProgress = {
  schemaVersion: 2,
  playerName: randomVaultName(),
  totalScore: 0,
  mindProfile: { ...DEFAULT_MIND_PROFILE },
  lockpicks: 3,
  grade: 'brass',
  heists: {},
  gauntletBest: 0,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyResult: null,
  bests: {},
  achievements: {},
  settings: { sound: true, reducedMotion: false },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function migrateFromV1(raw: any): PlayerProgress {
  const totalScore = typeof raw?.totalScore === 'number' ? raw.totalScore : 0;
  const oldAxes: number[] = raw?.mindProfile ? Object.values(raw.mindProfile).filter((v: any) => typeof v === 'number') : [];
  const carriedMean = oldAxes.length ? oldAxes.reduce((a, b) => a + b, 0) / oldAxes.length : 30;
  const seeded = clamp(carriedMean, 0, 40);

  return {
    ...defaultProgress,
    totalScore,
    mindProfile: {
      patternRecognition: seeded,
      deduction: seeded,
      circuitLogic: seeded,
      hypothesisTesting: seeded,
      spatialReasoning: seeded,
      ruleInference: seeded,
    },
    dailyStreak: typeof raw?.dailyStreak === 'number' ? raw.dailyStreak : 0,
    lastDailyDate: typeof raw?.lastDailyDate === 'string' ? raw.lastDailyDate : null,
  };
}

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion === 2) {
      return {
        ...defaultProgress,
        ...parsed,
        mindProfile: { ...DEFAULT_MIND_PROFILE, ...parsed.mindProfile },
        settings: { ...defaultProgress.settings, ...parsed.settings },
      };
    }
    const migrated = migrateFromV1(parsed);
    savePlayerProgress(migrated);
    return migrated;
  } catch {
    return { ...defaultProgress };
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function updateAxisScores(
  progress: PlayerProgress,
  axis: SkillAxis,
  performance: number,
  weight = 0.15
): PlayerProgress {
  const current = progress.mindProfile[axis] ?? 30;
  const next = Math.round(Math.max(0, Math.min(100, current * (1 - weight) + performance * weight)));
  return { ...progress, mindProfile: { ...progress.mindProfile, [axis]: next } };
}

export function recordBest(progress: PlayerProgress, type: keyof PlayerProgress['bests'], timeMs: number): PlayerProgress {
  const prev: PersonalBest = progress.bests[type] ?? { bestTimeMs: Infinity, cracks: 0 };
  const bestTimeMs = Math.min(prev.bestTimeMs, timeMs);
  return {
    ...progress,
    bests: { ...progress.bests, [type]: { bestTimeMs, cracks: prev.cracks + 1 } },
  };
}

export function resetProgress(): PlayerProgress {
  const fresh = { ...defaultProgress };
  savePlayerProgress(fresh);
  return fresh;
}
