import {lazy} from 'react';
import type {ComponentType} from 'react';
import type {Accent} from '../ui/types';

export type GameId = 'reflexes' | 'recall' | 'logic' | 'awareness';

export interface GameManifestEntry {
  id: GameId;
  name: string;
  faculty: string;
  tagline: string;
  path: string;
  accent: Accent;
  emoji: string;
  Component: ComponentType;
}

export const GAMES: GameManifestEntry[] = [
  {
    id: 'reflexes',
    name: 'Gravity Tilt',
    faculty: 'Reflexes',
    tagline: 'Coordination, reaction, spatial control',
    path: '/reflexes',
    accent: {from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-300', ring: 'ring-cyan-500/40'},
    emoji: '⚡',
    Component: lazy(() => import('../games/reflexes/App')),
  },
  {
    id: 'recall',
    name: 'Choice Clash',
    faculty: 'Recall',
    tagline: 'Memory, knowledge, recognition',
    path: '/recall',
    accent: {from: 'from-amber-500', to: 'to-orange-600', text: 'text-amber-300', ring: 'ring-amber-500/40'},
    emoji: '📚',
    Component: lazy(() => import('../games/recall/App')),
  },
  {
    id: 'logic',
    name: 'Logic Lock',
    faculty: 'Logic',
    tagline: 'Deduction, pattern recognition, analysis',
    path: '/logic',
    accent: {from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40'},
    emoji: '🧠',
    Component: lazy(() => import('../games/logic/App')),
  },
  {
    id: 'awareness',
    name: 'Spot Rush',
    faculty: 'Awareness',
    tagline: 'Perception, focus, anomaly spotting',
    path: '/awareness',
    accent: {from: 'from-fuchsia-500', to: 'to-pink-600', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/40'},
    emoji: '👁️',
    Component: lazy(() => import('../games/awareness/App')),
  },
];

export function getGame(id: GameId): GameManifestEntry {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game id: ${id}`);
  return game;
}
