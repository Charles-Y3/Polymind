import type { Grade, LockType } from '../types';

export const GRADE_MULT: Record<Grade, number> = {
  brass: 1.0,
  steel: 1.5,
  titanium: 2.5,
  obsidian: 4.0,
};

export const ALARM_COST: Record<Grade, number> = {
  brass: 20,
  steel: 25,
  titanium: 33,
  obsidian: 50,
};

export const LOCKPICK_ALLOWANCE: Record<Grade, number> = {
  brass: 3,
  steel: 2,
  titanium: 1,
  obsidian: 0,
};

export const BASE_SCORE: Record<LockType, number> = {
  keypad: 120,
  tumbler: 180,
  circuit: 160,
  combination: 140,
  laser: 170,
  rulesnap: 150,
};

export interface ScoreInputs {
  type: LockType;
  grade: Grade;
  timeLimitSec: number;
  timeTakenSec: number;
  hintsUsed: number;
  wastedAttempts: number;
  streak: number; // consecutive clean cracks so far, before this one
  modeMult?: number; // practice = 0.25, gauntlet depth bonus, etc
}

export function computeScore(input: ScoreInputs): number {
  const base = BASE_SCORE[input.type];
  const gradeMult = GRADE_MULT[input.grade];
  const timeRatio = Math.max(0, Math.min(1, 1 - input.timeTakenSec / Math.max(1, input.timeLimitSec)));
  const timeBonus = 0.5 + timeRatio * 1.0; // 0.5 - 1.5
  const streakMult = Math.min(2.0, 1 + input.streak * 0.1);
  let score = base * gradeMult * timeBonus * streakMult * (input.modeMult ?? 1);
  score *= Math.max(0, 1 - input.hintsUsed * 0.25);
  score *= Math.max(0, 1 - input.wastedAttempts * 0.1);
  return Math.max(0, Math.round(score));
}

export function updateAxis(current: number, performance: number, weight = 0.15): number {
  const clampedPerf = Math.max(0, Math.min(100, performance));
  return Math.round(Math.max(0, Math.min(100, current * (1 - weight) + clampedPerf * weight)));
}

export function performanceScore(cracked: boolean, grade: Grade, hintsUsed: number): number {
  if (!cracked) return 25;
  const gradeBonus = { brass: 0, steel: 8, titanium: 16, obsidian: 24 }[grade];
  return Math.max(30, Math.min(100, 70 + gradeBonus - hintsUsed * 10));
}
