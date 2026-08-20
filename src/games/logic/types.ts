export type LockType = 'keypad' | 'tumbler' | 'circuit' | 'combination' | 'laser' | 'rulesnap';

export type Grade = 'brass' | 'steel' | 'titanium' | 'obsidian';

export const GRADES: Grade[] = ['brass', 'steel', 'titanium', 'obsidian'];

export type SkillAxis =
  | 'patternRecognition'
  | 'deduction'
  | 'circuitLogic'
  | 'hypothesisTesting'
  | 'spatialReasoning'
  | 'ruleInference';

export const LOCK_TYPES: LockType[] = ['keypad', 'tumbler', 'circuit', 'combination', 'laser', 'rulesnap'];

export const SKILL_BY_TYPE: Record<LockType, SkillAxis> = {
  keypad: 'patternRecognition',
  tumbler: 'deduction',
  circuit: 'circuitLogic',
  combination: 'hypothesisTesting',
  laser: 'spatialReasoning',
  rulesnap: 'ruleInference',
};

export interface BaseLockPuzzle {
  id: string;
  type: LockType;
  grade: Grade;
  seed: string;
  timeLimitSec: number;
  attempts: number;
  probes?: number;
}

// --- Keypad Cipher ---
export interface KeypadPuzzle extends BaseLockPuzzle {
  type: 'keypad';
  shown: number[];
  predictCount: number;
  ruleLabel: string;
  next: (index: number) => number; // index 0-based continuation term
}

// --- Tumbler Grid ---
export type TumblerClueType = 'negation' | 'adjacency' | 'order' | 'parityOdd' | 'parityEven' | 'direct';
export interface TumblerClue {
  type: TumblerClueType;
  key: string; // key label
  key2?: string; // second key label, for adjacency/order
  slot?: number; // 1-based slot number, for negation/direct
}
export interface TumblerKey {
  id: string;
  label: string;
  symbol?: string;
}
export interface TumblerPuzzle extends BaseLockPuzzle {
  type: 'tumbler';
  n: number;
  keys: TumblerKey[];
  clues: TumblerClue[];
  solution: string[]; // keys[i].id occupies slot i
}

// --- Circuit Breaker ---
export type GateKind = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
export interface Gate {
  id: string;
  kind: GateKind;
  inputs: string[]; // ids of switches or other gates
}
export interface CircuitPuzzle extends BaseLockPuzzle {
  type: 'circuit';
  inputIds: string[];
  gates: Gate[];
  outputId: string;
  solutionCount: number;
}

// --- Combination Crack ---
export interface CombinationPuzzle extends BaseLockPuzzle {
  type: 'combination';
  length: number;
  symbols: string[];
  code: string[];
  maxGuesses: number;
}

// --- Laser Grid ---
export type MirrorOrientation = 0 | 1; // 0 = '/', 1 = '\'
export interface LaserCell {
  x: number;
  y: number;
  kind: 'empty' | 'blocker' | 'mirror' | 'emitter' | 'receiver';
  orientation?: MirrorOrientation;
  solvedOrientation?: MirrorOrientation;
  emitDir?: 'N' | 'S' | 'E' | 'W';
  // Non-path mirrors (decoys) are fixed in place — the player can't rotate them,
  // only reason about how they redirect a wrongly-set path mirror's beam.
  locked?: boolean;
}
export interface LaserPuzzle extends BaseLockPuzzle {
  type: 'laser';
  size: number;
  cells: LaserCell[];
  moveBudget: number;
  // On higher grades the beam isn't shown live — only revealed for a moment per test.
  maxBeamTests?: number;
}

// --- Rule Snap ---
export interface RuleSnapCard {
  id: string;
  input: number;
  output: number;
  isValid: boolean; // consistent with the true rule
}
export interface RuleSnapPuzzle extends BaseLockPuzzle {
  type: 'rulesnap';
  examples: { input: number; output: number }[];
  cards: RuleSnapCard[];
  secondsPerCard: number;
  requiredCorrect: number;
  ruleLabel: string;
}

export type LockPuzzle =
  | KeypadPuzzle
  | TumblerPuzzle
  | CircuitPuzzle
  | CombinationPuzzle
  | LaserPuzzle
  | RuleSnapPuzzle;

export interface ValidationResult {
  correct: boolean;
  detail?: string;
  // partial feedback used by some lock types (e.g. combination pin feedback, tumbler correct-count)
  extra?: any;
}

export interface HintPayload {
  text: string;
  reveal?: any;
}

export interface LockResult {
  type: LockType;
  grade: Grade;
  cracked: boolean;
  score: number;
  hintsUsed: number;
  attemptsUsed: number;
  timeMs: number;
  cleanCrack: boolean; // no hints, no wasted attempts
  ruleDescription: string;
}

export type PlayModeId = 'heist' | 'daily' | 'gauntlet' | 'practice';

export interface HeistDefinition {
  id: string;
  name: string;
  emoji: string;
  gradeOffset: number; // relative to player's selected grade, clamped
  recipe: LockType[];
}

export interface PersonalBest {
  bestTimeMs: number;
  cracks: number;
}

export interface DailyResult {
  date: string;
  cracked: number;
  total: number;
  score: number;
}

export interface PlayerProgress {
  schemaVersion: 2;
  playerName: string;
  totalScore: number;
  mindProfile: Record<SkillAxis, number>;
  lockpicks: number;
  grade: Grade;
  heists: Record<string, { stars: number; bestScore: number }>;
  gauntletBest: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyResult: DailyResult | null;
  bests: Partial<Record<LockType, PersonalBest>>;
  achievements: Record<string, string>;
  settings: {
    sound: boolean;
    reducedMotion: boolean;
  };
}
