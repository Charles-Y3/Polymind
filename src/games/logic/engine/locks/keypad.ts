import { Grade, HintPayload, KeypadPuzzle, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { randInt, randomSeed } from '../rng';

interface RuleFamily {
  id: string;
  minGrade: Grade;
  build(rand: () => number): { next: (i: number) => number; label: string };
}

const GRADE_ORDER: Grade[] = ['brass', 'steel', 'titanium', 'obsidian'];
const gradeIndex = (g: Grade) => GRADE_ORDER.indexOf(g);

function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((s, d) => s + Number(d), 0);
}

const FAMILIES: RuleFamily[] = [
  {
    id: 'arithmetic',
    minGrade: 'brass',
    build: (rand) => {
      const a0 = randInt(rand, 1, 12);
      const d = randInt(rand, 2, 9);
      return { next: (i) => a0 + i * d, label: `start ${a0}, add ${d} each step` };
    },
  },
  {
    id: 'geometric',
    minGrade: 'brass',
    build: (rand) => {
      const a0 = randInt(rand, 1, 5);
      const r = randInt(rand, 2, 3);
      return { next: (i) => a0 * Math.pow(r, i), label: `start ${a0}, multiply by ${r} each step` };
    },
  },
  {
    id: 'secondDiff',
    minGrade: 'steel',
    build: (rand) => {
      const a0 = randInt(rand, 1, 10);
      const d0 = randInt(rand, 1, 4);
      const e = randInt(rand, 1, 3);
      return {
        next: (i) => {
          let val = a0;
          let d = d0;
          for (let k = 0; k < i; k++) {
            val += d;
            d += e;
          }
          return val;
        },
        label: `step grows by ${e} each time`,
      };
    },
  },
  {
    id: 'alternating',
    minGrade: 'steel',
    build: (rand) => {
      const a0 = randInt(rand, 1, 10);
      const dA = randInt(rand, 2, 6);
      const b0 = randInt(rand, 10, 25);
      const dB = -randInt(rand, 2, 6);
      return {
        next: (i) => (i % 2 === 0 ? a0 + (i / 2) * dA : b0 + ((i - 1) / 2) * dB),
        label: 'two interleaved sequences at odd/even positions',
      };
    },
  },
  {
    id: 'fibonacciLike',
    minGrade: 'titanium',
    build: (rand) => {
      const a0 = randInt(rand, 1, 5);
      const a1 = randInt(rand, 2, 7);
      const cache = new Map<number, number>([[0, a0], [1, a1]]);
      const next = (i: number): number => {
        if (cache.has(i)) return cache.get(i)!;
        const val = next(i - 1) + next(i - 2);
        cache.set(i, val);
        return val;
      };
      return { next, label: 'each term is the sum of the previous two' };
    },
  },
  {
    id: 'digitSumRecurrence',
    minGrade: 'titanium',
    build: (rand) => {
      const a0 = randInt(rand, 8, 30);
      const cache = new Map<number, number>([[0, a0]]);
      const next = (i: number): number => {
        if (cache.has(i)) return cache.get(i)!;
        const prev = next(i - 1);
        const val = prev + digitSum(prev);
        cache.set(i, val);
        return val;
      };
      return { next, label: 'each term adds the digit-sum of the previous term' };
    },
  },
  {
    id: 'quadratic',
    minGrade: 'obsidian',
    build: (rand) => {
      const a = randInt(rand, 1, 3);
      const b = randInt(rand, -4, 4);
      const c = randInt(rand, 1, 10);
      return { next: (i) => a * i * i + b * i + c, label: `quadratic index formula (a=${a}, b=${b}, c=${c})` };
    },
  },
];

function availableFamilies(grade: Grade): RuleFamily[] {
  return FAMILIES.filter((f) => gradeIndex(f.minGrade) <= gradeIndex(grade));
}

const GRADE_PARAMS: Record<Grade, { shown: number; predict: number; attempts: number; timeLimitSec: number }> = {
  brass: { shown: 5, predict: 1, attempts: 3, timeLimitSec: 90 },
  steel: { shown: 5, predict: 1, attempts: 3, timeLimitSec: 75 },
  titanium: { shown: 6, predict: 2, attempts: 2, timeLimitSec: 60 },
  obsidian: { shown: 7, predict: 2, attempts: 2, timeLimitSec: 50 },
};

// Rejects a candidate whose shown prefix could plausibly continue a different
// way under a simpler (arithmetic/geometric) rule than the one that generated it.
function isAmbiguous(shown: number[], trueNext: number[], familyId: string): boolean {
  if (shown.length < 3) return false;
  if (familyId !== 'arithmetic') {
    const d = shown[1] - shown[0];
    const allConstDiff = shown.every((v, idx) => idx === 0 || v - shown[idx - 1] === d);
    if (allConstDiff) {
      const rivalNext = trueNext.map((_, k) => shown[shown.length - 1] + d * (k + 1));
      if (rivalNext.some((v, k) => v !== trueNext[k])) return true;
    }
  }
  if (familyId !== 'geometric' && shown[0] !== 0) {
    const r = shown[1] / shown[0];
    const allConstRatio = shown.every((v, idx) => idx === 0 || Math.abs(v / shown[idx - 1] - r) < 1e-9);
    if (allConstRatio) {
      const rivalNext = trueNext.map((_, k) => shown[shown.length - 1] * Math.pow(r, k + 1));
      if (rivalNext.some((v, k) => Math.abs(v - trueNext[k]) > 1e-6)) return true;
    }
  }
  return false;
}

export const keypadEngine: PuzzleEngine<KeypadPuzzle, number[]> = {
  type: 'keypad',
  skill: 'patternRecognition',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    const pool = availableFamilies(grade);
    let shown: number[] = [];
    let predicted: number[] = [];
    let ruleLabel = '';
    let next: (i: number) => number = () => 0;

    for (let attempt = 0; attempt < 30; attempt++) {
      const family = pool[Math.floor(rand() * pool.length)];
      const built = family.build(rand);
      const s = Array.from({ length: params.shown }, (_, i) => built.next(i));
      const p = Array.from({ length: params.predict }, (_, i) => built.next(params.shown + i));
      if (s.some((v) => !Number.isFinite(v) || Math.abs(v) > 999999)) continue;
      if (!isAmbiguous(s, p, family.id)) {
        shown = s;
        predicted = p;
        ruleLabel = built.label;
        next = built.next;
        break;
      }
    }
    if (shown.length === 0) {
      // fallback: plain arithmetic always terminates the loop above
      const a0 = randInt(rand, 1, 12);
      const d = randInt(rand, 2, 9);
      next = (i) => a0 + i * d;
      shown = Array.from({ length: params.shown }, (_, i) => next(i));
      predicted = Array.from({ length: params.predict }, (_, i) => next(params.shown + i));
      ruleLabel = `start ${a0}, add ${d} each step`;
    }

    return {
      id: `keypad-${seed}`,
      type: 'keypad',
      grade,
      seed,
      timeLimitSec: params.timeLimitSec,
      attempts: params.attempts,
      shown,
      predictCount: params.predict,
      ruleLabel,
      next,
    };
  },

  validate(puzzle, answer): ValidationResult {
    const expected = Array.from({ length: puzzle.predictCount }, (_, i) => puzzle.next(puzzle.shown.length + i));
    const correct = answer.length === expected.length && answer.every((v, i) => v === expected[i]);
    return { correct };
  },

  getHint(puzzle, tier): HintPayload {
    if (tier === 1) {
      const diffs = puzzle.shown.slice(1).map((v, i) => v - puzzle.shown[i]);
      return { text: `Differences between shown terms: ${diffs.join(', ')}`, reveal: diffs };
    }
    const firstNext = puzzle.next(puzzle.shown.length);
    return { text: `The first missing term is ${firstNext}.`, reveal: firstNext };
  },

  describeSolution(puzzle) {
    return `Sequence rule: ${puzzle.ruleLabel}. Shown: [${puzzle.shown.join(', ')}].`;
  },
};

registerEngine(keypadEngine);

export function generateKeypadSeed(): string {
  return randomSeed();
}
