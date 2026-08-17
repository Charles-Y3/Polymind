import type {SharedLanguage} from './language';
import type {GameId} from './games';

type ShellKey =
  | 'appTitle'
  | 'appTagline'
  | 'hubIntro'
  | 'leaderboard'
  | 'moreComingTitle'
  | 'moreComingDesc'
  | 'changeAvatar'
  | 'clickToRename'
  | 'changeLanguage'
  | 'languageTooltip'
  | 'loadingGame'
  | 'backToHub'
  | 'combinedLeaderboard'
  | 'leaderboardSubtitle'
  | 'loading'
  | 'noScoresYet';

const SHELL_TRANSLATIONS: Record<SharedLanguage, Record<ShellKey, string>> = {
  en: {
    appTitle: 'Polymind',
    appTagline: 'Four faculties. One player.',
    hubIntro: 'Pick a game below to test one faculty, or clear all four to fill out your profile.',
    leaderboard: 'Leaderboard',
    moreComingTitle: 'More coming',
    moreComingDesc: 'A new faculty joins the set soon.',
    changeAvatar: 'Change avatar',
    clickToRename: 'Click to rename',
    changeLanguage: 'Change language',
    languageTooltip: 'Language (applies to all games)',
    loadingGame: 'Loading {name}…',
    backToHub: 'Polymind',
    combinedLeaderboard: 'Combined Leaderboard',
    leaderboardSubtitle:
      'Ranked by total score across all four faculties (max 400). Each game also keeps its own leaderboard inside its own screen.',
    loading: 'Loading…',
    noScoresYet: 'No scores yet — be the first to clear a game and appear here.',
  },
  'zh-CN': {
    appTitle: '智汇',
    appTagline: '四项能力，一位玩家。',
    hubIntro: '选择下方的游戏测试一项能力，或全部完成以填满你的能力档案。',
    leaderboard: '排行榜',
    moreComingTitle: '敬请期待',
    moreComingDesc: '新的能力项目即将加入。',
    changeAvatar: '更改头像',
    clickToRename: '点击重命名',
    changeLanguage: '切换语言',
    languageTooltip: '语言设置（应用于所有游戏）',
    loadingGame: '正在加载{name}…',
    backToHub: '智汇',
    combinedLeaderboard: '综合排行榜',
    leaderboardSubtitle: '按四项能力的总分排名（满分 400）。每个游戏在自己的界面内也有独立排行榜。',
    loading: '加载中…',
    noScoresYet: '暂无成绩——成为第一个通关并上榜的玩家吧。',
  },
  'zh-TW': {
    appTitle: '智匯',
    appTagline: '四項能力，一位玩家。',
    hubIntro: '選擇下方的遊戲測試一項能力，或全部完成以填滿你的能力檔案。',
    leaderboard: '排行榜',
    moreComingTitle: '敬請期待',
    moreComingDesc: '新的能力項目即將加入。',
    changeAvatar: '更改頭像',
    clickToRename: '點擊重新命名',
    changeLanguage: '切換語言',
    languageTooltip: '語言設定（套用至所有遊戲）',
    loadingGame: '正在載入{name}…',
    backToHub: '智匯',
    combinedLeaderboard: '綜合排行榜',
    leaderboardSubtitle: '按四項能力的總分排名（滿分 400）。每個遊戲在自己的介面內也有獨立排行榜。',
    loading: '載入中…',
    noScoresYet: '暫無成績——成為第一個破關並上榜的玩家吧。',
  },
};

export function t(lang: SharedLanguage, key: ShellKey, params?: Record<string, string>): string {
  const dict = SHELL_TRANSLATIONS[lang] ?? SHELL_TRANSLATIONS.en;
  let str = dict[key] ?? SHELL_TRANSLATIONS.en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replace(`{${k}}`, v);
  }
  return str;
}

type GameTextField = 'name' | 'faculty' | 'tagline';

const GAME_TEXT: Record<GameId, Record<SharedLanguage, Record<GameTextField, string>>> = {
  reflexes: {
    en: {name: 'Gravity Tilt', faculty: 'Reflexes', tagline: 'Coordination, reaction, spatial control'},
    'zh-CN': {name: '重力倾斜', faculty: '反应', tagline: '协调、反应、空间控制'},
    'zh-TW': {name: '重力傾斜', faculty: '反應', tagline: '協調、反應、空間控制'},
  },
  recall: {
    en: {name: 'Choice Clash', faculty: 'Recall', tagline: 'Memory, knowledge, recognition'},
    'zh-CN': {name: '知识对决', faculty: '记忆', tagline: '记忆、知识、辨识'},
    'zh-TW': {name: '知識對決', faculty: '記憶', tagline: '記憶、知識、辨識'},
  },
  logic: {
    en: {name: 'Logic Lock', faculty: 'Logic', tagline: 'Deduction, pattern recognition, analysis'},
    'zh-CN': {name: '逻辑之锁', faculty: '逻辑', tagline: '推理、规律辨识、分析'},
    'zh-TW': {name: '邏輯之鎖', faculty: '邏輯', tagline: '推理、規律辨識、分析'},
  },
  awareness: {
    en: {name: 'Spot Rush', faculty: 'Awareness', tagline: 'Perception, focus, anomaly spotting'},
    'zh-CN': {name: '眼疾手快', faculty: '感知', tagline: '知觉、专注、异常侦测'},
    'zh-TW': {name: '眼疾手快', faculty: '感知', tagline: '知覺、專注、異常偵測'},
  },
};

export function getGameText(lang: SharedLanguage, gameId: GameId, field: GameTextField): string {
  const entry = GAME_TEXT[gameId];
  return (entry[lang] ?? entry.en)[field];
}
