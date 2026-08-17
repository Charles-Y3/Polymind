import { CategoryId } from '../types';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  nameZhSimp: string;
  nameZhTrad: string;
  emoji: string;
  description: string;
  descriptionZhSimp: string;
  descriptionZhTrad: string;
  color: string;
  bgGradient: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'mixed',
    name: 'Mixed Knowledge',
    nameZhSimp: '综合知识',
    nameZhTrad: '綜合知識',
    emoji: '🧠',
    description: 'A exciting blend of facts from all categories!',
    descriptionZhSimp: '来自所有领域的精彩随机对比！',
    descriptionZhTrad: '來自所有領域的精彩隨機對比！',
    color: 'border-purple-500 text-purple-600',
    bgGradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'space',
    name: 'Space & Cosmos',
    nameZhSimp: '太空与宇宙',
    nameZhTrad: '太空與宇宙',
    emoji: '🚀',
    description: 'Planets, stars, cosmic distances, and black holes.',
    descriptionZhSimp: '行星、恒星、宇宙距离与黑洞。',
    descriptionZhTrad: '行星、恆星、宇宙距離與黑洞。',
    color: 'border-indigo-500 text-indigo-600',
    bgGradient: 'from-slate-800 to-indigo-900',
  },
  {
    id: 'animals',
    name: 'Animals & Wildlife',
    nameZhSimp: '动物与自然',
    nameZhTrad: '動物與自然',
    emoji: '🐘',
    description: 'Sizes, speeds, lifespans, and wild creature records.',
    descriptionZhSimp: '体型、速度、寿命与神奇野生动物记录。',
    descriptionZhTrad: '體型、速度、壽命與神奇野生動物記錄。',
    color: 'border-emerald-500 text-emerald-600',
    bgGradient: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'world',
    name: 'World & Geography',
    nameZhSimp: '世界与地理',
    nameZhTrad: '世界與地理',
    emoji: '🌍',
    description: 'Landmarks, country areas, populations, and oceans.',
    descriptionZhSimp: '地标、国家面积、人口与名胜海洋。',
    descriptionZhTrad: '地標、國家面積、人口與名勝海洋。',
    color: 'border-blue-500 text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'science',
    name: 'Science & Physics',
    nameZhSimp: '科学与物理',
    nameZhTrad: '科學與物理',
    emoji: '🔬',
    description: 'Temperatures, speeds, energy, and fundamental elements.',
    descriptionZhSimp: '温度、速度、能量与物质微观世界。',
    descriptionZhTrad: '溫度、速度、能量與物質微觀世界。',
    color: 'border-amber-500 text-amber-600',
    bgGradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'history',
    name: 'History & Civilizations',
    nameZhSimp: '历史与文明',
    nameZhTrad: '歷史與文明',
    emoji: '🏛',
    description: 'Which came first? Ancient empires, inventions, and events.',
    descriptionZhSimp: '哪个更古老？古代帝国、重大发明与历史纪元。',
    descriptionZhTrad: '哪個更古老？古代帝國、重大發明與歷史紀元。',
    color: 'border-rose-500 text-rose-600',
    bgGradient: 'from-rose-500 to-red-700',
  },
  {
    id: 'nature',
    name: 'Ecosystems & Nature',
    nameZhSimp: '自然与生态',
    nameZhTrad: '自然與生態',
    emoji: '🌿',
    description: 'Trees, mountains, rainforests, and natural wonders.',
    descriptionZhSimp: '巨木、雄伟山峰、雨林与自然奇观。',
    descriptionZhTrad: '巨木、雄偉山峰、雨林與自然奇觀。',
    color: 'border-green-600 text-green-700',
    bgGradient: 'from-green-600 to-emerald-800',
  },
  {
    id: 'human_body',
    name: 'Human Body',
    nameZhSimp: '人体奥秘',
    nameZhTrad: '人體奧秘',
    emoji: '👤',
    description: 'Bones, blood vessels, organs, and biological marvels.',
    descriptionZhSimp: '骨骼、血管、器官尺寸与神奇生理结构。',
    descriptionZhTrad: '骨骼、血管、器官尺寸與神奇生理結構。',
    color: 'border-pink-500 text-pink-600',
    bgGradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'everyday',
    name: 'Everyday & Culture',
    nameZhSimp: '生活与文化',
    nameZhTrad: '生活與文化',
    emoji: '🍎',
    description: 'Surprising everyday metrics, food calories, and common items.',
    descriptionZhSimp: '生活常识对比、卡路里与出人意料的日常物品。',
    descriptionZhTrad: '生活常識對比、卡路里與出人意料的日常物品。',
    color: 'border-yellow-500 text-yellow-600',
    bgGradient: 'from-yellow-500 to-amber-600',
  },
];
