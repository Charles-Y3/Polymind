import type { BaseLockPuzzle, Grade, HintPayload, LockType, SkillAxis, ValidationResult } from '../types';

export interface PuzzleEngine<P extends BaseLockPuzzle = BaseLockPuzzle, A = unknown> {
  type: LockType;
  skill: SkillAxis;
  generate(grade: Grade, rng: () => number, seed: string): P;
  validate(puzzle: P, answer: A): ValidationResult;
  getHint(puzzle: P, tier: 1 | 2): HintPayload;
  describeSolution(puzzle: P): string;
}

// Populated by engine/locks/index.ts to avoid a circular import between
// registry.ts and the individual lock engines.
export const ENGINES: Partial<Record<LockType, PuzzleEngine<any, any>>> = {};

export function registerEngine(engine: PuzzleEngine<any, any>) {
  ENGINES[engine.type] = engine;
}

export function getEngine(type: LockType): PuzzleEngine<any, any> {
  const engine = ENGINES[type];
  if (!engine) throw new Error(`No engine registered for lock type: ${type}`);
  return engine;
}

export function generateLock(type: LockType, grade: Grade, seed: string, rng: () => number) {
  return getEngine(type).generate(grade, rng, seed);
}
