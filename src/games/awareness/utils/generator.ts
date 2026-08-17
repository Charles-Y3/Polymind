import {
  Challenge,
  DifficultyTier,
  FocusChallenge,
  GameMode,
  NoticeChallenge,
  PerceiveChallenge,
  RememberChallenge,
  ShiftChallenge,
  ShiftChangeType,
  ShiftItem,
  SkillType,
} from '../types';

// Seeded PRNG for deterministic daily challenges
export function createPrng(seedString: string) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ----------------------------------------------------
// 1. MASSIVE NOTICE GENERATOR POOL (30+ Families)
// ----------------------------------------------------
const noticeSymbolFamilies = [
  {
    name: 'dots_hollow',
    baseSymbol: '●',
    oddSymbol: '○',
    explanation: {
      en: 'One circle is hollow while all others are solid.',
      'zh-CN': '有一个圆圈是空心的，而其他都是实心的。',
      'zh-TW': '有一個圓圈是空心的，而其他都是實心的。',
    },
  },
  {
    name: 'dots_dotted',
    baseSymbol: '●',
    oddSymbol: '◌',
    explanation: {
      en: 'One circle has a dashed dotted outline.',
      'zh-CN': '有一个圆圈是虚线边缘轮廓。',
      'zh-TW': '有一個圓圈是虛線邊緣輪廓。',
    },
  },
  {
    name: 'triangles_90',
    baseSymbol: '▲',
    oddSymbol: '▲',
    oddRotation: 90,
    explanation: {
      en: 'One triangle is rotated 90 degrees.',
      'zh-CN': '有一个三角形顺时针旋转了90度。',
      'zh-TW': '有一個三角形順時針旋轉了90度。',
    },
  },
  {
    name: 'triangles_180',
    baseSymbol: '▲',
    oddSymbol: '▼',
    explanation: {
      en: 'One triangle points downward.',
      'zh-CN': '有一个三角形朝向下方。',
      'zh-TW': '有一個三角形朝向下方。',
    },
  },
  {
    name: 'triangles_hollow',
    baseSymbol: '▲',
    oddSymbol: '△',
    explanation: {
      en: 'One triangle is unfilled/hollow.',
      'zh-CN': '有一个三角形未填充颜色。',
      'zh-TW': '有一個三角形未填充顏色。',
    },
  },
  {
    name: 'squares_diamond',
    baseSymbol: '■',
    oddSymbol: '◆',
    explanation: {
      en: 'One shape is a diamond instead of a square.',
      'zh-CN': '有一个图形是菱形而非正方形。',
      'zh-TW': '有一個圖形是菱形而非正方形。',
    },
  },
  {
    name: 'squares_hollow',
    baseSymbol: '■',
    oddSymbol: '□',
    explanation: {
      en: 'One square is hollow outline.',
      'zh-CN': '有一个正方形是空心线框。',
      'zh-TW': '有一個正方形是空心線框。',
    },
  },
  {
    name: 'arrows_opp',
    baseSymbol: '➔',
    oddSymbol: '➔',
    oddRotation: 180,
    explanation: {
      en: 'One arrow is pointing in the opposite direction.',
      'zh-CN': '有一个箭头的朝向与全部相反。',
      'zh-TW': '有一個箭頭的朝向與全部相反。',
    },
  },
  {
    name: 'arrows_diag',
    baseSymbol: '➔',
    oddSymbol: '➔',
    oddRotation: 45,
    explanation: {
      en: 'One arrow points diagonally upward.',
      'zh-CN': '有一个箭头呈斜上方45度角朝向。',
      'zh-TW': '有一個箭頭呈斜上方45度角朝向。',
    },
  },
  {
    name: 'double_arrows',
    baseSymbol: '⇛',
    oddSymbol: '⇉',
    explanation: {
      en: 'One double-arrow is distinct in stem style.',
      'zh-CN': '有一个双箭头的线条分叉形态不同。',
      'zh-TW': '有一個雙箭頭的線條分叉形態不同。',
    },
  },
  {
    name: 'rings_inverted',
    baseSymbol: '◎',
    oddSymbol: '◉',
    explanation: {
      en: 'One target ring has an inverted solid center dot.',
      'zh-CN': '有一个同心圆的中心实心点呈现反差。',
      'zh-TW': '有一個同心圓的中心實心點呈現反差。',
    },
  },
  {
    name: 'stars_4pt',
    baseSymbol: '★',
    oddSymbol: '✦',
    explanation: {
      en: 'One star has 4 points while the others have 5.',
      'zh-CN': '有一个是四芒星，其余均为五角星。',
      'zh-TW': '有一個是四芒星，其餘均為五角星。',
    },
  },
  {
    name: 'stars_6pt',
    baseSymbol: '★',
    oddSymbol: '✶',
    explanation: {
      en: 'One star has 6 rays.',
      'zh-CN': '有一个是六角星芒。',
      'zh-TW': '有一個是六角星芒。',
    },
  },
  {
    name: 'stars_hollow',
    baseSymbol: '★',
    oddSymbol: '☆',
    explanation: {
      en: 'One star is unfilled outline.',
      'zh-CN': '有一个五角星是空心线条。',
      'zh-TW': '有一個五角星是空心線條。',
    },
  },
  {
    name: 'hexagons_fill',
    baseSymbol: '⬡',
    oddSymbol: '⬢',
    explanation: {
      en: 'One hexagon is filled solid.',
      'zh-CN': '有一个六边形是实心填充的。',
      'zh-TW': '有一個六邊形是實心填充的。',
    },
  },
  {
    name: 'crosses_x',
    baseSymbol: '✚',
    oddSymbol: '✖',
    explanation: {
      en: 'One cross is tilted diagonally into an X.',
      'zh-CN': '有一个十字呈斜向交叉呈现。',
      'zh-TW': '有一個十字呈斜向交叉呈現。',
    },
  },
  {
    name: 'pentagon_vs_hex',
    baseSymbol: '⬟',
    oddSymbol: '⬢',
    explanation: {
      en: 'One polygon has 6 sides while all others have 5.',
      'zh-CN': '有一个是六边形，其余均为五边形。',
      'zh-TW': '有一個是六邊形，其餘均為五邊形。',
    },
  },
  {
    name: 'crescents',
    baseSymbol: '🌙',
    oddSymbol: '🌘',
    explanation: {
      en: 'One moon crescent is flipped in phase.',
      'zh-CN': '有一个月牙月相朝向与其余相反。',
      'zh-TW': '有一個月牙月相朝向與其餘相反。',
    },
  },
  {
    name: 'half_discs',
    baseSymbol: '◐',
    oddSymbol: '◑',
    explanation: {
      en: 'One circle is filled on the right side instead of left.',
      'zh-CN': '有一个圆的实心半边在右侧而非左侧。',
      'zh-TW': '有一個圓的實心半邊在右側而非左側。',
    },
  },
  {
    name: 'quadrants',
    baseSymbol: '◴',
    oddSymbol: '◵',
    explanation: {
      en: 'One pie quadrant sector is located in a different corner.',
      'zh-CN': '有一个圆盘的缺角扇形位于不同象限。',
      'zh-TW': '有一個圓盤的缺角扇形位於不同象限。',
    },
  },
  {
    name: 'rhombus_slanted',
    baseSymbol: '▰',
    oddSymbol: '▱',
    explanation: {
      en: 'One parallelogram is hollow outline.',
      'zh-CN': '有一个平行四边形为空心线框。',
      'zh-TW': '有一個平行四邊形為空心線框。',
    },
  },
  {
    name: 'hearts_cracked',
    baseSymbol: '♥',
    oddSymbol: '♡',
    explanation: {
      en: 'One heart is unfilled.',
      'zh-CN': '有一个爱心图案是空心的。',
      'zh-TW': '有一個愛心圖案是空心的。',
    },
  },
  {
    name: 'music_notes',
    baseSymbol: '♪',
    oddSymbol: '♫',
    explanation: {
      en: 'One musical note is double-stemmed beam note.',
      'zh-CN': '有一个音符是连杠双八分音符。',
      'zh-TW': '有一個音符是連槓雙八分音符。',
    },
  },
  {
    name: 'snowflakes',
    baseSymbol: '❄',
    oddSymbol: '❅',
    explanation: {
      en: 'One snowflake crystal has an alternate crystal symmetry.',
      'zh-CN': '有一个雪花晶体的结晶纹样有所不同。',
      'zh-TW': '有一個雪花晶體的結晶紋樣有所不同。',
    },
  },
  {
    name: 'math_brackets',
    baseSymbol: '【',
    oddSymbol: '〔',
    explanation: {
      en: 'One bracket is a tortoishell brace.',
      'zh-CN': '有一个括号样式为六角龟壳括弧。',
      'zh-TW': '有一個括號樣式為六角龜殼括弧。',
    },
  },
  {
    name: 'greek_symbols',
    baseSymbol: 'Ω',
    oddSymbol: '℧',
    explanation: {
      en: 'One Omega symbol is inverted upside down.',
      'zh-CN': '有一个欧米伽符号倒立朝下。',
      'zh-TW': '有一個歐米伽符號倒立朝下。',
    },
  },
  {
    name: 'astronomy_sun',
    baseSymbol: '☼',
    oddSymbol: '❂',
    explanation: {
      en: 'One solar emblem has round circular spokes.',
      'zh-CN': '有一个太阳图腾的光芒为圆瓣状。',
      'zh-TW': '有一個太陽圖騰的光芒為圓瓣狀。',
    },
  },
  {
    name: 'diamonds_card',
    baseSymbol: '♦',
    oddSymbol: '♢',
    explanation: {
      en: 'One card diamond is unfilled.',
      'zh-CN': '有一个方块图案是空心的。',
      'zh-TW': '有一個方塊圖案是空心的。',
    },
  },
];

export function generateNoticeChallenge(difficulty: number, rand = Math.random): NoticeChallenge {
  const diff = Math.max(1, Math.min(10, difficulty));
  const gridSize = diff <= 3 ? 3 : diff <= 7 ? 4 : 5;
  const totalItems = gridSize * gridSize;
  const oddIndex = Math.floor(rand() * totalItems);

  const family = noticeSymbolFamilies[Math.floor(rand() * noticeSymbolFamilies.length)];
  const isSlightAngle = diff >= 8 && family.oddRotation !== undefined;
  const actualRotation = isSlightAngle ? 25 + Math.floor(rand() * 20) : family.oddRotation || 0;

  const items = Array.from({ length: totalItems }, (_, index) => {
    const isOdd = index === oddIndex;
    return {
      id: `item-${index}`,
      symbol: isOdd ? family.oddSymbol : family.baseSymbol,
      variant: family.name,
      rotation: isOdd ? actualRotation : 0,
      scale: isOdd && diff >= 6 && !family.oddRotation ? 0.88 : 1,
      color: isOdd && diff <= 3 ? '#38bdf8' : '#e2e8f0',
      isOdd,
    };
  });

  return {
    id: `notice-${Date.now()}-${Math.floor(rand() * 10000)}`,
    mode: 'notice',
    skill: diff >= 7 ? 'discrimination' : 'observation',
    difficulty: diff,
    timeLimit: Math.max(5, 14 - diff * 0.8),
    gridSize,
    prompt: {
      en: 'Tap the only item that is different from the rest.',
      'zh-CN': '找出并点击唯一的异常项目。',
      'zh-TW': '找出並點擊唯一的異常項目。',
    },
    items,
    explanation: family.explanation,
  };
}

// ----------------------------------------------------
// 2. MASSIVE REMEMBER POOL (60+ Items, 6 Question Types)
// ----------------------------------------------------
const memoryPool = [
  // Animals
  { name: { en: 'Cat', 'zh-CN': '猫咪', 'zh-TW': '貓咪' }, symbol: '🐱', color: '#f59e0b', category: 'animal' },
  { name: { en: 'Dog', 'zh-CN': '小狗', 'zh-TW': '小狗' }, symbol: '🐶', color: '#fb923c', category: 'animal' },
  { name: { en: 'Fox', 'zh-CN': '狐狸', 'zh-TW': '狐狸' }, symbol: '🦊', color: '#f97316', category: 'animal' },
  { name: { en: 'Lion', 'zh-CN': '狮子', 'zh-TW': '獅子' }, symbol: '🦁', color: '#eab308', category: 'animal' },
  { name: { en: 'Panda', 'zh-CN': '熊猫', 'zh-TW': '熊貓' }, symbol: '🐼', color: '#e2e8f0', category: 'animal' },
  { name: { en: 'Owl', 'zh-CN': '猫头鹰', 'zh-TW': '貓頭鷹' }, symbol: '🦉', color: '#a855f7', category: 'animal' },
  { name: { en: 'Dolphin', 'zh-CN': '海豚', 'zh-TW': '海豚' }, symbol: '🐬', color: '#38bdf8', category: 'animal' },
  { name: { en: 'Butterfly', 'zh-CN': '蝴蝶', 'zh-TW': '蝴蝶' }, symbol: '🦋', color: '#06b6d4', category: 'animal' },
  { name: { en: 'Turtle', 'zh-CN': '乌龟', 'zh-TW': '烏龜' }, symbol: '🐢', color: '#22c55e', category: 'animal' },
  { name: { en: 'Eagle', 'zh-CN': '雄鹰', 'zh-TW': '雄鷹' }, symbol: '🦅', color: '#78716c', category: 'animal' },
  
  // Space & Skies
  { name: { en: 'Star', 'zh-CN': '星辰', 'zh-TW': '星辰' }, symbol: '⭐', color: '#fbbf24', category: 'space' },
  { name: { en: 'Moon', 'zh-CN': '弯月', 'zh-TW': '彎月' }, symbol: '🌙', color: '#c084fc', category: 'space' },
  { name: { en: 'Sun', 'zh-CN': '太阳', 'zh-TW': '太陽' }, symbol: '☀️', color: '#f97316', category: 'space' },
  { name: { en: 'Rocket', 'zh-CN': '火箭', 'zh-TW': '火箭' }, symbol: '🚀', color: '#ef4444', category: 'space' },
  { name: { en: 'UFO', 'zh-CN': '飞碟', 'zh-TW': '飛碟' }, symbol: '🛸', color: '#2dd4bf', category: 'space' },
  { name: { en: 'Planet', 'zh-CN': '行星', 'zh-TW': '行星' }, symbol: '🪐', color: '#d946ef', category: 'space' },
  { name: { en: 'Telescope', 'zh-CN': '望远镜', 'zh-TW': '望遠鏡' }, symbol: '🔭', color: '#6366f1', category: 'space' },
  { name: { en: 'Comet', 'zh-CN': '彗星', 'zh-TW': '彗星' }, symbol: '☄️', color: '#38bdf8', category: 'space' },

  // Nature & Objects
  { name: { en: 'House', 'zh-CN': '房屋', 'zh-TW': '房屋' }, symbol: '🏠', color: '#38bdf8', category: 'nature' },
  { name: { en: 'Tree', 'zh-CN': '松树', 'zh-TW': '松樹' }, symbol: '🌲', color: '#22c55e', category: 'nature' },
  { name: { en: 'Flower', 'zh-CN': '花朵', 'zh-TW': '花朵' }, symbol: '🌸', color: '#ec4899', category: 'nature' },
  { name: { en: 'Cactus', 'zh-CN': '仙人掌', 'zh-TW': '仙人掌' }, symbol: '🌵', color: '#10b981', category: 'nature' },
  { name: { en: 'Mushroom', 'zh-CN': '蘑菇', 'zh-TW': '蘑菇' }, symbol: '🍄', color: '#f43f5e', category: 'nature' },
  { name: { en: 'Rainbow', 'zh-CN': '彩虹', 'zh-TW': '彩虹' }, symbol: '🌈', color: '#a855f7', category: 'nature' },
  { name: { en: 'Lightning', 'zh-CN': '闪电', 'zh-TW': '閃電' }, symbol: '⚡', color: '#eab308', category: 'nature' },

  // Valuables & Tools
  { name: { en: 'Gem', 'zh-CN': '宝石', 'zh-TW': '寶石' }, symbol: '💎', color: '#06b6d4', category: 'item' },
  { name: { en: 'Crown', 'zh-CN': '王冠', 'zh-TW': '王冠' }, symbol: '👑', color: '#eab308', category: 'item' },
  { name: { en: 'Key', 'zh-CN': '钥匙', 'zh-TW': '鑰匙' }, symbol: '🔑', color: '#eab308', category: 'item' },
  { name: { en: 'Shield', 'zh-CN': '盾牌', 'zh-TW': '盾牌' }, symbol: '🛡️', color: '#64748b', category: 'item' },
  { name: { en: 'Bell', 'zh-CN': '金铃', 'zh-TW': '金鈴' }, symbol: '🔔', color: '#eab308', category: 'item' },
  { name: { en: 'Hourglass', 'zh-CN': '沙漏', 'zh-TW': '沙漏' }, symbol: '⌛', color: '#f59e0b', category: 'item' },
  { name: { en: 'Crystal Ball', 'zh-CN': '水晶球', 'zh-TW': '水晶球' }, symbol: '🔮', color: '#9333ea', category: 'item' },
  { name: { en: 'Trophy', 'zh-CN': '奖杯', 'zh-TW': '獎杯' }, symbol: '🏆', color: '#fbbf24', category: 'item' },
  { name: { en: 'Lightbulb', 'zh-CN': '灯泡', 'zh-TW': '燈泡' }, symbol: '💡', color: '#facc15', category: 'item' },
  { name: { en: 'Compass', 'zh-CN': '指南针', 'zh-TW': '指南針' }, symbol: '🧭', color: '#0ea5e9', category: 'item' },

  // Food
  { name: { en: 'Apple', 'zh-CN': '苹果', 'zh-TW': '蘋果' }, symbol: '🍎', color: '#ef4444', category: 'food' },
  { name: { en: 'Pizza', 'zh-CN': '披萨', 'zh-TW': '披薩' }, symbol: '🍕', color: '#f97316', category: 'food' },
  { name: { en: 'Sushi', 'zh-CN': '寿司', 'zh-TW': '壽司' }, symbol: '🍣', color: '#f43f5e', category: 'food' },
  { name: { en: 'Avocado', 'zh-CN': '牛油果', 'zh-TW': '牛油果' }, symbol: '🥑', color: '#84cc16', category: 'food' },
  { name: { en: 'Ice Cream', 'zh-CN': '冰淇淋', 'zh-TW': '冰淇淋' }, symbol: '🍦', color: '#ec4899', category: 'food' },
  { name: { en: 'Coffee', 'zh-CN': '热咖啡', 'zh-TW': '熱咖啡' }, symbol: '☕', color: '#78350f', category: 'food' },

  // Tech & Vehicles
  { name: { en: 'Bicycle', 'zh-CN': '自行车', 'zh-TW': '自行車' }, symbol: '🚲', color: '#ec4899', category: 'vehicle' },
  { name: { en: 'Race Car', 'zh-CN': '赛车', 'zh-TW': '賽車' }, symbol: '🏎️', color: '#dc2626', category: 'vehicle' },
  { name: { en: 'Airplane', 'zh-CN': '飞机', 'zh-TW': '飛機' }, symbol: '✈️', color: '#38bdf8', category: 'vehicle' },
  { name: { en: 'Helicopter', 'zh-CN': '直升机', 'zh-TW': '直升機' }, symbol: '🚁', color: '#14b8a6', category: 'vehicle' },
  { name: { en: 'Laptop', 'zh-CN': '电脑', 'zh-TW': '電腦' }, symbol: '💻', color: '#64748b', category: 'vehicle' },
  { name: { en: 'Gamepad', 'zh-CN': '手柄', 'zh-TW': '手柄' }, symbol: '🎮', color: '#6366f1', category: 'vehicle' },
];

export function generateRememberChallenge(difficulty: number, rand = Math.random): RememberChallenge {
  const diff = Math.max(1, Math.min(10, difficulty));
  const count = diff <= 3 ? 3 : diff <= 7 ? 5 : 7;
  const shuffled = [...memoryPool].sort(() => rand() - 0.5);
  const selected = shuffled.slice(0, count);

  const displayDuration = diff <= 3 ? 3.5 : diff <= 6 ? 3.0 : 2.5;

  const memorizeItems = selected.map((item, index) => ({
    id: `mem-${index}`,
    name: item.name.en,
    symbol: item.symbol,
    color: item.color,
    positionLabel: `${index + 1}`,
  }));

  // Decide question type: 'position' | 'center' | 'neighbor_right' | 'neighbor_left' | 'absent' | 'between'
  const possibleTypes: string[] = ['position'];
  if (count >= 5) possibleTypes.push('center', 'neighbor_right', 'neighbor_left');
  if (count >= 5 && diff >= 6) possibleTypes.push('absent', 'between');

  const questionType = possibleTypes[Math.floor(rand() * possibleTypes.length)];

  let questionText = {
    en: 'Which item was shown in the sequence?',
    'zh-CN': '刚才的序列中展示了哪个物品？',
    'zh-TW': '剛才的序列中展示了哪個物品？',
  };
  let correctItem = selected[0];
  let isNegativeQuestion = false;

  if (questionType === 'center') {
    const centerIndex = Math.floor(count / 2);
    correctItem = selected[centerIndex];
    questionText = {
      en: 'Which object was located in the exact center?',
      'zh-CN': '哪个物品位于正中间？',
      'zh-TW': '哪個物品位於正中間？',
    };
  } else if (questionType === 'neighbor_right') {
    const refIdx = Math.floor(rand() * (count - 1));
    const targetIdx = refIdx + 1;
    const refItem = selected[refIdx];
    correctItem = selected[targetIdx];
    questionText = {
      en: `Which object was immediately to the RIGHT of ${refItem.name.en} ${refItem.symbol}?`,
      'zh-CN': `哪个物品紧邻在 ${refItem.name['zh-CN']} ${refItem.symbol} 的右侧？`,
      'zh-TW': `哪個物品緊鄰在 ${refItem.name['zh-TW']} ${refItem.symbol} 的右側？`,
    };
  } else if (questionType === 'neighbor_left') {
    const refIdx = Math.floor(rand() * (count - 1)) + 1;
    const targetIdx = refIdx - 1;
    const refItem = selected[refIdx];
    correctItem = selected[targetIdx];
    questionText = {
      en: `Which object was immediately to the LEFT of ${refItem.name.en} ${refItem.symbol}?`,
      'zh-CN': `哪个物品紧邻在 ${refItem.name['zh-CN']} ${refItem.symbol} 的左侧？`,
      'zh-TW': `哪個物品緊鄰在 ${refItem.name['zh-TW']} ${refItem.symbol} 的左側？`,
    };
  } else if (questionType === 'between' && count >= 5) {
    const leftIdx = Math.floor(rand() * (count - 2));
    const midIdx = leftIdx + 1;
    const rightIdx = leftIdx + 2;
    const itemA = selected[leftIdx];
    const itemB = selected[rightIdx];
    correctItem = selected[midIdx];
    questionText = {
      en: `Which object sat BETWEEN ${itemA.symbol} and ${itemB.symbol}?`,
      'zh-CN': `夹在 ${itemA.symbol} 与 ${itemB.symbol} 中间的物品是什么？`,
      'zh-TW': `夾在 ${itemA.symbol} 與 ${itemB.symbol} 中間的物品是什麼？`,
    };
  } else if (questionType === 'absent') {
    isNegativeQuestion = true;
    const absentCandidate = shuffled.slice(count)[0];
    correctItem = absentCandidate;
    questionText = {
      en: 'Which of these items was NOT in the memorized sequence?',
      'zh-CN': '下列哪个物品未曾出现在刚才的序列中？',
      'zh-TW': '下列哪個物品未曾出現在剛才的序列中？',
    };
  } else {
    const targetIdx = Math.floor(rand() * count);
    correctItem = selected[targetIdx];
    const posEn = targetIdx === 0 ? 'first (leftmost)' : targetIdx === count - 1 ? 'last (rightmost)' : `position #${targetIdx + 1}`;
    const posZhCN = targetIdx === 0 ? '第一个（最左边）' : targetIdx === count - 1 ? '最后一个（最右边）' : `第 ${targetIdx + 1} 个`;
    const posZhTW = targetIdx === 0 ? '第一個（最左邊）' : targetIdx === count - 1 ? '最後一個（最右邊）' : `第 ${targetIdx + 1} 個`;

    questionText = {
      en: `Which object was at the ${posEn}?`,
      'zh-CN': `位于${posZhCN}的物品是什么？`,
      'zh-TW': `位於${posZhTW}的物品是什麼？`,
    };
  }

  // Generate 4 options
  let options;
  if (isNegativeQuestion) {
    const presentSubset = [...selected].sort(() => rand() - 0.5).slice(0, 3);
    options = [
      {
        id: 'opt-correct-absent',
        label: correctItem.name,
        symbol: correctItem.symbol,
        color: correctItem.color,
        isCorrect: true,
      },
      ...presentSubset.map((p, i) => ({
        id: `opt-present-${i}`,
        label: p.name,
        symbol: p.symbol,
        color: p.color,
        isCorrect: false,
      })),
    ].sort(() => rand() - 0.5);
  } else {
    const distractorPool = memoryPool.filter((p) => !selected.some((s) => s.symbol === p.symbol)).sort(() => rand() - 0.5);
    options = [
      {
        id: 'opt-correct',
        label: correctItem.name,
        symbol: correctItem.symbol,
        color: correctItem.color,
        isCorrect: true,
      },
      ...distractorPool.slice(0, 3).map((d, i) => ({
        id: `opt-distractor-${i}`,
        label: d.name,
        symbol: d.symbol,
        color: d.color,
        isCorrect: false,
      })),
    ].sort(() => rand() - 0.5);
  }

  return {
    id: `remember-${Date.now()}-${Math.floor(rand() * 10000)}`,
    mode: 'remember',
    skill: 'memory',
    difficulty: diff,
    timeLimit: 12,
    displayDuration,
    memorizeItems,
    layoutType: 'row',
    prompt: {
      en: 'Look carefully. Remember positions and symbols.',
      'zh-CN': '仔细观察并记住所有符号与位置。',
      'zh-TW': '仔細觀察並記住所有符號與位置。',
    },
    question: questionText,
    options,
  };
}

// ----------------------------------------------------
// 3. MASSIVE FOCUS POOL (20+ Target Rules)
// ----------------------------------------------------
const focusShapes = [
  {
    symbol: '▲',
    name: { en: 'Left-pointing Triangle ◀', 'zh-CN': '指向左侧的三角形 ◀', 'zh-TW': '指向左側的三角形 ◀' },
    targetRotation: 270,
    distractorRotations: [0, 90, 180],
  },
  {
    symbol: '➔',
    name: { en: 'Upward Arrow ⬆', 'zh-CN': '向上的箭头 ⬆', 'zh-TW': '向上的箭頭 ⬆' },
    targetRotation: 270,
    distractorRotations: [0, 90, 180],
  },
  {
    symbol: '➔',
    name: { en: 'Downward Arrow ⬇', 'zh-CN': '向下的箭头 ⬇', 'zh-TW': '向下的箭頭 ⬇' },
    targetRotation: 90,
    distractorRotations: [0, 180, 270],
  },
  {
    symbol: '★',
    name: { en: 'Upside-down Star', 'zh-CN': '倒置的五角星', 'zh-TW': '倒置的五角星' },
    targetRotation: 180,
    distractorRotations: [0],
  },
  {
    symbol: '◓',
    name: { en: 'Half-circle (Top Half Filled)', 'zh-CN': '上半填充的半圆', 'zh-TW': '上半填充的半圓' },
    targetRotation: 0,
    distractorRotations: [90, 180, 270],
  },
  {
    symbol: '◓',
    name: { en: 'Half-circle (Bottom Half Filled)', 'zh-CN': '下半填充的半圆', 'zh-TW': '下半填充的半圓' },
    targetRotation: 180,
    distractorRotations: [0, 90, 270],
  },
  {
    symbol: '◢',
    name: { en: 'Top-Right Wedge ◥', 'zh-CN': '右上角三角切片 ◥', 'zh-TW': '右上角三角切片 ◥' },
    targetRotation: 180,
    distractorRotations: [0, 90, 270],
  },
  {
    symbol: 'C',
    name: { en: 'Upward Open Arc ⋒', 'zh-CN': '开口朝上的弧形 ⋒', 'zh-TW': '開口朝上的弧形 ⋒' },
    targetRotation: 270,
    distractorRotations: [0, 90, 180],
  },
  {
    symbol: 'E',
    name: { en: 'Downward Comb ⫯', 'zh-CN': '开口朝下的梳形 ⫯', 'zh-TW': '開口朝下的梳形 ⫯' },
    targetRotation: 90,
    distractorRotations: [0, 180, 270],
  },
  {
    symbol: '✦',
    name: { en: 'Tilted Sparkle (45°)', 'zh-CN': '倾斜45度的四角星', 'zh-TW': '傾斜45度的四角星' },
    targetRotation: 45,
    distractorRotations: [0, 90],
  },
  {
    symbol: '◖',
    name: { en: 'Right-facing Semicircle ◗', 'zh-CN': '开口朝左半圆 ◗', 'zh-TW': '開口朝左半圓 ◗' },
    targetRotation: 180,
    distractorRotations: [0],
  },
  {
    symbol: '⇛',
    name: { en: 'Upward Triple Arrow ⇚', 'zh-CN': '向左三叉箭 ⇚', 'zh-TW': '向左三叉箭 ⇚' },
    targetRotation: 180,
    distractorRotations: [0, 90, 270],
  },
];

export function generateFocusChallenge(difficulty: number, rand = Math.random): FocusChallenge {
  const diff = Math.max(1, Math.min(10, difficulty));
  const count = diff <= 3 ? 24 : diff <= 7 ? 44 : 64;
  const shapeTheme = focusShapes[Math.floor(rand() * focusShapes.length)];

  const targetIndex = Math.floor(rand() * count);
  const cols = diff <= 3 ? 6 : 8;
  const rows = Math.ceil(count / cols);

  const colors = ['#e2e8f0', '#94a3b8', '#cbd5e1'];
  if (diff >= 6) colors.push('#64748b');

  const items = Array.from({ length: count }, (_, index) => {
    const isTarget = index === targetIndex;
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = ((col + 0.5) / cols) * 90 + 5 + (rand() * 4 - 2);
    const y = ((row + 0.5) / rows) * 88 + 6 + (rand() * 4 - 2);

    let rotation = 0;
    if (isTarget) {
      rotation = shapeTheme.targetRotation;
    } else {
      const distRotations = shapeTheme.distractorRotations;
      rotation = distRotations[Math.floor(rand() * distRotations.length)];
    }

    return {
      id: `focus-item-${index}`,
      symbol: shapeTheme.symbol,
      rotation,
      color: colors[Math.floor(rand() * colors.length)],
      isTarget,
      x,
      y,
      size: diff >= 8 ? 20 : 26,
    };
  });

  return {
    id: `focus-${Date.now()}-${Math.floor(rand() * 10000)}`,
    mode: 'focus',
    skill: 'focus',
    difficulty: diff,
    timeLimit: Math.max(6, 16 - diff * 0.9),
    targetRule: {
      symbol: shapeTheme.symbol,
      name: shapeTheme.name,
      rotation: shapeTheme.targetRotation,
    },
    items,
    totalTargets: 1,
    prompt: {
      en: `Find and tap the signal: ${shapeTheme.name.en}`,
      'zh-CN': `找出并点击目标信号：${shapeTheme.name['zh-CN']}`,
      'zh-TW': `找出並點擊目標信號：${shapeTheme.name['zh-TW']}`,
    },
  };
}

// ----------------------------------------------------
// 4. MASSIVE SHIFT PRESETS (15+ Scenes, 60+ Variations)
// ----------------------------------------------------
interface ShiftPreset {
  sceneType: 'kitchen' | 'bedroom' | 'office' | 'nature' | 'laboratory' | 'city';
  sceneName: { en: string; 'zh-CN': string; 'zh-TW': string };
  baseItems: ShiftItem[];
  changes: {
    type: ShiftChangeType;
    targetId: string;
    apply: (items: ShiftItem[]) => ShiftItem[];
    description: { en: string; 'zh-CN': string; 'zh-TW': string };
  }[];
}

const shiftPresets: ShiftPreset[] = [
  {
    sceneType: 'kitchen',
    sceneName: { en: 'Cozy Kitchen', 'zh-CN': '温馨厨房', 'zh-TW': '溫馨廚房' },
    baseItems: [
      { id: 'fridge', name: 'Refrigerator', icon: '🧊', x: 18, y: 35 },
      { id: 'stove', name: 'Oven Stove', icon: '🍳', x: 42, y: 40 },
      { id: 'coffee', name: 'Coffee Cup', icon: '☕', x: 65, y: 38 },
      { id: 'clock', name: 'Wall Clock', icon: '⏰', x: 50, y: 15 },
      { id: 'apple', name: 'Apple Bowl', icon: '🍎', x: 80, y: 55 },
      { id: 'plant', name: 'Potted Herb', icon: '🌿', x: 22, y: 70 },
      { id: 'lamp', name: 'Kitchen Lamp', icon: '💡', x: 82, y: 20 },
    ],
    changes: [
      {
        type: 'removal',
        targetId: 'clock',
        apply: (items) => items.filter((it) => it.id !== 'clock'),
        description: {
          en: 'The wall clock disappeared from the upper wall.',
          'zh-CN': '上方墙面的挂钟消失了。',
          'zh-TW': '上方牆面的掛鐘消失了。',
        },
      },
      {
        type: 'movement',
        targetId: 'coffee',
        apply: (items) => items.map((it) => (it.id === 'coffee' ? { ...it, x: 25, y: 38 } : it)),
        description: {
          en: 'The coffee cup moved from the right counter to beside the fridge.',
          'zh-CN': '咖啡杯从右侧操作台移动到了冰箱旁。',
          'zh-TW': '咖啡杯從右側操作台移動到了冰箱旁。',
        },
      },
      {
        type: 'state',
        targetId: 'lamp',
        apply: (items) => items.map((it) => (it.id === 'lamp' ? { ...it, icon: '🕯️' } : it)),
        description: {
          en: 'The modern lamp was replaced by a lit candle.',
          'zh-CN': '顶灯变成了点燃的蜡烛。',
          'zh-TW': '頂燈變成了點燃的蠟燭。',
        },
      },
      {
        type: 'addition',
        targetId: 'kettle',
        apply: (items) => [...items, { id: 'kettle', name: 'Teapot', icon: '🫖', x: 52, y: 40 }],
        description: {
          en: 'A teapot appeared beside the stove.',
          'zh-CN': '炉灶旁多出了一个茶壶。',
          'zh-TW': '爐灶旁多出了一個茶壺。',
        },
      },
    ],
  },
  {
    sceneType: 'bedroom',
    sceneName: { en: 'Quiet Bedroom', 'zh-CN': '宁静卧室', 'zh-TW': '寧靜臥室' },
    baseItems: [
      { id: 'bed', name: 'Bed', icon: '🛏️', x: 28, y: 48 },
      { id: 'window', name: 'Window', icon: '🪟', x: 75, y: 24 },
      { id: 'lamp', name: 'Desk Lamp', icon: '💡', x: 50, y: 35 },
      { id: 'books', name: 'Stack of Books', icon: '📚', x: 80, y: 65 },
      { id: 'plant', name: 'Monstera Plant', icon: '🪴', x: 15, y: 75 },
      { id: 'mirror', name: 'Wall Mirror', icon: '🪞', x: 20, y: 22 },
      { id: 'guitar', name: 'Guitar', icon: '🎸', x: 55, y: 70 },
    ],
    changes: [
      {
        type: 'rotation',
        targetId: 'guitar',
        apply: (items) => items.map((it) => (it.id === 'guitar' ? { ...it, rotation: 180 } : it)),
        description: {
          en: 'The guitar turned upside down.',
          'zh-CN': '吉他上下颠倒反转了。',
          'zh-TW': '吉他上下顛倒反轉了。',
        },
      },
      {
        type: 'size',
        targetId: 'plant',
        apply: (items) => items.map((it) => (it.id === 'plant' ? { ...it, scale: 1.6 } : it)),
        description: {
          en: 'The potted plant grew significantly larger.',
          'zh-CN': '盆栽植物明显变大放大了。',
          'zh-TW': '盆栽植物明顯變大放大了。',
        },
      },
      {
        type: 'removal',
        targetId: 'mirror',
        apply: (items) => items.filter((it) => it.id !== 'mirror'),
        description: {
          en: 'The wall mirror on the top left disappeared.',
          'zh-CN': '左上角的镜子消失不见了。',
          'zh-TW': '左上角的鏡子消失不見了。',
        },
      },
      {
        type: 'addition',
        targetId: 'cat',
        apply: (items) => [...items, { id: 'cat', name: 'Sleeping Cat', icon: '🐈', x: 38, y: 52 }],
        description: {
          en: 'A cat curled up to sleep on the bed.',
          'zh-CN': '床上多了一只熟睡的猫咪。',
          'zh-TW': '床上多了一隻熟睡的貓咪。',
        },
      },
    ],
  },
  {
    sceneType: 'laboratory',
    sceneName: { en: 'Science Lab', 'zh-CN': '科学实验室', 'zh-TW': '科學實驗室' },
    baseItems: [
      { id: 'microscope', name: 'Microscope', icon: '🔬', x: 25, y: 35 },
      { id: 'beaker', name: 'Beaker', icon: '🧪', x: 45, y: 40 },
      { id: 'dna', name: 'DNA Model', icon: '🧬', x: 75, y: 30 },
      { id: 'laptop', name: 'Data Laptop', icon: '💻', x: 65, y: 65 },
      { id: 'chart', name: 'Wall Chart', icon: '📊', x: 30, y: 15 },
      { id: 'goggles', name: 'Safety Goggles', icon: '🥽', x: 18, y: 65 },
      { id: 'flask', name: 'Erlenmeyer Flask', icon: '⚗️', x: 82, y: 65 },
    ],
    changes: [
      {
        type: 'movement',
        targetId: 'dna',
        apply: (items) => items.map((it) => (it.id === 'dna' ? { ...it, x: 25, y: 68 } : it)),
        description: {
          en: 'The DNA model relocated to the lower-left workbench.',
          'zh-CN': 'DNA 模型移动到了左下角工作台。',
          'zh-TW': 'DNA 模型移動到了左下角工作台。',
        },
      },
      {
        type: 'state',
        targetId: 'chart',
        apply: (items) => items.map((it) => (it.id === 'chart' ? { ...it, icon: '📈' } : it)),
        description: {
          en: 'The wall bar chart changed into a trend line graph.',
          'zh-CN': '墙上的柱状图变为了折线图。',
          'zh-TW': '牆上的柱狀圖變為了折線圖。',
        },
      },
      {
        type: 'removal',
        targetId: 'goggles',
        apply: (items) => items.filter((it) => it.id !== 'goggles'),
        description: {
          en: 'The safety goggles on the desk vanished.',
          'zh-CN': '桌上的防护眼镜消失了。',
          'zh-TW': '桌上的防護眼鏡消失了。',
        },
      },
      {
        type: 'addition',
        targetId: 'radiation',
        apply: (items) => [...items, { id: 'radiation', name: 'Warning Sign', icon: '☢️', x: 50, y: 15 }],
        description: {
          en: 'A biohazard warning symbol appeared in the center.',
          'zh-CN': '中心上方多出了辐射警告警示牌。',
          'zh-TW': '中心上方多出了輻射警告警示牌。',
        },
      },
    ],
  },
  {
    sceneType: 'office',
    sceneName: { en: 'Design Studio', 'zh-CN': '设计工作室', 'zh-TW': '設計工作室' },
    baseItems: [
      { id: 'monitor', name: 'Work Monitor', icon: '🖥️', x: 50, y: 38 },
      { id: 'coffee', name: 'Espresso', icon: '☕', x: 30, y: 45 },
      { id: 'plant', name: 'Desk Succulent', icon: '🪴', x: 72, y: 42 },
      { id: 'headphones', name: 'Headphones', icon: '🎧', x: 68, y: 65 },
      { id: 'notebook', name: 'Sketchbook', icon: '📒', x: 28, y: 68 },
      { id: 'pinboard', name: 'Pinboard', icon: '📌', x: 50, y: 15 },
      { id: 'chair', name: 'Ergonomic Chair', icon: '🪑', x: 50, y: 70 },
    ],
    changes: [
      {
        type: 'state',
        targetId: 'notebook',
        apply: (items) => items.map((it) => (it.id === 'notebook' ? { ...it, icon: '📖' } : it)),
        description: {
          en: 'The closed notebook opened up.',
          'zh-CN': '合上的手账笔记本被翻开摊开了。',
          'zh-TW': '合上手帳筆記本被翻開攤開了。',
        },
      },
      {
        type: 'removal',
        targetId: 'headphones',
        apply: (items) => items.filter((it) => it.id !== 'headphones'),
        description: {
          en: 'The headphones on the right vanished.',
          'zh-CN': '右侧桌面上的头戴耳机不见了。',
          'zh-TW': '右側桌面上的頭戴耳機不見了。',
        },
      },
      {
        type: 'movement',
        targetId: 'coffee',
        apply: (items) => items.map((it) => (it.id === 'coffee' ? { ...it, x: 75, y: 68 } : it)),
        description: {
          en: 'The coffee cup moved across to the bottom right.',
          'zh-CN': '咖啡杯平移到了右下角区域。',
          'zh-TW': '咖啡杯平移到了右下角區域。',
        },
      },
      {
        type: 'size',
        targetId: 'monitor',
        apply: (items) => items.map((it) => (it.id === 'monitor' ? { ...it, scale: 1.5 } : it)),
        description: {
          en: 'The monitor expanded into an ultrawide display.',
          'zh-CN': '显示屏尺寸明显放大扩展了。',
          'zh-TW': '顯示屏尺寸明顯放大擴展了。',
        },
      },
    ],
  },
  {
    sceneType: 'nature',
    sceneName: { en: 'Starlit Campfire', 'zh-CN': '星空露营', 'zh-TW': '星空露營' },
    baseItems: [
      { id: 'tent', name: 'Camping Tent', icon: '⛺', x: 25, y: 40 },
      { id: 'campfire', name: 'Campfire', icon: '🔥', x: 55, y: 55 },
      { id: 'pine', name: 'Pine Tree', icon: '🌲', x: 80, y: 35 },
      { id: 'moon', name: 'Full Moon', icon: '🌕', x: 75, y: 15 },
      { id: 'guitar', name: 'Acoustic Guitar', icon: '🎸', x: 38, y: 62 },
      { id: 'backpack', name: 'Rucksack', icon: '🎒', x: 18, y: 68 },
      { id: 'owl', name: 'Forest Owl', icon: '🦉', x: 82, y: 65 },
    ],
    changes: [
      {
        type: 'state',
        targetId: 'moon',
        apply: (items) => items.map((it) => (it.id === 'moon' ? { ...it, icon: '🌙' } : it)),
        description: {
          en: 'The full moon shifted into a crescent moon.',
          'zh-CN': '圆月变为了弯弯的月牙。',
          'zh-TW': '圓月變為了彎彎的月牙。',
        },
      },
      {
        type: 'removal',
        targetId: 'owl',
        apply: (items) => items.filter((it) => it.id !== 'owl'),
        description: {
          en: 'The owl on the tree branch flew away.',
          'zh-CN': '树下的猫头鹰飞走了。',
          'zh-TW': '樹下的貓頭鷹飛走了。',
        },
      },
      {
        type: 'addition',
        targetId: 'shooting_star',
        apply: (items) => [...items, { id: 'shooting_star', name: 'Meteor', icon: '🌠', x: 45, y: 15 }],
        description: {
          en: 'A shooting star streaked across the night sky.',
          'zh-CN': '夜空中划过了一道耀眼的流星。',
          'zh-TW': '夜空中劃過了一道耀眼的流星。',
        },
      },
      {
        type: 'movement',
        targetId: 'guitar',
        apply: (items) => items.map((it) => (it.id === 'guitar' ? { ...it, x: 22, y: 45 } : it)),
        description: {
          en: 'The guitar moved to lean against the tent entrance.',
          'zh-CN': '吉他被挪动靠在了帐篷门口。',
          'zh-TW': '吉他被挪動靠在了帳篷門口。',
        },
      },
    ],
  },
  {
    sceneType: 'city',
    sceneName: { en: 'Harbor Marina', 'zh-CN': '海港码头', 'zh-TW': '海港碼頭' },
    baseItems: [
      { id: 'lighthouse', name: 'Lighthouse', icon: '🗼', x: 20, y: 30 },
      { id: 'boat', name: 'Sailboat', icon: '⛵', x: 50, y: 48 },
      { id: 'seagull', name: 'Seagull', icon: '🕊️', x: 75, y: 20 },
      { id: 'anchor', name: 'Iron Anchor', icon: '⚓', x: 22, y: 70 },
      { id: 'sun', name: 'Setting Sun', icon: '🌅', x: 78, y: 40 },
      { id: 'fish', name: 'Fish Catch', icon: '🐟', x: 55, y: 72 },
      { id: 'wheel', name: 'Helm Wheel', icon: '☸️', x: 80, y: 70 },
    ],
    changes: [
      {
        type: 'rotation',
        targetId: 'anchor',
        apply: (items) => items.map((it) => (it.id === 'anchor' ? { ...it, rotation: 180 } : it)),
        description: {
          en: 'The ship anchor flipped upside down.',
          'zh-CN': '铁锚倒置翻转了180度。',
          'zh-TW': '鐵錨倒置翻轉了180度。',
        },
      },
      {
        type: 'movement',
        targetId: 'boat',
        apply: (items) => items.map((it) => (it.id === 'boat' ? { ...it, x: 70, y: 48 } : it)),
        description: {
          en: 'The sailboat sailed to the right.',
          'zh-CN': '帆船向右方航行了一大段距离。',
          'zh-TW': '帆船向右方航行了一大段距離。',
        },
      },
      {
        type: 'addition',
        targetId: 'dolphin',
        apply: (items) => [...items, { id: 'dolphin', name: 'Dolphin', icon: '🐬', x: 42, y: 60 }],
        description: {
          en: 'A dolphin leaped out from the harbor waters.',
          'zh-CN': '水面中跃出了一只欢快的海豚。',
          'zh-TW': '水面中躍出了一隻歡快的海豚。',
        },
      },
      {
        type: 'removal',
        targetId: 'seagull',
        apply: (items) => items.filter((it) => it.id !== 'seagull'),
        description: {
          en: 'The seagull in the sky vanished.',
          'zh-CN': '天空中的海鸥消失了。',
          'zh-TW': '天空中的海鷗消失了。',
        },
      },
    ],
  },
];

export function generateShiftChallenge(difficulty: number, rand = Math.random): ShiftChallenge {
  const diff = Math.max(1, Math.min(10, difficulty));
  const preset = shiftPresets[Math.floor(rand() * shiftPresets.length)];
  const changeChoice = preset.changes[Math.floor(rand() * preset.changes.length)];

  const sceneA = JSON.parse(JSON.stringify(preset.baseItems)) as ShiftItem[];
  const sceneB = changeChoice.apply(sceneA);

  return {
    id: `shift-${Date.now()}-${Math.floor(rand() * 10000)}`,
    mode: 'shift',
    skill: 'observation',
    difficulty: diff,
    timeLimit: Math.max(7, 18 - diff * 0.9),
    sceneType: preset.sceneType,
    sceneName: preset.sceneName,
    sceneA,
    sceneB,
    changedItemIds: [changeChoice.targetId],
    changeType: changeChoice.type,
    changeDescription: changeChoice.description,
    prompt: {
      en: 'Inspect Scene A, then observe Scene B. Tap what changed!',
      'zh-CN': '观察场景 A，随后对比场景 B。点击发生变化的位置！',
      'zh-TW': '觀察場景 A，隨後對比場景 B。點擊發生變化的位置！',
    },
  };
}

// ----------------------------------------------------
// 5. MASSIVE PERCEIVE SCENARIOS (20+ Context Anomaly Presets)
// ----------------------------------------------------
interface PerceivePreset {
  theme: 'kitchen' | 'bedroom' | 'library' | 'beach' | 'arctic' | 'space' | 'street' | 'laboratory';
  themeTitle: { en: string; 'zh-CN': string; 'zh-TW': string };
  difficulty: number;
  items: {
    id: string;
    name: { en: string; 'zh-CN': string; 'zh-TW': string };
    icon: string;
    x: number;
    y: number;
    isAnomaly: boolean;
    reason?: { en: string; 'zh-CN': string; 'zh-TW': string };
  }[];
  explanation: { en: string; 'zh-CN': string; 'zh-TW': string };
}

const perceivePresets: PerceivePreset[] = [
  {
    theme: 'kitchen',
    themeTitle: { en: 'Modern Kitchen', 'zh-CN': '现代厨房', 'zh-TW': '現代廚房' },
    difficulty: 2,
    items: [
      { id: 'fridge', name: { en: 'Refrigerator', 'zh-CN': '冰箱', 'zh-TW': '冰箱' }, icon: '🧊', x: 20, y: 35, isAnomaly: false },
      { id: 'stove', name: { en: 'Oven', 'zh-CN': '烤箱灶台', 'zh-TW': '烤箱灶台' }, icon: '🍳', x: 45, y: 40, isAnomaly: false },
      { id: 'plate', name: { en: 'Plate', 'zh-CN': '餐盘', 'zh-TW': '餐盤' }, icon: '🍽️', x: 68, y: 45, isAnomaly: false },
      { id: 'traffic_light', name: { en: 'Traffic Light', 'zh-CN': '交通红绿灯', 'zh-TW': '交通紅綠燈' }, icon: '🚦', x: 80, y: 25, isAnomaly: true },
      { id: 'fruit', name: { en: 'Fruit Basket', 'zh-CN': '水果篮', 'zh-TW': '水果籃' }, icon: '🍎', x: 30, y: 75, isAnomaly: false },
      { id: 'kettle', name: { en: 'Kettle', 'zh-CN': '水壶', 'zh-TW': '水壺' }, icon: '🫖', x: 75, y: 70, isAnomaly: false },
    ],
    explanation: {
      en: 'A traffic light belongs on streets and roads, not in a residential kitchen.',
      'zh-CN': '交通红绿灯属于市政道路设施，绝不应出现在家庭厨房中。',
      'zh-TW': '交通紅綠燈屬於市政道路設施，絕不應出現在家庭廚房中。',
    },
  },
  {
    theme: 'bedroom',
    themeTitle: { en: 'Cozy Bedroom', 'zh-CN': '温馨卧室', 'zh-TW': '溫馨臥室' },
    difficulty: 3,
    items: [
      { id: 'bed', name: { en: 'Bed', 'zh-CN': '大床', 'zh-TW': '大床' }, icon: '🛏️', x: 25, y: 45, isAnomaly: false },
      { id: 'lamp', name: { en: 'Bedside Lamp', 'zh-CN': '床头灯', 'zh-TW': '床頭燈' }, icon: '💡', x: 50, y: 35, isAnomaly: false },
      { id: 'wardrobe', name: { en: 'Wardrobe', 'zh-CN': '衣柜', 'zh-TW': '衣櫃' }, icon: '🚪', x: 75, y: 30, isAnomaly: false },
      { id: 'fish', name: { en: 'Deep Sea Fish', 'zh-CN': '深海鮟鱇鱼', 'zh-TW': '深海鮟鱇魚' }, icon: '🐟', x: 35, y: 75, isAnomaly: true },
      { id: 'slippers', name: { en: 'Slippers', 'zh-CN': '拖鞋', 'zh-TW': '拖鞋' }, icon: '🥿', x: 65, y: 75, isAnomaly: false },
      { id: 'alarm', name: { en: 'Alarm Clock', 'zh-CN': '闹钟', 'zh-TW': '鬧鐘' }, icon: '⏰', x: 18, y: 25, isAnomaly: false },
    ],
    explanation: {
      en: 'A swimming deep-sea fish cannot survive freely on a dry bedroom carpet.',
      'zh-CN': '游动的深海鱼无法在干燥的卧室地板上生存。',
      'zh-TW': '游動的深海魚無法在乾燥的臥室地板上生存。',
    },
  },
  {
    theme: 'library',
    themeTitle: { en: 'Quiet Library', 'zh-CN': '静谧图书馆', 'zh-TW': '靜謐圖書館' },
    difficulty: 4,
    items: [
      { id: 'bookshelf', name: { en: 'Bookshelf', 'zh-CN': '书架', 'zh-TW': '書架' }, icon: '📚', x: 22, y: 30, isAnomaly: false },
      { id: 'desk', name: { en: 'Study Desk', 'zh-CN': '书桌', 'zh-TW': '書桌' }, icon: '🪑', x: 50, y: 55, isAnomaly: false },
      { id: 'laptop', name: { en: 'Laptop', 'zh-CN': '笔记型电脑', 'zh-TW': '筆記型電腦' }, icon: '💻', x: 45, y: 40, isAnomaly: false },
      { id: 'glasses', name: { en: 'Reading Glasses', 'zh-CN': '阅读眼镜', 'zh-TW': '閱讀眼鏡' }, icon: '👓', x: 72, y: 40, isAnomaly: false },
      { id: 'campfire', name: { en: 'Blazing Campfire', 'zh-CN': '熊熊篝火', 'zh-TW': '熊熊篝火' }, icon: '🔥', x: 80, y: 70, isAnomaly: true },
      { id: 'plant', name: { en: 'Indoor Plant', 'zh-CN': '绿植', 'zh-TW': '綠植' }, icon: '🪴', x: 15, y: 70, isAnomaly: false },
    ],
    explanation: {
      en: 'An open blazing campfire is strictly hazardous and impossible inside a library.',
      'zh-CN': '图书馆内严禁明火，篝火在室内书架旁极度违和且危险。',
      'zh-TW': '圖書館內嚴禁明火，篝火在室內書架旁極度違和且危險。',
    },
  },
  {
    theme: 'beach',
    themeTitle: { en: 'Sunny Beach', 'zh-CN': '阳光海滩', 'zh-TW': '陽光海灘' },
    difficulty: 5,
    items: [
      { id: 'umbrella', name: { en: 'Sun Parasol', 'zh-CN': '遮阳伞', 'zh-TW': '遮陽傘' }, icon: '⛱️', x: 25, y: 35, isAnomaly: false },
      { id: 'sun', name: { en: 'Bright Sun', 'zh-CN': '艳阳', 'zh-TW': '艷陽' }, icon: '☀️', x: 80, y: 18, isAnomaly: false },
      { id: 'shell', name: { en: 'Sea Shell', 'zh-CN': '贝壳', 'zh-TW': '貝殼' }, icon: '🐚', x: 40, y: 75, isAnomaly: false },
      { id: 'surfboard', name: { en: 'Surfboard', 'zh-CN': '冲浪板', 'zh-TW': '衝浪板' }, icon: '🏄', x: 65, y: 45, isAnomaly: false },
      { id: 'snowman', name: { en: 'Snowman', 'zh-CN': '堆立的雪人', 'zh-TW': '堆立的雪人' }, icon: '⛄', x: 20, y: 70, isAnomaly: true },
      { id: 'drink', name: { en: 'Tropical Drink', 'zh-CN': '冷饮椰汁', 'zh-TW': '冷飲椰汁' }, icon: '🍹', x: 75, y: 72, isAnomaly: false },
    ],
    explanation: {
      en: 'A frozen snowman would instantly melt under scorching tropical beach sunshine.',
      'zh-CN': '雪人无法在高温酷热的热带沙滩上保持完整。',
      'zh-TW': '雪人無法在高溫酷熱的熱帶沙灘上保持完整。',
    },
  },
  {
    theme: 'space',
    themeTitle: { en: 'Space Orbit', 'zh-CN': '太空轨道', 'zh-TW': '太空軌道' },
    difficulty: 6,
    items: [
      { id: 'earth', name: { en: 'Earth', 'zh-CN': '地球', 'zh-TW': '地球' }, icon: '🌍', x: 25, y: 30, isAnomaly: false },
      { id: 'sat', name: { en: 'Satellite', 'zh-CN': '通讯卫星', 'zh-TW': '通訊衛星' }, icon: '🛰️', x: 65, y: 25, isAnomaly: false },
      { id: 'telescope', name: { en: 'Space Probe', 'zh-CN': '空间探测器', 'zh-TW': '空間探測器' }, icon: '🔭', x: 30, y: 70, isAnomaly: false },
      { id: 'kite', name: { en: 'Wind Kite', 'zh-CN': '放飞的风筝', 'zh-TW': '放飛的風箏' }, icon: '🪁', x: 78, y: 65, isAnomaly: true },
      { id: 'astronaut', name: { en: 'Astronaut', 'zh-CN': '航天员', 'zh-TW': '航天員' }, icon: '🧑‍🚀', x: 50, y: 55, isAnomaly: false },
      { id: 'star', name: { en: 'Cosmic Nebula', 'zh-CN': '星云', 'zh-TW': '星雲' }, icon: '✨', x: 80, y: 15, isAnomaly: false },
    ],
    explanation: {
      en: 'A wind kite requires atmospheric wind resistance and cannot fly in outer space vacuum.',
      'zh-CN': '风筝依靠大气风力浮空，在宇宙真空中无法飘飞。',
      'zh-TW': '風箏依靠大氣風力浮空，在宇宙真空中無法飄飛。',
    },
  },
  {
    theme: 'arctic',
    themeTitle: { en: 'Polar Iceberg', 'zh-CN': '极地冰川', 'zh-TW': '極地冰川' },
    difficulty: 6,
    items: [
      { id: 'iceberg', name: { en: 'Glacier', 'zh-CN': '冰山', 'zh-TW': '冰山' }, icon: '🏔️', x: 25, y: 35, isAnomaly: false },
      { id: 'penguin', name: { en: 'Penguin', 'zh-CN': '企鹅', 'zh-TW': '企鵝' }, icon: '🐧', x: 60, y: 65, isAnomaly: false },
      { id: 'seal', name: { en: 'Polar Seal', 'zh-CN': '海豹', 'zh-TW': '海豹' }, icon: '🦭', x: 25, y: 75, isAnomaly: false },
      { id: 'cactus', name: { en: 'Desert Saguaro', 'zh-CN': '沙漠仙人掌', 'zh-TW': '沙漠仙人掌' }, icon: '🌵', x: 78, y: 60, isAnomaly: true },
      { id: 'aurora', name: { en: 'Aurora Borealis', 'zh-CN': '极光', 'zh-TW': '極光' }, icon: '🌌', x: 50, y: 18, isAnomaly: false },
    ],
    explanation: {
      en: 'A desert succulent cactus cannot grow on subzero polar ice and permafrost.',
      'zh-CN': '热带干旱沙漠的仙人掌无法在极寒零下的极地冰原上存活生长。',
      'zh-TW': '熱帶乾旱沙漠的仙人掌無法在極寒零下的極地冰原上存活生長。',
    },
  },
  {
    theme: 'laboratory',
    themeTitle: { en: 'Hospital Surgery Room', 'zh-CN': '医院无菌手术室', 'zh-TW': '醫院無菌手術室' },
    difficulty: 7,
    items: [
      { id: 'light', name: { en: 'Surgical Lamp', 'zh-CN': '无影灯', 'zh-TW': '無影燈' }, icon: '💡', x: 50, y: 20, isAnomaly: false },
      { id: 'heart', name: { en: 'ECG Monitor', 'zh-CN': '心电监护仪', 'zh-TW': '心電監護儀' }, icon: '📈', x: 80, y: 40, isAnomaly: false },
      { id: 'mask', name: { en: 'Sterile Mask', 'zh-CN': '医用口罩', 'zh-TW': '醫用口罩' }, icon: '😷', x: 25, y: 35, isAnomaly: false },
      { id: 'chainsaw', name: { en: 'Rusty Chainsaw', 'zh-CN': '生锈电锯', 'zh-TW': '生鏽電鋸' }, icon: '🪚', x: 50, y: 65, isAnomaly: true },
      { id: 'bandage', name: { en: 'Sterile Gauze', 'zh-CN': '无菌纱布', 'zh-TW': '無菌紗布' }, icon: '🩹', x: 25, y: 70, isAnomaly: false },
    ],
    explanation: {
      en: 'A heavy industrial chainsaw violates every rule of sterile surgical medicine.',
      'zh-CN': '重型工业电锯极度不洁且危险，绝不可能作为无菌外科医疗器械。',
      'zh-TW': '重型工業電鋸極度不潔且危險，絕不可能作為無菌外科醫療器械。',
    },
  },
  {
    theme: 'street',
    themeTitle: { en: 'Underwater Coral Reef', 'zh-CN': '水下珊瑚礁', 'zh-TW': '水下珊瑚礁' },
    difficulty: 7,
    items: [
      { id: 'coral', name: { en: 'Coral Reef', 'zh-CN': '珊瑚', 'zh-TW': '珊瑚' }, icon: '🪸', x: 20, y: 60, isAnomaly: false },
      { id: 'fish1', name: { en: 'Tropical Fish', 'zh-CN': '热带鱼', 'zh-TW': '熱帶魚' }, icon: '🐠', x: 45, y: 35, isAnomaly: false },
      { id: 'octopus', name: { en: 'Octopus', 'zh-CN': '章鱼', 'zh-TW': '章魚' }, icon: '🐙', x: 75, y: 65, isAnomaly: false },
      { id: 'candle', name: { en: 'Lit Candle Flame', 'zh-CN': '点燃的蜡烛', 'zh-TW': '點燃的蠟燭' }, icon: '🕯️', x: 50, y: 70, isAnomaly: true },
      { id: 'bubbles', name: { en: 'Air Bubbles', 'zh-CN': '水下气泡', 'zh-TW': '水下氣泡' }, icon: '🫧', x: 25, y: 25, isAnomaly: false },
    ],
    explanation: {
      en: 'An open candle wick flame cannot burn while fully submerged underwater.',
      'zh-CN': '普通的蜡烛明火在完全浸没的海底深水中无法持续燃烧。',
      'zh-TW': '普通的蠟燭明火在完全浸沒的海底深水中無法持續燃燒。',
    },
  },
  {
    theme: 'street',
    themeTitle: { en: 'Medieval Castle Banquet', 'zh-CN': '中世纪城堡盛宴', 'zh-TW': '中世紀城堡盛宴' },
    difficulty: 8,
    items: [
      { id: 'goblet', name: { en: 'Silver Goblet', 'zh-CN': '银制酒杯', 'zh-TW': '銀製酒杯' }, icon: '🍷', x: 25, y: 45, isAnomaly: false },
      { id: 'roast', name: { en: 'Roast Feast', 'zh-CN': '烤肉盛宴', 'zh-TW': '烤肉盛宴' }, icon: '🍖', x: 50, y: 55, isAnomaly: false },
      { id: 'candle2', name: { en: 'Candelabra', 'zh-CN': '烛台', 'zh-TW': '燭台' }, icon: '🕯️', x: 75, y: 35, isAnomaly: false },
      { id: 'smartphone', name: { en: '5G Smartphone', 'zh-CN': '智能手机', 'zh-TW': '智能手機' }, icon: '📱', x: 45, y: 75, isAnomaly: true },
      { id: 'shield', name: { en: 'Heraldic Crest', 'zh-CN': '骑士盾徽', 'zh-TW': '騎士盾徽' }, icon: '🛡️', x: 20, y: 20, isAnomaly: false },
    ],
    explanation: {
      en: 'A modern touchscreen smartphone is anachronistic and did not exist in medieval times.',
      'zh-CN': '现代触屏智能手机属于21世纪高科技电子产品，与中世纪历史严重时代错乱。',
      'zh-TW': '現代觸屏智能手機屬於21世紀高科技電子產品，與中世紀歷史嚴重時代錯亂。',
    },
  },
  {
    theme: 'space',
    themeTitle: { en: 'Deep Underground Cave', 'zh-CN': '地底溶洞迷宫', 'zh-TW': '地底溶洞迷宮' },
    difficulty: 8,
    items: [
      { id: 'bat', name: { en: 'Cave Bat', 'zh-CN': '洞穴蝙蝠', 'zh-TW': '洞穴蝙蝠' }, icon: '🦇', x: 25, y: 25, isAnomaly: false },
      { id: 'stalagmite', name: { en: 'Stalagmites', 'zh-CN': '石笋钟乳石', 'zh-TW': '石筍鐘乳石' }, icon: '🪨', x: 20, y: 70, isAnomaly: false },
      { id: 'gem', name: { en: 'Glowing Crystal', 'zh-CN': '荧光矿石', 'zh-TW': '熒光礦石' }, icon: '💎', x: 75, y: 65, isAnomaly: false },
      { id: 'rainbow2', name: { en: 'Daylight Rainbow', 'zh-CN': '日光彩虹', 'zh-TW': '日光彩虹' }, icon: '🌈', x: 50, y: 30, isAnomaly: true },
      { id: 'flashlight', name: { en: 'Caver Torch', 'zh-CN': '探洞手电', 'zh-TW': '探洞手電' }, icon: '🔦', x: 55, y: 75, isAnomaly: false },
    ],
    explanation: {
      en: 'A rainbow requires direct atmospheric sunlight refraction and cannot form in pitch-black sealed caves.',
      'zh-CN': '彩虹需要太阳直射光照在水滴中发生色散折射，不可能出现在全封闭的黑暗地底洞穴中。',
      'zh-TW': '彩虹需要太陽直射光照在水滴中發生色散折射，不可能出現在全封閉的黑暗地底洞穴中。',
    },
  },
];

export function generatePerceiveChallenge(difficulty: number, rand = Math.random): PerceiveChallenge {
  const diff = Math.max(1, Math.min(10, difficulty));
  const preset = perceivePresets[Math.floor(rand() * perceivePresets.length)];
  const anomaly = preset.items.find((it) => it.isAnomaly)!;

  // Add random organic position shifts (+/- 3%) so items aren't on identical fixed coordinates
  const jitteredItems = preset.items.map((item) => ({
    ...item,
    x: Math.max(10, Math.min(85, item.x + (rand() * 6 - 3))),
    y: Math.max(15, Math.min(80, item.y + (rand() * 6 - 3))),
  }));

  return {
    id: `perceive-${Date.now()}-${Math.floor(rand() * 10000)}`,
    mode: 'perceive',
    skill: 'awareness',
    difficulty: Math.max(diff, preset.difficulty),
    timeLimit: Math.max(6, 16 - diff * 0.8),
    theme: preset.theme,
    themeTitle: preset.themeTitle,
    items: jitteredItems,
    anomalyId: anomaly.id,
    explanation: preset.explanation,
    prompt: {
      en: 'Something doesn’t belong in this context. Tap the anomaly!',
      'zh-CN': '场景中存在违背常理的反常物品。点击该异常项！',
      'zh-TW': '場景中存在違背常理的反常物品。點擊該異常項！',
    },
  };
}

// ----------------------------------------------------
// UNIFIED CHALLENGE DISPATCHER
// ----------------------------------------------------
export function generateChallengeByMode(mode: GameMode, difficulty: number, rand = Math.random): Challenge {
  switch (mode) {
    case 'notice':
      return generateNoticeChallenge(difficulty, rand);
    case 'remember':
      return generateRememberChallenge(difficulty, rand);
    case 'focus':
      return generateFocusChallenge(difficulty, rand);
    case 'shift':
      return generateShiftChallenge(difficulty, rand);
    case 'perceive':
      return generatePerceiveChallenge(difficulty, rand);
  }
}

// Deterministic Daily Challenge Generator: 10 Challenges
export function generateDailyChallenges(dateString: string): Challenge[] {
  const rand = createPrng(`perception-shift-${dateString}`);
  const modes: GameMode[] = [
    'notice',
    'remember',
    'focus',
    'shift',
    'notice',
    'remember',
    'focus',
    'shift',
    'perceive',
    'shift', // Final climax
  ];

  return modes.map((mode, index) => {
    const diff = Math.min(10, Math.floor((index + 1) * 0.9) + 2);
    const ch = generateChallengeByMode(mode, diff, rand);
    ch.id = `daily-${dateString}-${index + 1}`;
    return ch;
  });
}

// Standard Campaign Level Sequence (50 Stages)
export function generateCampaignChallenges(stage: number): Challenge[] {
  const stageModes: GameMode[] = ['notice', 'remember', 'focus', 'shift', 'perceive'];
  const mode = stageModes[(stage - 1) % stageModes.length];
  const difficulty = Math.min(10, Math.floor((stage - 1) / 5) + 1);
  return [generateChallengeByMode(mode, difficulty)];
}
