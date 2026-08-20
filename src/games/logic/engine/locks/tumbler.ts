import { Grade, HintPayload, TumblerClue, TumblerKey, TumblerPuzzle, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { shuffle } from '../rng';

const KEY_BANK: { label: string; symbol: string }[] = [
  { label: 'Brass', symbol: '🟫' },
  { label: 'Silver', symbol: '⬜' },
  { label: 'Gold', symbol: '🟨' },
  { label: 'Copper', symbol: '🟧' },
  { label: 'Iron', symbol: '⬛' },
  { label: 'Jade', symbol: '🟩' },
];

const GRADE_PARAMS: Record<Grade, { n: number; clueTypes: TumblerClue['type'][]; attempts: number; timeLimitSec: number }> = {
  brass: { n: 3, clueTypes: ['negation', 'direct'], attempts: 3, timeLimitSec: 120 },
  steel: { n: 4, clueTypes: ['negation', 'adjacency', 'direct'], attempts: 2, timeLimitSec: 150 },
  titanium: { n: 4, clueTypes: ['negation', 'adjacency', 'order', 'parityOdd', 'parityEven'], attempts: 2, timeLimitSec: 180 },
  obsidian: { n: 5, clueTypes: ['negation', 'adjacency', 'order', 'parityOdd', 'parityEven'], attempts: 1, timeLimitSec: 210 },
};

// A clue as a predicate over a full assignment (assignment[slot] = keyId)
interface EvalClue extends TumblerClue {
  test: (assignment: string[], posOf: Map<string, number>) => boolean;
}

function buildCandidateClues(keys: TumblerKey[], n: number, allowedTypes: TumblerClue['type'][]): EvalClue[] {
  const candidates: EvalClue[] = [];
  for (const k of keys) {
    if (allowedTypes.includes('negation')) {
      for (let s = 0; s < n; s++) {
        candidates.push({
          type: 'negation',
          key: k.label,
          slot: s + 1,
          test: (_a, posOf) => posOf.get(k.id) !== s,
        });
      }
    }
    if (allowedTypes.includes('direct')) {
      for (let s = 0; s < n; s++) {
        candidates.push({
          type: 'direct',
          key: k.label,
          slot: s + 1,
          test: (_a, posOf) => posOf.get(k.id) === s,
        });
      }
    }
    if (allowedTypes.includes('parityOdd')) {
      candidates.push({
        type: 'parityOdd',
        key: k.label,
        test: (_a, posOf) => (posOf.get(k.id)! + 1) % 2 === 1,
      });
    }
    if (allowedTypes.includes('parityEven')) {
      candidates.push({
        type: 'parityEven',
        key: k.label,
        test: (_a, posOf) => (posOf.get(k.id)! + 1) % 2 === 0,
      });
    }
  }
  if (allowedTypes.includes('adjacency')) {
    for (const a of keys) {
      for (const b of keys) {
        if (a.id === b.id) continue;
        candidates.push({
          type: 'adjacency',
          key: a.label,
          key2: b.label,
          test: (_asgn, posOf) => posOf.get(b.id) === posOf.get(a.id)! + 1,
        });
      }
    }
  }
  if (allowedTypes.includes('order')) {
    for (const a of keys) {
      for (const b of keys) {
        if (a.id === b.id) continue;
        candidates.push({
          type: 'order',
          key: a.label,
          key2: b.label,
          test: (_asgn, posOf) => posOf.get(a.id)! < posOf.get(b.id)!,
        });
      }
    }
  }
  return candidates;
}

function permutations(ids: string[]): string[][] {
  if (ids.length <= 1) return [ids];
  const result: string[][] = [];
  for (let i = 0; i < ids.length; i++) {
    const rest = [...ids.slice(0, i), ...ids.slice(i + 1)];
    for (const p of permutations(rest)) result.push([ids[i], ...p]);
  }
  return result;
}

function countSolutions(keyIds: string[], clues: EvalClue[], cap = 2): string[][] {
  const solutions: string[][] = [];
  for (const assignment of permutations(keyIds)) {
    const posOf = new Map(assignment.map((id, slot) => [id, slot]));
    if (clues.every((c) => c.test(assignment, posOf))) {
      solutions.push(assignment);
      if (solutions.length >= cap) break;
    }
  }
  return solutions;
}

export const tumblerEngine: PuzzleEngine<TumblerPuzzle, string[]> = {
  type: 'tumbler',
  skill: 'deduction',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    const keys: TumblerKey[] = KEY_BANK.slice(0, params.n).map((k, i) => ({ id: `key-${i}`, label: k.label, symbol: k.symbol }));
    const keyIds = keys.map((k) => k.id);
    const shuffledIds = shuffle(rand, keyIds);
    const solution = shuffledIds; // solution[slot] = keyId

    const candidates = shuffle(rand, buildCandidateClues(keys, params.n, params.clueTypes));
    const trueClues = candidates.filter((c) => {
      const posOf = new Map(solution.map((id, slot) => [id, slot]));
      return c.test(solution, posOf);
    });

    // Greedily minimize while a unique solution is maintained.
    let working = [...trueClues];
    for (let i = 0; i < working.length; ) {
      const trial = working.filter((_, idx) => idx !== i);
      if (countSolutions(keyIds, trial, 2).length === 1) {
        working = trial;
      } else {
        i++;
      }
    }
    // Safety net: ensure uniqueness; if not unique, add clues back until it is.
    while (countSolutions(keyIds, working, 2).length !== 1 && working.length < trueClues.length) {
      const missing = trueClues.find((c) => !working.includes(c));
      if (!missing) break;
      working.push(missing);
    }

    const clues: TumblerClue[] = shuffle(rand, working).map(({ test, ...rest }) => rest);

    return {
      id: `tumbler-${seed}`,
      type: 'tumbler',
      grade,
      seed,
      timeLimitSec: params.timeLimitSec,
      attempts: params.attempts,
      n: params.n,
      keys,
      clues,
      solution,
    };
  },

  validate(puzzle, answer): ValidationResult {
    const correctCount = answer.reduce((sum, keyId, slot) => sum + (keyId === puzzle.solution[slot] ? 1 : 0), 0);
    return { correct: correctCount === puzzle.n, extra: { correctCount } };
  },

  getHint(puzzle, tier): HintPayload {
    if (tier === 1) {
      const idx = 0;
      return { text: `Slot ${idx + 1} holds a key whose label starts with "${puzzle.keys.find((k) => k.id === puzzle.solution[idx])!.label[0]}".` };
    }
    const idx = Math.floor(puzzle.n / 2);
    const key = puzzle.keys.find((k) => k.id === puzzle.solution[idx])!;
    return { text: `Slot ${idx + 1} holds ${key.label}.`, reveal: { slot: idx, keyId: key.id } };
  },

  describeSolution(puzzle) {
    const order = puzzle.solution.map((id) => puzzle.keys.find((k) => k.id === id)!.label).join(' -> ');
    return `Correct order (slot 1 to ${puzzle.n}): ${order}.`;
  },
};

registerEngine(tumblerEngine);
