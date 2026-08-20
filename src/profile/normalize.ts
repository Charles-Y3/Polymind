import type {GameId} from '../shell/games';
import type {GameContribution} from './profileStore';

// Tunable reference caps — raise as players' real-world bests come in.
const REFLEXES_SCORE_CAP = 10000; // gravity-tilt highestScore
const RECALL_LEVEL_CAP = 20; // choice-clash's 20-tier level table
const RECALL_STREAK_CAP = 20;
const LOGIC_SCORE_CAP = 20000; // Logic Lock totalScore

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function clamp0to100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function computeReflexes(): GameContribution | null {
  const stats = readJson<{highestScore?: number}>('tilt_balance_stats_v1');
  if (!stats || !stats.highestScore) return null;
  return {
    norm: clamp0to100((stats.highestScore / REFLEXES_SCORE_CAP) * 100),
    nativeBest: stats.highestScore,
    updatedAt: new Date().toISOString(),
  };
}

function computeRecall(): GameContribution | null {
  const stats = readJson<{level?: number; bestStreak?: number}>('wyc_player_stats_v1');
  if (!stats || (!stats.level && !stats.bestStreak)) return null;
  const levelNorm = clamp0to100(((stats.level ?? 1) / RECALL_LEVEL_CAP) * 100);
  const streakNorm = clamp0to100(((stats.bestStreak ?? 0) / RECALL_STREAK_CAP) * 100);
  return {
    norm: clamp0to100(levelNorm * 0.7 + streakNorm * 0.3),
    nativeBest: stats.bestStreak,
    updatedAt: new Date().toISOString(),
  };
}

function computeLogic(): GameContribution | null {
  const progress = readJson<{totalScore?: number; mindProfile?: Record<string, number>}>('machine_mind_player_progress_v1');
  if (!progress || (!progress.totalScore && !progress.mindProfile)) return null;
  const scoreNorm = clamp0to100(((progress.totalScore ?? 0) / LOGIC_SCORE_CAP) * 100);
  const axes = progress.mindProfile ? Object.values(progress.mindProfile) : [];
  const profileNorm = axes.length ? axes.reduce((a, b) => a + b, 0) / axes.length : 0;
  return {
    norm: clamp0to100(scoreNorm * 0.6 + profileNorm * 0.4),
    nativeBest: progress.totalScore,
    updatedAt: new Date().toISOString(),
  };
}

function computeAwareness(): GameContribution | null {
  const profile = readJson<{skillScores?: Record<string, number>}>('perception_shift_profile_v1');
  if (!profile || !profile.skillScores) return null;
  const values = Object.values(profile.skillScores);
  if (!values.length) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    norm: clamp0to100(avg),
    nativeBest: Math.round(avg),
    updatedAt: new Date().toISOString(),
  };
}

const COMPUTERS: Record<GameId, () => GameContribution | null> = {
  reflexes: computeReflexes,
  recall: computeRecall,
  logic: computeLogic,
  awareness: computeAwareness,
};

export function computeContribution(gameId: GameId): GameContribution | null {
  return COMPUTERS[gameId]();
}

export function computeAllContributions(): Partial<Record<GameId, GameContribution>> {
  const ids: GameId[] = ['reflexes', 'recall', 'logic', 'awareness'];
  const result: Partial<Record<GameId, GameContribution>> = {};
  for (const id of ids) {
    const c = computeContribution(id);
    if (c) result[id] = c;
  }
  return result;
}
