import { PlayerProgress } from '../types';

export interface LogicAchievement {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  progressMax: number;
  getProgress: (p: PlayerProgress) => number;
}

export const ACHIEVEMENTS: LogicAchievement[] = [
  {
    id: 'first_steps',
    icon: '🔍',
    titleKey: 'achievements.firstSteps.title',
    descKey: 'achievements.firstSteps.desc',
    progressMax: 1,
    getProgress: (p) => Math.min(1, p.completedPuzzleIds.length),
  },
  {
    id: 'pattern_seeker',
    icon: '🧩',
    titleKey: 'achievements.patternSeeker.title',
    descKey: 'achievements.patternSeeker.desc',
    progressMax: 10,
    getProgress: (p) => p.completedPuzzleIds.length,
  },
  {
    id: 'world_explorer',
    icon: '🗺️',
    titleKey: 'achievements.worldExplorer.title',
    descKey: 'achievements.worldExplorer.desc',
    progressMax: 4,
    getProgress: (p) => p.unlockedWorlds.length,
  },
  {
    id: 'grand_machinist',
    icon: '🏛️',
    titleKey: 'achievements.grandMachinist.title',
    descKey: 'achievements.grandMachinist.desc',
    progressMax: 8,
    getProgress: (p) => p.unlockedWorlds.length,
  },
  {
    id: 'daily_devotion',
    icon: '🔥',
    titleKey: 'achievements.dailyDevotion.title',
    descKey: 'achievements.dailyDevotion.desc',
    progressMax: 7,
    getProgress: (p) => p.dailyStreak,
  },
  {
    id: 'endless_mind',
    icon: '♾️',
    titleKey: 'achievements.endlessMind.title',
    descKey: 'achievements.endlessMind.desc',
    progressMax: 500,
    getProgress: (p) => p.endlessHighScore,
  },
];
