import { PlayerProgress, MindProfile, WorldId } from '../types';

export interface LeaderboardEntry {
  id: string;
  name: string;
  icon: string;
  score: number;
  isPlayer?: boolean;
  rank: number;
}

const BOT_NAMES = [
  'Cipher', 'Vector', 'Axiom', 'Recursion', 'Quanta', 'Paradox',
  'Lambda', 'Entropy', 'Fractal', 'Neuron', 'Codex', 'Nexus',
];
const BOT_SCORES = [3200, 2850, 2600, 2340, 2100, 1880, 1650, 1420, 1200, 980, 760, 540];

export function generateLeaderboard(playerName: string, playerScore: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = BOT_NAMES.map((name, i) => ({
    id: `bot-${i}`,
    name,
    icon: '🤖',
    score: BOT_SCORES[i] ?? 500,
    rank: i + 1,
  }));

  entries.push({
    id: 'player',
    name: playerName,
    icon: '🧠',
    score: playerScore,
    isPlayer: true,
    rank: 1,
  });

  entries.sort((a, b) => b.score - a.score);
  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}

const STORAGE_KEY = 'machine_mind_player_progress_v1';

export const initialMindProfile: MindProfile = {
  patternRecognition: 25,
  deduction: 20,
  hypothesisTesting: 15,
  logicalConditions: 15,
  abstractThinking: 20,
  problemSolving: 25,
};

export const defaultPlayerProgress: PlayerProgress = {
  currentWorld: 1,
  unlockedWorlds: [1],
  completedPuzzleIds: [],
  puzzleScores: {},
  totalScore: 0,
  mindProfile: { ...initialMindProfile },
  dailyStreak: 0,
  lastDailyDate: '',
  dailyCompleted: false,
  endlessHighScore: 0,
  unlockedModes: ['choose', 'enter', 'build', 'discover'], // All modes available, journey unlocks systematically
  soundEnabled: true,
  reducedMotion: false,
};

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return defaultPlayerProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlayerProgress;
    const parsed = JSON.parse(raw);
    return {
      ...defaultPlayerProgress,
      ...parsed,
      mindProfile: {
        ...initialMindProfile,
        ...(parsed.mindProfile || {})
      }
    };
  } catch (err) {
    console.error('Failed to load player progress:', err);
    return defaultPlayerProgress;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save player progress:', err);
  }
}

// Calculate mind profile growth after completing a puzzle
export function updateMindProfileOnCompletion(
  currentProfile: MindProfile,
  worldId: WorldId,
  scoreEarned: number,
  hintsUsed: number
): MindProfile {
  const boost = Math.min(10, Math.max(2, Math.floor(scoreEarned / 12)));
  const penalty = hintsUsed * 2;
  const netGain = Math.max(1, boost - penalty);

  const newProfile = { ...currentProfile };

  switch (worldId) {
    case 1: // Simple
      newProfile.patternRecognition = Math.min(100, newProfile.patternRecognition + netGain + 2);
      newProfile.deduction = Math.min(100, newProfile.deduction + netGain);
      break;
    case 2: // Pattern Sequences
      newProfile.patternRecognition = Math.min(100, newProfile.patternRecognition + netGain + 1);
      newProfile.abstractThinking = Math.min(100, newProfile.abstractThinking + netGain + 1);
      break;
    case 3: // Shape
      newProfile.abstractThinking = Math.min(100, newProfile.abstractThinking + netGain + 2);
      newProfile.patternRecognition = Math.min(100, newProfile.patternRecognition + netGain);
      break;
    case 4: // Combination
      newProfile.problemSolving = Math.min(100, newProfile.problemSolving + netGain + 2);
      newProfile.deduction = Math.min(100, newProfile.deduction + netGain + 1);
      break;
    case 5: // Conditional
      newProfile.logicalConditions = Math.min(100, newProfile.logicalConditions + netGain + 3);
      newProfile.deduction = Math.min(100, newProfile.deduction + netGain + 1);
      break;
    case 6: // Hidden Logic
      newProfile.logicalConditions = Math.min(100, newProfile.logicalConditions + netGain + 2);
      newProfile.abstractThinking = Math.min(100, newProfile.abstractThinking + netGain + 2);
      break;
    case 7: // Nested Machines
      newProfile.problemSolving = Math.min(100, newProfile.problemSolving + netGain + 2);
      newProfile.deduction = Math.min(100, newProfile.deduction + netGain + 2);
      break;
    case 8: // The Impossible Machine (Hypothesis Testing & Ambiguity)
      newProfile.hypothesisTesting = Math.min(100, newProfile.hypothesisTesting + netGain + 4);
      newProfile.problemSolving = Math.min(100, newProfile.problemSolving + netGain + 2);
      break;
  }

  return newProfile;
}
