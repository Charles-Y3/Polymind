export type GameMode = 'notice' | 'remember' | 'focus' | 'shift' | 'perceive';
export type DifficultyTier = 'beginner' | 'advanced' | 'expert';
export type SkillType = 'observation' | 'memory' | 'focus' | 'discrimination' | 'awareness';
export type PlayMode = 'campaign' | 'daily' | 'practice' | 'endless';
export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface BaseChallenge {
  id: string;
  mode: GameMode;
  skill: SkillType;
  difficulty: number; // 1 - 10
  timeLimit: number; // in seconds
  prompt: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  hint?: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export interface NoticeChallenge extends BaseChallenge {
  mode: 'notice';
  gridSize: number; // e.g., 3 for 3x3, 4 for 4x4, 5 for 5x5
  items: {
    id: string;
    symbol: string;
    variant: string;
    rotation?: number; // degrees
    scale?: number;
    color?: string;
    isOdd: boolean;
  }[];
  explanation: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export interface RememberChallenge extends BaseChallenge {
  mode: 'remember';
  displayDuration: number; // e.g., 3 seconds
  memorizeItems: {
    id: string;
    name: string;
    symbol: string;
    color: string;
    positionLabel: string;
    attributes?: Record<string, string>;
  }[];
  layoutType: 'row' | 'grid';
  question: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  options: {
    id: string;
    label: {
      en: string;
      'zh-CN': string;
      'zh-TW': string;
    };
    symbol?: string;
    color?: string;
    isCorrect: boolean;
  }[];
}

export interface FocusChallenge extends BaseChallenge {
  mode: 'focus';
  targetRule: {
    symbol: string;
    name: {
      en: string;
      'zh-CN': string;
      'zh-TW': string;
    };
    rotation?: number;
    color?: string;
  };
  items: {
    id: string;
    symbol: string;
    rotation: number;
    color: string;
    isTarget: boolean;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    size?: number;
  }[];
  totalTargets: number;
}

export type ShiftChangeType =
  | 'addition'
  | 'removal'
  | 'movement'
  | 'rotation'
  | 'size'
  | 'color'
  | 'state'
  | 'replacement'
  | 'count';

export interface ShiftItem {
  id: string;
  name: string;
  icon: string;
  x: number; // 0-100%
  y: number; // 0-100%
  rotation?: number;
  scale?: number;
  color?: string;
  stateLabel?: string;
  countBadge?: number;
}

export interface ShiftChallenge extends BaseChallenge {
  mode: 'shift';
  sceneName: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  sceneType: 'kitchen' | 'bedroom' | 'office' | 'nature' | 'laboratory' | 'city';
  sceneA: ShiftItem[];
  sceneB: ShiftItem[];
  changedItemIds: string[];
  changeType: ShiftChangeType;
  changeDescription: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export interface PerceiveItem {
  id: string;
  name: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  icon: string;
  x: number;
  y: number;
  isAnomaly: boolean;
  anomalyReason?: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export interface PerceiveChallenge extends BaseChallenge {
  mode: 'perceive';
  theme: 'kitchen' | 'bedroom' | 'library' | 'beach' | 'arctic' | 'space' | 'street' | 'laboratory';
  themeTitle: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  items: PerceiveItem[];
  anomalyId: string;
  explanation: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export type Challenge =
  | NoticeChallenge
  | RememberChallenge
  | FocusChallenge
  | ShiftChallenge
  | PerceiveChallenge;

export interface ChallengeResult {
  challengeId: string;
  mode: GameMode;
  skill: SkillType;
  difficulty: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  score: number;
  streak: number;
  multiplier: number;
}

export interface SessionStats {
  mode: PlayMode;
  date: string;
  totalScore: number;
  roundsPlayed: number;
  correctAnswers: number;
  accuracyPercent: number;
  avgResponseTime: number;
  skillBreakdown: Record<SkillType, number>;
  maxStreak: number;
  perfectRounds: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  unlockedLevel: number;
  highestStreak: number;
  totalGames: number;
  totalCorrect: number;
  totalAnswered: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  skillScores: Record<SkillType, number>;
  personalBests: {
    campaignScore: number;
    dailyScore: number;
    endlessScore: number;
  };
  completedAchievements: Record<string, string>; // id -> ISO date
}

export interface Achievement {
  id: string;
  title: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  description: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  icon: string;
  xpReward: number;
  progressMax: number;
  getProgress: (profile: PlayerProfile, session?: SessionStats) => number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  accuracy: number;
  masteryTitle: string;
  isPlayer?: boolean;
}

export interface MasteryRank {
  level: number;
  minXp: number;
  title: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
  badgeColor: string;
  description: {
    en: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}
