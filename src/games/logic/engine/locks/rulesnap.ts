import { Grade, HintPayload, RuleSnapCard, RuleSnapPuzzle, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { randInt, shuffle } from '../rng';

type OpKind = 'add' | 'sub' | 'mul' | 'square' | 'conditionalParity';
interface Op {
  kind: OpKind;
  a?: number;
  b?: number;
}

function applyOp(op: Op, x: number): number {
  switch (op.kind) {
    case 'add':
      return x + op.a!;
    case 'sub':
      return x - op.a!;
    case 'mul':
      return x * op.a!;
    case 'square':
      return x * x;
    case 'conditionalParity':
      return x % 2 === 0 ? x * op.a! : x + op.b!;
  }
}

function opLabel(op: Op): string {
  switch (op.kind) {
    case 'add':
      return `add ${op.a}`;
    case 'sub':
      return `subtract ${op.a}`;
    case 'mul':
      return `multiply by ${op.a}`;
    case 'square':
      return 'square it';
    case 'conditionalParity':
      return `if even multiply by ${op.a}, else add ${op.b}`;
  }
}

function buildOp(kind: OpKind, rand: () => number): Op {
  switch (kind) {
    case 'add':
    case 'sub':
      return { kind, a: randInt(rand, 2, 9) };
    case 'mul':
      return { kind, a: randInt(rand, 2, 4) };
    case 'square':
      return { kind };
    case 'conditionalParity':
      return { kind, a: randInt(rand, 2, 3), b: randInt(rand, 2, 9) };
  }
}

const GRADE_PARAMS: Record<
  Grade,
  { depthMin: number; depthMax: number; pool: OpKind[]; cardCount: number; requiredCorrect: number; secondsPerCard: number }
> = {
  brass: { depthMin: 1, depthMax: 1, pool: ['add', 'sub', 'mul'], cardCount: 6, requiredCorrect: 5, secondsPerCard: 8 },
  steel: { depthMin: 1, depthMax: 2, pool: ['add', 'sub', 'mul'], cardCount: 8, requiredCorrect: 7, secondsPerCard: 6 },
  titanium: { depthMin: 2, depthMax: 2, pool: ['add', 'sub', 'mul', 'square'], cardCount: 10, requiredCorrect: 9, secondsPerCard: 5 },
  obsidian: { depthMin: 2, depthMax: 3, pool: ['add', 'sub', 'mul', 'square', 'conditionalParity'], cardCount: 12, requiredCorrect: 11, secondsPerCard: 4 },
};

function applyChain(ops: Op[], x: number): number {
  return ops.reduce((val, op) => applyOp(op, val), x);
}

function mutateChain(ops: Op[], rand: () => number): Op[] {
  const idx = Math.floor(rand() * ops.length);
  const mutated = [...ops];
  const target = mutated[idx];
  if (target.kind === 'square') {
    mutated[idx] = { kind: 'mul', a: 2 };
  } else if (target.kind === 'conditionalParity') {
    mutated[idx] = { ...target, a: (target.a ?? 2) + (rand() < 0.5 ? 1 : -1) };
  } else {
    const delta = (rand() < 0.5 ? 1 : -1) * randInt(rand, 1, 3);
    mutated[idx] = { ...target, a: Math.max(2, (target.a ?? 2) + delta) };
  }
  return mutated;
}

export const rulesnapEngine: PuzzleEngine<RuleSnapPuzzle, boolean[]> = {
  type: 'rulesnap',
  skill: 'ruleInference',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    const depth = randInt(rand, params.depthMin, params.depthMax);
    const trueOps: Op[] = Array.from({ length: depth }, () => buildOp(params.pool[Math.floor(rand() * params.pool.length)], rand));

    let rivalOps = mutateChain(trueOps, rand);
    const exampleInputs = shuffle(rand, Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, 3);
    for (let attempt = 0; attempt < 10; attempt++) {
      const diverges = exampleInputs.some((i) => applyChain(trueOps, i) !== applyChain(rivalOps, i));
      if (diverges) break;
      rivalOps = mutateChain(trueOps, rand);
    }

    const examples = exampleInputs.map((input) => ({ input, output: applyChain(trueOps, input) }));

    const usedInputs = new Set(exampleInputs);
    const cardInputPool = shuffle(
      rand,
      Array.from({ length: 30 }, (_, i) => i + 1).filter((n) => !usedInputs.has(n))
    );

    const cards: RuleSnapCard[] = Array.from({ length: params.cardCount }, (_, i) => {
      const isValid = rand() < 0.5;
      const input = cardInputPool[i % cardInputPool.length];
      const output = isValid ? applyChain(trueOps, input) : applyChain(rivalOps, input);
      return { id: `card-${i}`, input, output, isValid };
    });

    return {
      id: `rulesnap-${seed}`,
      type: 'rulesnap',
      grade,
      seed,
      timeLimitSec: params.cardCount * params.secondsPerCard + 5,
      attempts: 1,
      examples,
      cards,
      secondsPerCard: params.secondsPerCard,
      requiredCorrect: params.requiredCorrect,
      ruleLabel: trueOps.map(opLabel).join(', then '),
    };
  },

  validate(puzzle, answers): ValidationResult {
    let correctCount = 0;
    let wrongCount = 0;
    puzzle.cards.forEach((card, i) => {
      const accepted = answers[i];
      if (accepted === card.isValid) correctCount++;
      else wrongCount++;
    });
    return {
      correct: correctCount >= puzzle.requiredCorrect && wrongCount < 3,
      extra: { correctCount, wrongCount },
    };
  },

  getHint(puzzle, tier): HintPayload {
    if (tier === 1) {
      return { text: `The rule has ${puzzle.ruleLabel.split(', then ').length} step(s).` };
    }
    return { text: `The rule is: ${puzzle.ruleLabel}.`, reveal: puzzle.ruleLabel };
  },

  describeSolution(puzzle) {
    return `The rule is: ${puzzle.ruleLabel}.`;
  },
};

registerEngine(rulesnapEngine);
