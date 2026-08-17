export type InteractionMode = 'choose' | 'enter' | 'build' | 'discover';

export type WorldId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type GameMode = 'journey' | 'learn' | 'daily' | 'endless' | 'challenge';

export type DataType = 'number' | 'sequence' | 'symbols' | 'grid';

export interface SymbolItem {
  shape: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'pentagon' | 'arrow';
  color: string; // e.g., '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
  rotation?: number; // degrees 0, 90, 180, 270
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

export type PuzzleDataValue = number | number[] | SymbolItem[] | string | string[];

export interface PuzzleExample {
  input: PuzzleDataValue;
  output: PuzzleDataValue;
  label?: string;
  notes?: string;
}

export interface WorldInfo {
  id: WorldId;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  primaryMode: InteractionMode;
  color: string;
}

export interface RuleTokenOption {
  id: string;
  label: string;
  category: 'op' | 'value' | 'transform' | 'condition';
  symbol?: string;
}

export interface DistinguishingExperiment {
  id: string;
  input: PuzzleDataValue;
  label: string;
  hypothesisAOutcome: PuzzleDataValue;
  hypothesisBOutcome: PuzzleDataValue;
  explanation: string;
}

export interface Puzzle {
  id: string;
  worldId: WorldId;
  levelNumber: number;
  worldTitle: string;
  title: string;
  description: string;
  mode: InteractionMode;
  dataType: DataType;
  examples: PuzzleExample[];
  question: {
    input: PuzzleDataValue;
    expectedOutput?: PuzzleDataValue;
    choices?: PuzzleDataValue[]; // For Mode 1: Choose
  };
  expectedRule: {
    description: string;
    tokens?: string[]; // For Mode 3: Build
    // Custom evaluator function or token verification
    evaluate?: (input: any) => any;
  };
  // World 7 Nested pipeline steps
  nestedPipeline?: Array<{
    name: string;
    transformDescription: string;
    icon?: string;
  }>;
  // World 8 Impossible Machine ambiguous rules & experiments
  ambiguityChallenge?: {
    hypothesisA: string;
    hypothesisB: string;
    experiments: DistinguishingExperiment[];
    correctHypothesis: 'A' | 'B';
    correctExperimentId: string;
  };
  hints: [string, string, string];
  explanation: string;
  availableRuleTokens?: RuleTokenOption[]; // Tokens available in Mode 3
}

export interface MindProfile {
  patternRecognition: number; // 0 to 100 or 1-5 rating
  deduction: number;
  hypothesisTesting: number;
  logicalConditions: number;
  abstractThinking: number;
  problemSolving: number;
}

export interface PlayerProgress {
  currentWorld: WorldId;
  unlockedWorlds: WorldId[];
  completedPuzzleIds: string[];
  puzzleScores: Record<string, number>;
  totalScore: number;
  mindProfile: MindProfile;
  dailyStreak: number;
  lastDailyDate: string;
  dailyCompleted: boolean;
  dailyPuzzleId?: string;
  endlessHighScore: number;
  unlockedModes: InteractionMode[];
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface SolutionAttempt {
  puzzleId: string;
  userAnswer?: PuzzleDataValue;
  builtTokens?: string[];
  selectedHypothesis?: 'A' | 'B';
  testInputsRun?: Array<{ input: PuzzleDataValue; output: PuzzleDataValue }>;
  hintsUsed: number;
  attemptsCount: number;
  isCorrect: boolean;
  scoreEarned: number;
}
