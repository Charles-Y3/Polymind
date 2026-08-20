import { CombinationPuzzle, Grade, HintPayload, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { randInt } from '../rng';

const SYMBOL_POOL = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '⚫'];

const GRADE_PARAMS: Record<Grade, { length: number; symbolCount: number; duplicates: boolean; maxGuesses: number; timeLimitSec: number }> = {
  brass: { length: 3, symbolCount: 5, duplicates: false, maxGuesses: 8, timeLimitSec: 150 },
  steel: { length: 4, symbolCount: 6, duplicates: false, maxGuesses: 8, timeLimitSec: 150 },
  titanium: { length: 4, symbolCount: 7, duplicates: true, maxGuesses: 7, timeLimitSec: 180 },
  obsidian: { length: 5, symbolCount: 8, duplicates: true, maxGuesses: 6, timeLimitSec: 180 },
};

export function scoreGuess(code: string[], guess: string[]): { exact: number; partial: number } {
  const codeLeft: string[] = [];
  const guessLeft: string[] = [];
  let exact = 0;
  for (let i = 0; i < code.length; i++) {
    if (guess[i] === code[i]) {
      exact++;
    } else {
      codeLeft.push(code[i]);
      guessLeft.push(guess[i]);
    }
  }
  let partial = 0;
  const used = new Array(codeLeft.length).fill(false);
  for (const g of guessLeft) {
    const idx = codeLeft.findIndex((c, i) => !used[i] && c === g);
    if (idx !== -1) {
      used[idx] = true;
      partial++;
    }
  }
  return { exact, partial };
}

export const combinationEngine: PuzzleEngine<CombinationPuzzle, string[]> = {
  type: 'combination',
  skill: 'hypothesisTesting',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    const symbols = SYMBOL_POOL.slice(0, params.symbolCount);
    const code: string[] = [];
    for (let i = 0; i < params.length; i++) {
      let sym: string;
      do {
        sym = symbols[Math.floor(rand() * symbols.length)];
      } while (!params.duplicates && code.includes(sym));
      code.push(sym);
    }

    return {
      id: `combination-${seed}`,
      type: 'combination',
      grade,
      seed,
      timeLimitSec: params.timeLimitSec,
      attempts: params.maxGuesses,
      length: params.length,
      symbols,
      code,
      maxGuesses: params.maxGuesses,
    };
  },

  validate(puzzle, answer): ValidationResult {
    const { exact, partial } = scoreGuess(puzzle.code, answer);
    return { correct: exact === puzzle.length, extra: { exact, partial } };
  },

  getHint(puzzle, tier): HintPayload {
    if (tier === 1) {
      const idx = randInt(() => Math.random(), 0, puzzle.length - 1);
      return { text: `Position ${idx + 1} is ${puzzle.code[idx]}.`, reveal: { index: idx, symbol: puzzle.code[idx] } };
    }
    return { text: `First two positions: ${puzzle.code[0]} ${puzzle.code[1] ?? ''}.`, reveal: puzzle.code.slice(0, 2) };
  },

  describeSolution(puzzle) {
    return `The code is: ${puzzle.code.join(' ')}.`;
  },
};

registerEngine(combinationEngine);
