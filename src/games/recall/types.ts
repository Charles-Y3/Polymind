export type CategoryId =
  | 'world'
  | 'animals'
  | 'science'
  | 'history'
  | 'nature'
  | 'human_body'
  | 'space'
  | 'culture'
  | 'everyday'
  | 'mixed';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5; // 1: Easy, 2: Interesting, 3: Tricky, 4: Expert, 5: Deceptive

export type AgeTier = 'kids' | 'teen' | 'adult';

export type QuestionType =
  | 'size'
  | 'weight'
  | 'height'
  | 'length'
  | 'depth'
  | 'volume'
  | 'speed'
  | 'age'
  | 'distance'
  | 'temperature'
  | 'population'
  | 'quantity'
  | 'time'
  | 'historical'
  | 'biological'
  | 'geography'
  | 'energy'
  | 'area'
  | 'density'
  | 'pressure'
  | 'frequency'
  | 'hardness'
  | 'thickness'
  | 'safety'
  | 'shape';

export interface ComparisonOption {
  id: string;
  name: string;
  nameZhSimp?: string;
  nameZhTrad?: string;
  emoji: string;
  valueDisplay: string;
  numericValue: number;
  unit: string;
}

export interface Question {
  id: string;
  category: CategoryId;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questionText: string;
  questionTextZhSimp?: string;
  questionTextZhTrad?: string;
  optionA: ComparisonOption;
  optionB: ComparisonOption;
  correctOptionId: 'A' | 'B';
  explanation: string;
  explanationZhSimp?: string;
  explanationZhTrad?: string;
  funFact: string;
  funFactZhSimp?: string;
  funFactZhTrad?: string;
  isDeceptive?: boolean;
  ageTier?: AgeTier | 'all';
}

export type GameMode = 'quick' | 'endless' | 'daily' | 'category' | 'streak' | 'ai_challenge';

export interface DiscoveryItem {
  id: string;
  questionId: string;
  title: string;
  emoji: string;
  comparisonText: string;
  explanation: string;
  funFact: string;
  category: CategoryId;
  savedAt: number;
  isFavorite?: boolean;
  aiDeepDive?: string;
}

export interface CategoryMastery {
  categoryId: CategoryId;
  attempted: number;
  correct: number;
  level: number; // 1 to 5
}

export interface LeaderboardRecord {
  id: string;
  name: string;
  avatar: string;
  country: string;
  streak: number;
  xp: number;
  score: number;
  totalQuestions?: number;
  gameMode?: string;
  date: string;
}

export interface PlayerStats {
  playerName?: string;
  playerAvatar?: string;
  playerCountry?: string;
  xp: number;
  level: number;
  levelTitle: string;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  livesRemaining: number;
  categoryStats: Record<CategoryId, { attempted: number; correct: number }>;
  dailyChallengeCompletedDates: string[]; // YYYY-MM-DD
  lastDailyDate?: string;
  dailyBestScore?: number;
  deceptiveCorrect?: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  titleZhSimp?: string;
  titleZhTrad?: string;
  description: string;
  descriptionZhSimp?: string;
  descriptionZhTrad?: string;
  emoji: string;
  xpReward: number;
  isUnlocked: boolean;
}

export type Language = 'en' | 'zh-CN' | 'zh-TW';

export type BgmMode = 'off' | 'calm' | 'arcade';

export type FontSize = 'normal' | 'large' | 'xl';
