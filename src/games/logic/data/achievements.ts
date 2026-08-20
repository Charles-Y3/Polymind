import { PlayerProgress } from '../types';

export interface AchievementDef {
  id: string;
  icon: string;
  title: { en: string; 'zh-CN': string; 'zh-TW': string };
  description: { en: string; 'zh-CN': string; 'zh-TW': string };
  lockpickReward: number;
  progressMax: number;
  getProgress: (p: PlayerProgress) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_keypad',
    icon: '🔢',
    title: { en: 'Cipher Cracker', 'zh-CN': '密码破译者', 'zh-TW': '密碼破譯者' },
    description: { en: 'Crack your first Keypad Cipher.', 'zh-CN': '破解你的第一台密码键盘。', 'zh-TW': '破解你的第一台密碼鍵盤。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.keypad?.cracks ? 1 : 0),
  },
  {
    id: 'first_tumbler',
    icon: '🗝️',
    title: { en: 'Grid Solver', 'zh-CN': '栓锁高手', 'zh-TW': '栓鎖高手' },
    description: { en: 'Crack your first Tumbler Grid.', 'zh-CN': '破解你的第一个栓锁网格。', 'zh-TW': '破解你的第一個栓鎖網格。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.tumbler?.cracks ? 1 : 0),
  },
  {
    id: 'first_circuit',
    icon: '⚡',
    title: { en: 'Signal Runner', 'zh-CN': '电路专家', 'zh-TW': '電路專家' },
    description: { en: 'Crack your first Circuit Breaker.', 'zh-CN': '破解你的第一个电路断路器。', 'zh-TW': '破解你的第一個電路斷路器。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.circuit?.cracks ? 1 : 0),
  },
  {
    id: 'first_combination',
    icon: '🎯',
    title: { en: 'Code Breaker', 'zh-CN': '密码大师', 'zh-TW': '密碼大師' },
    description: { en: 'Crack your first Combination.', 'zh-CN': '破解你的第一个密码组合。', 'zh-TW': '破解你的第一個密碼組合。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.combination?.cracks ? 1 : 0),
  },
  {
    id: 'first_laser',
    icon: '🔺',
    title: { en: 'Light Bender', 'zh-CN': '光影引导者', 'zh-TW': '光影引導者' },
    description: { en: 'Crack your first Laser Grid.', 'zh-CN': '破解你的第一个激光网格。', 'zh-TW': '破解你的第一個激光網格。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.laser?.cracks ? 1 : 0),
  },
  {
    id: 'first_rulesnap',
    icon: '🧩',
    title: { en: 'Rule Reader', 'zh-CN': '规则解读者', 'zh-TW': '規則解讀者' },
    description: { en: 'Crack your first Rule Snap.', 'zh-CN': '破解你的第一个规则速判。', 'zh-TW': '破解你的第一個規則速判。' },
    lockpickReward: 1,
    progressMax: 1,
    getProgress: (p) => (p.bests.rulesnap?.cracks ? 1 : 0),
  },
  {
    id: 'loot_1000',
    icon: '💰',
    title: { en: 'Small Time', 'zh-CN': '初出茅庐', 'zh-TW': '初出茅廬' },
    description: { en: 'Bank 1,000 total loot.', 'zh-CN': '累计获得 1,000 战利品。', 'zh-TW': '累計獲得 1,000 戰利品。' },
    lockpickReward: 1,
    progressMax: 1000,
    getProgress: (p) => Math.min(1000, p.totalScore),
  },
  {
    id: 'loot_5000',
    icon: '💎',
    title: { en: 'Master Thief', 'zh-CN': '大盗', 'zh-TW': '大盜' },
    description: { en: 'Bank 5,000 total loot.', 'zh-CN': '累计获得 5,000 战利品。', 'zh-TW': '累計獲得 5,000 戰利品。' },
    lockpickReward: 2,
    progressMax: 5000,
    getProgress: (p) => Math.min(5000, p.totalScore),
  },
  {
    id: 'loot_20000',
    icon: '👑',
    title: { en: 'Legendary Score', 'zh-CN': '传奇战绩', 'zh-TW': '傳奇戰績' },
    description: { en: 'Bank 20,000 total loot.', 'zh-CN': '累计获得 20,000 战利品。', 'zh-TW': '累計獲得 20,000 戰利品。' },
    lockpickReward: 3,
    progressMax: 20000,
    getProgress: (p) => Math.min(20000, p.totalScore),
  },
  {
    id: 'gauntlet_500',
    icon: '♾️',
    title: { en: 'Deep Diver', 'zh-CN': '深潜者', 'zh-TW': '深潛者' },
    description: { en: 'Bank a Gauntlet run worth 500+.', 'zh-CN': '在无尽试炼中入账 500 以上战利品。', 'zh-TW': '在無盡試煉中入帳 500 以上戰利品。' },
    lockpickReward: 2,
    progressMax: 500,
    getProgress: (p) => Math.min(500, p.gauntletBest),
  },
  {
    id: 'gauntlet_2000',
    icon: '🌀',
    title: { en: 'Vault Ghost', 'zh-CN': '幽灵大盗', 'zh-TW': '幽靈大盜' },
    description: { en: 'Bank a Gauntlet run worth 2,000+.', 'zh-CN': '在无尽试炼中入账 2,000 以上战利品。', 'zh-TW': '在無盡試煉中入帳 2,000 以上戰利品。' },
    lockpickReward: 3,
    progressMax: 2000,
    getProgress: (p) => Math.min(2000, p.gauntletBest),
  },
  {
    id: 'daily_streak_7',
    icon: '🔥',
    title: { en: 'Week of Heists', 'zh-CN': '连续七日', 'zh-TW': '連續七日' },
    description: { en: 'Reach a 7-day Daily Vault streak.', 'zh-CN': '达成连续 7 天每日金库连胜。', 'zh-TW': '達成連續 7 天每日金庫連勝。' },
    lockpickReward: 2,
    progressMax: 7,
    getProgress: (p) => Math.min(7, p.dailyStreak),
  },
  {
    id: 'daily_streak_30',
    icon: '🏅',
    title: { en: 'Vault Regular', 'zh-CN': '金库常客', 'zh-TW': '金庫常客' },
    description: { en: 'Reach a 30-day Daily Vault streak.', 'zh-CN': '达成连续 30 天每日金库连胜。', 'zh-TW': '達成連續 30 天每日金庫連勝。' },
    lockpickReward: 4,
    progressMax: 30,
    getProgress: (p) => Math.min(30, p.dailyStreak),
  },
  {
    id: 'vault_master',
    icon: '🖤',
    title: { en: 'Vault Master', 'zh-CN': '金库大师', 'zh-TW': '金庫大師' },
    description: { en: 'Earn 3 stars on every heist.', 'zh-CN': '在所有劫案中获得 3 星评价。', 'zh-TW': '在所有劫案中獲得 3 星評價。' },
    lockpickReward: 5,
    progressMax: 8,
    getProgress: (p) => Object.values(p.heists).filter((h) => h.stars === 3).length,
  },
  {
    id: 'sharp_mind',
    icon: '🧠',
    title: { en: 'Sharp Mind', 'zh-CN': '心思缜密', 'zh-TW': '心思縝密' },
    description: { en: 'Reach an average Mind Profile of 80.', 'zh-CN': '心智档案平均值达到 80。', 'zh-TW': '心智檔案平均值達到 80。' },
    lockpickReward: 3,
    progressMax: 80,
    getProgress: (p) => Math.min(80, Math.floor(Object.values(p.mindProfile).reduce((a, b) => a + b, 0) / Object.values(p.mindProfile).length)),
  },
];

export function evaluateAchievements(progress: PlayerProgress): { progress: PlayerProgress; unlocked: AchievementDef[] } {
  let next = progress;
  const unlocked: AchievementDef[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (next.achievements[ach.id]) continue;
    if (ach.getProgress(next) >= ach.progressMax) {
      next = {
        ...next,
        achievements: { ...next.achievements, [ach.id]: new Date().toISOString() },
        lockpicks: next.lockpicks + ach.lockpickReward,
      };
      unlocked.push(ach);
    }
  }
  return { progress: next, unlocked };
}
