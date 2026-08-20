import { HeistDefinition } from '../types';

export const HEISTS: HeistDefinition[] = [
  { id: 'pawn-shop', name: 'Pawn Shop Safe', emoji: '🏚️', gradeOffset: -1, recipe: ['keypad', 'tumbler', 'combination', 'keypad'] },
  { id: 'back-alley', name: 'Back Alley Stash', emoji: '🚪', gradeOffset: -1, recipe: ['circuit', 'combination', 'keypad', 'tumbler'] },
  { id: 'midtown-bank', name: 'Midtown Bank Deposit', emoji: '🏦', gradeOffset: 0, recipe: ['tumbler', 'circuit', 'laser', 'combination'] },
  { id: 'casino-cage', name: 'Casino Cage', emoji: '🎰', gradeOffset: 0, recipe: ['combination', 'rulesnap', 'circuit', 'keypad', 'tumbler'] },
  { id: 'diamond-district', name: 'Diamond District', emoji: '💎', gradeOffset: 0, recipe: ['laser', 'tumbler', 'circuit', 'rulesnap'] },
  { id: 'federal-annex', name: 'Federal Reserve Annex', emoji: '🏛️', gradeOffset: 1, recipe: ['circuit', 'laser', 'combination', 'rulesnap', 'tumbler'] },
  { id: 'underground-archive', name: 'The Underground Archive', emoji: '🗄️', gradeOffset: 1, recipe: ['rulesnap', 'laser', 'circuit', 'tumbler', 'keypad', 'combination'] },
  { id: 'obsidian-vault', name: 'The Obsidian Vault', emoji: '🖤', gradeOffset: 2, recipe: ['laser', 'circuit', 'rulesnap', 'tumbler', 'combination', 'keypad'] },
];
