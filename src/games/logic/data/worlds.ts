import { WorldInfo, WorldId } from '../types';

export const WORLDS_DATA: WorldInfo[] = [
  {
    id: 1,
    title: 'World 1: Simple Machines',
    subtitle: 'Obvious Transformations',
    icon: '⚙️',
    description: 'Learn fundamental machine mechanics with direct mathematical and visual operations.',
    primaryMode: 'choose',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 2,
    title: 'World 2: Pattern Machines',
    subtitle: 'Sequences & Rates',
    icon: '📈',
    description: 'Discover arithmetic, geometric, and accelerating numeric and spatial progressions.',
    primaryMode: 'enter',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 3,
    title: 'World 3: Shape Machines',
    subtitle: 'Symbolic Geometry',
    icon: '🔷',
    description: 'Numbers disappear! Manipulate rotations, colors, mirrors, and spatial rearrangements.',
    primaryMode: 'choose',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 4,
    title: 'World 4: Combination Machines',
    subtitle: 'Multi-Stage Logic',
    icon: '🔧',
    description: 'The machine executes multiple steps in sequence. Order of operations becomes critical!',
    primaryMode: 'build',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 5,
    title: 'World 5: Conditional Machines',
    subtitle: 'If / Then Logic',
    icon: '🔀',
    description: 'The machine branches behavior depending on input parity, size, or symbol properties.',
    primaryMode: 'choose',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 6,
    title: 'World 6: Hidden Logic',
    subtitle: 'Complex Decision Trees',
    icon: '🧩',
    description: 'Formulate deeper hypotheses for intricate multi-conditional rules.',
    primaryMode: 'build',
    color: 'from-fuchsia-500 to-purple-700',
  },
  {
    id: 7,
    title: 'World 7: Nested Machines',
    subtitle: 'Pipeline Architecture',
    icon: '🔗',
    description: 'Machines connected inside machines. Trace signals through multi-component pipelines.',
    primaryMode: 'discover',
    color: 'from-blue-600 to-indigo-800',
  },
  {
    id: 8,
    title: 'World 8: The Impossible Machine',
    subtitle: 'Ambiguity & Hypothesis Testing',
    icon: '🧪',
    description: 'Multiple candidate rules fit existing clues. Design crucial test inputs to isolate the truth.',
    primaryMode: 'discover',
    color: 'from-amber-600 to-red-700',
  },
];

export function getWorldInfo(worldId: WorldId): WorldInfo {
  return WORLDS_DATA.find((w) => w.id === worldId) || WORLDS_DATA[0];
}
