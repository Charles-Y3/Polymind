import { Puzzle, InteractionMode, SymbolItem } from '../types';

const SHAPES: Array<SymbolItem['shape']> = ['square', 'circle', 'triangle', 'diamond', 'star'];
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function generateProceduralPuzzle(difficulty: number = 1, forcedMode?: InteractionMode): Puzzle {
  const mode: InteractionMode = forcedMode || (['choose', 'enter', 'build', 'discover'][Math.floor(Math.random() * 4)] as InteractionMode);
  const puzzleId = `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Multiplier / Offset rules generator
  const mult = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
  const offset = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2

  const ruleEval = (x: number) => x * mult + offset;
  const ruleDesc = offset === 0 
    ? `×${mult}` 
    : offset > 0 
      ? `×${mult} + ${offset}` 
      : `×${mult} - ${Math.abs(offset)}`;

  const baseInput1 = Math.floor(Math.random() * 5) + 1;
  const baseInput2 = baseInput1 + 2;
  const baseInput3 = baseInput2 + 2;
  const questionInput = baseInput3 + 2;

  const ex1 = { input: baseInput1, output: ruleEval(baseInput1) };
  const ex2 = { input: baseInput2, output: ruleEval(baseInput2) };
  const ex3 = { input: baseInput3, output: ruleEval(baseInput3) };
  const expectedAns = ruleEval(questionInput);

  const choices = [
    expectedAns,
    expectedAns + mult,
    expectedAns - mult,
    expectedAns + offset + 1 === expectedAns ? expectedAns + 3 : expectedAns + offset + 1,
  ].sort(() => Math.random() - 0.5);

  return {
    id: puzzleId,
    worldId: Math.min(8, Math.max(1, difficulty)) as any,
    levelNumber: Math.floor(Math.random() * 10) + 1,
    worldTitle: `Endless Lab - Tier ${difficulty}`,
    title: `Procedural Machine #${puzzleId.slice(-4)}`,
    description: 'An AI-generated core test. Discover the transformation rule!',
    mode,
    dataType: 'number',
    examples: [ex1, ex2, ex3],
    question: {
      input: questionInput,
      expectedOutput: expectedAns,
      choices: mode === 'choose' ? choices : undefined,
    },
    expectedRule: {
      description: ruleDesc,
      tokens: ['×', `${mult}`, offset >= 0 ? '+' : '-', `${Math.abs(offset)}`],
    },
    hints: [
      `Notice how the outputs increase as the inputs increase.`,
      `The multiplier factor is around ×${mult}.`,
      `Apply formula: (Input × ${mult}) ${offset >= 0 ? '+' : ''} ${offset === 0 ? '' : offset}.`,
    ],
    explanation: `Formula rule: Input → (${ruleDesc}) = Output. So ${questionInput} → ${expectedAns}.`,
  };
}

// Generate deterministic daily puzzle from date string (e.g. "2026-08-13")
export function generateDailyPuzzle(dateStr: string): Puzzle {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  const mult = (seed % 3) + 2; // 2, 3, or 4
  const offset = (seed % 5) - 1; // -1 to 3
  const ruleEval = (x: number) => x * mult + offset;
  const ruleDesc = offset === 0 ? `×${mult}` : offset > 0 ? `×${mult} + ${offset}` : `×${mult} - ${Math.abs(offset)}`;

  const in1 = (seed % 4) + 2;
  const in2 = in1 + 2;
  const qIn = in2 + 3;

  const expectedAns = ruleEval(qIn);

  return {
    id: `daily-${dateStr}`,
    worldId: 4,
    levelNumber: 1,
    worldTitle: 'Daily Machine Challenge',
    title: `Daily Machine #${dateStr}`,
    description: `Global Daily Machine for ${dateStr}. Complete it in 3 attempts to earn streak bonuses!`,
    mode: 'build',
    dataType: 'number',
    examples: [
      { input: in1, output: ruleEval(in1) },
      { input: in2, output: ruleEval(in2) },
    ],
    question: {
      input: qIn,
      expectedOutput: expectedAns,
    },
    expectedRule: {
      description: ruleDesc,
      tokens: ['×', `${mult}`, offset >= 0 ? '+' : '-', `${Math.abs(offset)}`],
    },
    availableRuleTokens: [
      { id: 'op_mult', label: '×', category: 'op' },
      { id: 'op_add', label: '+', category: 'op' },
      { id: 'op_sub', label: '-', category: 'op' },
      { id: `val_${mult}`, label: `${mult}`, category: 'value' },
      { id: `val_${Math.abs(offset)}`, label: `${Math.abs(offset)}`, category: 'value' },
      { id: 'val_1', label: '1', category: 'value' },
    ],
    hints: [
      `Try finding the multiplier that scales input to output.`,
      `The multiplier is ×${mult}.`,
      `The rule is: ${ruleDesc}.`,
    ],
    explanation: `Daily Machine Solved! Rule: Input × ${mult} ${offset >= 0 ? '+' : ''} ${offset}.`,
  };
}
