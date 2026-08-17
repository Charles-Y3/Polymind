import { PowerUpType } from '../types';

export interface StarterPowerUpConfig {
  stageId: number;
  stageTitle: string;
  type: PowerUpType;
  label: string;
  description: string;
  color: string;
}

export const STARTER_POWERUPS: StarterPowerUpConfig[] = [
  {
    stageId: 1,
    stageTitle: 'Stage 1',
    type: 'shield',
    label: 'Shield',
    description: 'Kinetic aura shielding the ball from initial impacts',
    color: 'cyan',
  },
  {
    stageId: 2,
    stageTitle: 'Stage 2',
    type: 'anchor',
    label: 'Anchor',
    description: 'Heavy dense ball with increased momentum resistance',
    color: 'amber',
  },
  {
    stageId: 3,
    stageTitle: 'Stage 3',
    type: 'magnet',
    label: 'Magnet',
    description: 'Magnetic field pulling stars and items toward you',
    color: 'purple',
  },
  {
    stageId: 4,
    stageTitle: 'Stage 4',
    type: 'slow_mo',
    label: 'Slow-Mo',
    description: 'Time-dilation matrix slowing incoming hazard speed',
    color: 'sky',
  },
  {
    stageId: 5,
    stageTitle: 'Stage 5',
    type: 'score_multiplier',
    label: '2x Score',
    description: 'Overclocked telemetry doubling all point multipliers',
    color: 'yellow',
  },
  {
    stageId: 6,
    stageTitle: 'Stage 6',
    type: 'safety_net',
    label: 'Safety Net',
    description: 'Protective elastic perimeter net guarding drop-off edges',
    color: 'emerald',
  },
];

export function getUnlockedStarterPowerUps(starsEarned: Record<number, number> = {}): PowerUpType[] {
  return STARTER_POWERUPS
    .filter((item) => (starsEarned[item.stageId] || 0) >= 3)
    .map((item) => item.type);
}
