export type Language = 'en' | 'zh-CN' | 'zh-TW';

type Key =
  | 'gameTitle'
  | 'heroHook'
  | 'tagline'
  | 'stars'
  | 'toggleSound'
  | 'tiltSettings'
  | 'campaign'
  | 'endless'
  | 'zenPractice'
  | 'starterLoadoutTitle'
  | 'starterLoadoutUnlocked'
  | 'starterLoadoutDesc'
  | 'none'
  | 'random'
  | 'randomLocked'
  | 'randomHint'
  | 'unlockHint'
  | 'endlessTitle'
  | 'endlessDesc'
  | 'highestScore'
  | 'startEndless'
  | 'zenTitle'
  | 'zenDesc'
  | 'startZen'
  | 'customizer'
  | 'leaderboard'
  | 'badges';

const TRANSLATIONS: Record<Language, Record<Key, string>> = {
  en: {
    gameTitle: 'GRAVITY TILT',
    heroHook: 'How Long Can You Stay Balanced?',
    tagline: 'Tilt & Gyro Mobile Physics',
    stars: 'Stars',
    toggleSound: 'Toggle Sound',
    tiltSettings: 'Tilt & Gyro Settings',
    campaign: 'Campaign',
    endless: 'Endless',
    zenPractice: 'Zen Practice',
    starterLoadoutTitle: '3-Star Starter Loadout',
    starterLoadoutUnlocked: 'Unlocked',
    starterLoadoutDesc: 'Earn 3 stars on stages to unlock starter power-up choices for your spawn loadout:',
    none: 'None',
    random: 'Random',
    randomLocked: 'Earn 3 stars on any stage to unlock Random loadout',
    randomHint: 'Randomly pick from unlocked starter power-ups',
    unlockHint: 'Earn 3 Stars on Stage {stage} to unlock {label}',
    endlessTitle: 'Endless Hazard Run',
    endlessDesc: 'Platform gets faster, obstacles spawn continuously! How long can you stay on the platform?',
    highestScore: 'Highest Score',
    startEndless: 'Start Endless Challenge',
    zenTitle: 'Zen Practice Mode',
    zenDesc: 'Relaxed mode with enclosed walls and gentle mechanics to test tilt controls and physics.',
    startZen: 'Start Free Balance',
    customizer: 'Customizer',
    leaderboard: 'Leaderboard',
    badges: 'Badges',
  },
  'zh-CN': {
    gameTitle: '重力倾斜',
    heroHook: '你能坚持平衡多久？',
    tagline: '倾斜与陀螺仪物理',
    stars: '星星',
    toggleSound: '切换音效',
    tiltSettings: '倾斜与陀螺仪设置',
    campaign: '战役',
    endless: '无尽',
    zenPractice: '禅意练习',
    starterLoadoutTitle: '三星初始装备',
    starterLoadoutUnlocked: '已解锁',
    starterLoadoutDesc: '在关卡中获得三星以解锁出生时可选的初始道具：',
    none: '无',
    random: '随机',
    randomLocked: '在任意关卡获得三星以解锁随机装备',
    randomHint: '从已解锁的初始道具中随机选择',
    unlockHint: '在第 {stage} 关获得三星以解锁 {label}',
    endlessTitle: '无尽挑战',
    endlessDesc: '平台速度不断加快，障碍物持续生成！看看你能撑多久！',
    highestScore: '最高分',
    startEndless: '开始无尽挑战',
    zenTitle: '禅意练习模式',
    zenDesc: '拥有围墙的轻松模式，用来测试倾斜控制与物理效果。',
    startZen: '开始自由平衡',
    customizer: '自定义',
    leaderboard: '排行榜',
    badges: '徽章',
  },
  'zh-TW': {
    gameTitle: '重力傾斜',
    heroHook: '你能堅持平衡多久？',
    tagline: '傾斜與陀螺儀物理',
    stars: '星星',
    toggleSound: '切換音效',
    tiltSettings: '傾斜與陀螺儀設定',
    campaign: '戰役',
    endless: '無盡',
    zenPractice: '禪意練習',
    starterLoadoutTitle: '三星初始裝備',
    starterLoadoutUnlocked: '已解鎖',
    starterLoadoutDesc: '在關卡中獲得三星以解鎖出生時可選的初始道具：',
    none: '無',
    random: '隨機',
    randomLocked: '在任意關卡獲得三星以解鎖隨機裝備',
    randomHint: '從已解鎖的初始道具中隨機選擇',
    unlockHint: '在第 {stage} 關獲得三星以解鎖 {label}',
    endlessTitle: '無盡挑戰',
    endlessDesc: '平台速度不斷加快，障礙物持續生成！看看你能撐多久！',
    highestScore: '最高分',
    startEndless: '開始無盡挑戰',
    zenTitle: '禪意練習模式',
    zenDesc: '擁有圍牆的輕鬆模式，用來測試傾斜控制與物理效果。',
    startZen: '開始自由平衡',
    customizer: '自訂',
    leaderboard: '排行榜',
    badges: '徽章',
  },
};

export function t(lang: Language | undefined, key: Key, params?: Record<string, string>): string {
  const dict = TRANSLATIONS[lang ?? 'en'] ?? TRANSLATIONS.en;
  let str = dict[key] ?? TRANSLATIONS.en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replace(`{${k}}`, v);
  }
  return str;
}

interface LevelText {
  title: string;
  subtitle: string;
  description: string;
}

const LEVEL_TEXT: Record<number, Record<Language, LevelText>> = {
  1: {
    en: {title: 'Stage 1: Zen Phone Deck', subtitle: 'Learn Full-Screen Balance', description: 'The entire phone screen is your wooden balancing deck. Tilt carefully—rolling off any edge drops you into the void!'},
    'zh-CN': {title: '第一关：禅意木台', subtitle: '学习全屏平衡', description: '整个手机屏幕就是你的木质平衡台。小心倾斜——滚出边缘就会坠入虚空！'},
    'zh-TW': {title: '第一關：禪意木台', subtitle: '學習全螢幕平衡', description: '整個手機螢幕就是你的木質平衡台。小心傾斜——滾出邊緣就會墜入虛空！'},
  },
  2: {
    en: {title: 'Stage 2: Cyber Grid', subtitle: 'Full-Display Wave Attack', description: 'Neon matrix spanning the whole screen. Dodge comets, bumpers, and expanding shockwaves with smooth tilt controls!'},
    'zh-CN': {title: '第二关：赛博网格', subtitle: '全屏波次攻击', description: '霓虹矩阵覆盖整个屏幕。用流畅的倾斜操作躲避彗星、缓冲器和不断扩大的冲击波！'},
    'zh-TW': {title: '第二關：賽博網格', subtitle: '全螢幕波次攻擊', description: '霓虹矩陣覆蓋整個螢幕。用流暢的傾斜操作躲避彗星、緩衝器和不斷擴大的衝擊波！'},
  },
  3: {
    en: {title: 'Stage 3: Floating Sky Arena', subtitle: 'Circular Screen Deck', description: 'A circular deck floating in deep space. Steer away from the rounded edges and heavy anvil drops!'},
    'zh-CN': {title: '第三关：浮空天域', subtitle: '圆形屏幕平台', description: '一座漂浮在深空中的圆形平台。远离圆边并躲避沉重的铁砧坠落！'},
    'zh-TW': {title: '第三關：浮空天域', subtitle: '圓形螢幕平台', description: '一座漂浮在深空中的圓形平台。遠離圓邊並躲避沉重的鐵砧墜落！'},
  },
  4: {
    en: {title: 'Stage 4: Magma Reactor', subtitle: 'Heavy Anvils & Homing Drones', description: 'Glowing magma chamber. Homing drones follow your ball while heavy anvils try to push you off the display boundaries!'},
    'zh-CN': {title: '第四关：熔岩反应堆', subtitle: '重型铁砧与追踪无人机', description: '炽热的熔岩腔室。追踪无人机紧随你的球，沉重的铁砧则试图把你推出屏幕边界！'},
    'zh-TW': {title: '第四關：熔岩反應爐', subtitle: '重型鐵砧與追蹤無人機', description: '熾熱的熔岩腔室。追蹤無人機緊隨你的球，沉重的鐵砧則試圖把你推出螢幕邊界！'},
  },
  5: {
    en: {title: 'Stage 5: Quantum Laboratory', subtitle: 'Cross-Deck Gravity Anomaly', description: 'Cross-shaped screen platform with telegraphed laser beams and popping pistons. Maximum tilt precision required.'},
    'zh-CN': {title: '第五关：量子实验室', subtitle: '十字平台重力异常', description: '十字形屏幕平台，布满预警激光束与突然弹出的活塞。需要极致的倾斜精度。'},
    'zh-TW': {title: '第五關：量子實驗室', subtitle: '十字平台重力異常', description: '十字形螢幕平台，佈滿預警雷射束與突然彈出的活塞。需要極致的傾斜精度。'},
  },
  6: {
    en: {title: 'Stage 6: Neon Overdrive', subtitle: 'The Ultimate Screen Trial', description: 'Compact central arena with continuous barrage of telegraphed hazards pushing you toward the drop-off void. Prove your master balance!'},
    'zh-CN': {title: '第六关：霓虹超频', subtitle: '终极屏幕试炼', description: '紧凑的中央竞技场，源源不断的预警危机将你推向坠落边缘。证明你至臻的平衡技艺！'},
    'zh-TW': {title: '第六關：霓虹超頻', subtitle: '終極螢幕試煉', description: '緊湊的中央競技場，源源不斷的預警危機將你推向墜落邊緣。證明你至臻的平衡技藝！'},
  },
};

export function getLevelText(lang: Language | undefined, levelId: number): LevelText {
  const entry = LEVEL_TEXT[levelId];
  if (!entry) return {title: '', subtitle: '', description: ''};
  return entry[lang ?? 'en'] ?? entry.en;
}
