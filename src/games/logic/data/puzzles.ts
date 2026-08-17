import { Puzzle, SymbolItem } from '../types';

export const HANDCRAFTED_PUZZLES: Puzzle[] = [
  // ==========================================
  // WORLD 1: SIMPLE MACHINES
  // ==========================================
  {
    id: 'w1-p1',
    worldId: 1,
    levelNumber: 1,
    worldTitle: 'World 1: Simple Machines',
    title: 'The Doubling Machine',
    description: 'Observe what happens when numbers enter the machine core.',
    mode: 'choose',
    dataType: 'number',
    examples: [
      { input: 2, output: 4 },
      { input: 3, output: 6 },
      { input: 4, output: 8 },
    ],
    question: {
      input: 5,
      expectedOutput: 10,
      choices: [8, 9, 10, 12],
    },
    expectedRule: {
      description: 'Multiply the input by 2 (×2)',
      tokens: ['×', '2'],
    },
    hints: [
      'Look at how the output compares to the input in each pair.',
      'Notice that the output is twice as large as the input.',
      'Multiply 5 by 2 to get the answer.',
    ],
    explanation: 'The machine doubles every number that passes through it: Input × 2 = Output.',
  },
  {
    id: 'w1-p2',
    worldId: 1,
    levelNumber: 2,
    worldTitle: 'World 1: Simple Machines',
    title: 'Plus One Power',
    description: 'A small shift occurs inside the energy chamber.',
    mode: 'choose',
    dataType: 'number',
    examples: [
      { input: 2, output: 5 },
      { input: 3, output: 7 },
      { input: 4, output: 9 },
    ],
    question: {
      input: 6,
      expectedOutput: 13,
      choices: [11, 12, 13, 14],
    },
    expectedRule: {
      description: 'Multiply by 2 and add 1 (×2 + 1)',
      tokens: ['×', '2', '+', '1'],
    },
    hints: [
      'Check if multiplying by 2 is almost enough.',
      '2 × 2 = 4, but output is 5. 3 × 2 = 6, but output is 7.',
      'Multiply 6 by 2 and add 1.',
    ],
    explanation: 'The machine doubles the input and adds 1: (Input × 2) + 1.',
  },
  {
    id: 'w1-p3',
    worldId: 1,
    levelNumber: 3,
    worldTitle: 'World 1: Simple Machines',
    title: 'The Halving Valve',
    description: 'Large inputs leave the machine significantly smaller.',
    mode: 'choose',
    dataType: 'number',
    examples: [
      { input: 10, output: 5 },
      { input: 14, output: 7 },
      { input: 18, output: 9 },
    ],
    question: {
      input: 24,
      expectedOutput: 12,
      choices: [10, 11, 12, 14],
    },
    expectedRule: {
      description: 'Divide the input by 2 (÷2)',
      tokens: ['÷', '2'],
    },
    hints: [
      'The output is smaller than the input.',
      'What fraction of 10 is 5? What fraction of 14 is 7?',
      'Divide 24 by 2.',
    ],
    explanation: 'The machine divides every input by 2: Input ÷ 2 = Output.',
  },
  {
    id: 'w1-p4',
    worldId: 1,
    levelNumber: 4,
    worldTitle: 'World 1: Simple Machines',
    title: 'The Square Reactor',
    description: 'Enter the answer directly into the machine control pad.',
    mode: 'enter',
    dataType: 'number',
    examples: [
      { input: 3, output: 9 },
      { input: 4, output: 16 },
      { input: 5, output: 25 },
    ],
    question: {
      input: 6,
      expectedOutput: 36,
    },
    expectedRule: {
      description: 'Square the input (n²)',
      tokens: ['square'],
    },
    hints: [
      'How do you get 9 from 3? How do you get 16 from 4?',
      'Each number is multiplied by itself.',
      'Calculate 6 × 6.',
    ],
    explanation: 'The machine multiplies the input by itself (squares it): Input × Input.',
  },
  {
    id: 'w1-p5',
    worldId: 1,
    levelNumber: 5,
    worldTitle: 'World 1: Simple Machines',
    title: 'Symbol Swapper',
    description: 'Symbols flow through the machine. What happens to their order?',
    mode: 'choose',
    dataType: 'symbols',
    examples: [
      {
        input: [
          { shape: 'triangle', color: '#ef4444' },
          { shape: 'circle', color: '#3b82f6' },
        ] as SymbolItem[],
        output: [
          { shape: 'circle', color: '#3b82f6' },
          { shape: 'triangle', color: '#ef4444' },
        ] as SymbolItem[],
      },
      {
        input: [
          { shape: 'square', color: '#10b981' },
          { shape: 'triangle', color: '#ef4444' },
        ] as SymbolItem[],
        output: [
          { shape: 'triangle', color: '#ef4444' },
          { shape: 'square', color: '#10b981' },
        ] as SymbolItem[],
      },
    ],
    question: {
      input: [
        { shape: 'diamond', color: '#8b5cf6' },
        { shape: 'circle', color: '#3b82f6' },
      ] as SymbolItem[],
      expectedOutput: [
        { shape: 'circle', color: '#3b82f6' },
        { shape: 'diamond', color: '#8b5cf6' },
      ] as SymbolItem[],
      choices: [
        [
          { shape: 'circle', color: '#3b82f6' },
          { shape: 'diamond', color: '#8b5cf6' },
        ],
        [
          { shape: 'diamond', color: '#8b5cf6' },
          { shape: 'circle', color: '#3b82f6' },
        ],
        [
          { shape: 'triangle', color: '#ef4444' },
          { shape: 'circle', color: '#3b82f6' },
        ],
        [
          { shape: 'square', color: '#10b981' },
          { shape: 'square', color: '#10b981' },
        ],
      ],
    },
    expectedRule: {
      description: 'Reverse the order of symbols',
      tokens: ['REVERSE'],
    },
    hints: [
      'Compare the position of the first and second symbol.',
      'The symbols swap positions.',
      'The circle comes first, then the diamond.',
    ],
    explanation: 'The machine reverses the sequence order of incoming symbols.',
  },

  // ==========================================
  // WORLD 2: PATTERN MACHINES
  // ==========================================
  {
    id: 'w2-p1',
    worldId: 2,
    levelNumber: 1,
    worldTitle: 'World 2: Pattern Machines',
    title: 'The Geometric Accelerator',
    description: 'Sequences grow exponentially inside this core.',
    mode: 'enter',
    dataType: 'sequence',
    examples: [
      { input: [2, 4, 8], output: 16 },
      { input: [3, 6, 12], output: 24 },
    ],
    question: {
      input: [5, 10, 20],
      expectedOutput: 40,
    },
    expectedRule: {
      description: 'Double the previous term (×2 sequence)',
      tokens: ['×', '2'],
    },
    hints: [
      'Look at how each number grows to the next: 2 → 4 → 8.',
      'Each step multiplies the previous term by 2.',
      'Multiply 20 by 2.',
    ],
    explanation: 'Each term in the sequence doubles the previous term: 20 × 2 = 40.',
  },
  {
    id: 'w2-p2',
    worldId: 2,
    levelNumber: 2,
    worldTitle: 'World 2: Pattern Machines',
    title: 'Triangle Number Chamber',
    description: 'The difference between numbers keeps increasing.',
    mode: 'enter',
    dataType: 'sequence',
    examples: [
      { input: [1, 3, 6, 10], output: 15 },
      { input: [2, 4, 7, 11], output: 16 },
    ],
    question: {
      input: [1, 3, 6, 10, 15],
      expectedOutput: 21,
    },
    expectedRule: {
      description: 'Add increasing increments (+2, +3, +4, +5, +6...)',
      tokens: ['+ INCREMENT'],
    },
    hints: [
      'Calculate the differences between consecutive terms: 3-1=2, 6-3=3, 10-6=4, 15-10=5.',
      'The next difference to add should be +6.',
      'Add 6 to 15.',
    ],
    explanation: 'The step difference increases by 1 each time (+2, +3, +4, +5, +6). So 15 + 6 = 21.',
  },
  {
    id: 'w2-p3',
    worldId: 2,
    levelNumber: 3,
    worldTitle: 'World 2: Pattern Machines',
    title: 'Double Plus One Sequence',
    description: 'Calculate the next term in this hybrid sequence.',
    mode: 'choose',
    dataType: 'sequence',
    examples: [
      { input: [2, 5, 11], output: 23 },
      { input: [1, 3, 7], output: 15 },
    ],
    question: {
      input: [3, 7, 15],
      expectedOutput: 31,
      choices: [29, 30, 31, 32],
    },
    expectedRule: {
      description: 'Multiply previous term by 2 and add 1',
      tokens: ['×2 + 1'],
    },
    hints: [
      '3 × 2 + 1 = 7. 7 × 2 + 1 = 15.',
      'To find the next term, double 15 and add 1.',
      '15 × 2 = 30; 30 + 1 = 31.',
    ],
    explanation: 'Each term is formed by doubling the previous term and adding 1.',
  },
  {
    id: 'w2-p4',
    worldId: 2,
    levelNumber: 4,
    worldTitle: 'World 2: Pattern Machines',
    title: 'The Golden Fibonacci Core',
    description: 'Nature’s famous sequence appears in the machine stream.',
    mode: 'enter',
    dataType: 'sequence',
    examples: [
      { input: [1, 1, 2, 3, 5], output: 8 },
      { input: [2, 3, 5, 8], output: 13 },
    ],
    question: {
      input: [1, 2, 3, 5, 8],
      expectedOutput: 13,
    },
    expectedRule: {
      description: 'Add the last two numbers together',
      tokens: ['SUM PREVIOUS TWO'],
    },
    hints: [
      'Look at 2 and 3: 2 + 3 = 5. Look at 3 and 5: 3 + 5 = 8.',
      'Add the last two numbers in the input sequence.',
      'Add 5 and 8.',
    ],
    explanation: 'Each term is the sum of the two preceding terms: 5 + 8 = 13.',
  },

  // ==========================================
  // WORLD 3: SHAPE MACHINES
  // ==========================================
  {
    id: 'w3-p1',
    worldId: 3,
    levelNumber: 1,
    worldTitle: 'World 3: Shape Machines',
    title: 'The Rotation Wheel',
    description: 'Shapes spin around their center axis.',
    mode: 'choose',
    dataType: 'symbols',
    examples: [
      {
        input: [{ shape: 'triangle', color: '#ef4444', rotation: 0 }] as SymbolItem[],
        output: [{ shape: 'triangle', color: '#ef4444', rotation: 90 }] as SymbolItem[],
      },
      {
        input: [{ shape: 'arrow', color: '#3b82f6', rotation: 90 }] as SymbolItem[],
        output: [{ shape: 'arrow', color: '#3b82f6', rotation: 180 }] as SymbolItem[],
      },
    ],
    question: {
      input: [{ shape: 'square', color: '#10b981', rotation: 180 }] as SymbolItem[],
      expectedOutput: [{ shape: 'square', color: '#10b981', rotation: 270 }] as SymbolItem[],
      choices: [
        [{ shape: 'square', color: '#10b981', rotation: 270 }],
        [{ shape: 'square', color: '#10b981', rotation: 180 }],
        [{ shape: 'square', color: '#10b981', rotation: 0 }],
        [{ shape: 'triangle', color: '#10b981', rotation: 90 }],
      ],
    },
    expectedRule: {
      description: 'Rotate clockwise by 90°',
      tokens: ['ROTATE', '90°'],
    },
    hints: [
      'Notice how the rotation angle changes in each example.',
      'The shape turns 90 degrees clockwise.',
      '180° + 90° = 270°.',
    ],
    explanation: 'The machine rotates every input symbol 90 degrees clockwise.',
  },
  {
    id: 'w3-p2',
    worldId: 3,
    levelNumber: 2,
    worldTitle: 'World 3: Shape Machines',
    title: 'Duplication Chamber',
    description: 'Single objects split into pairs.',
    mode: 'choose',
    dataType: 'symbols',
    examples: [
      {
        input: [{ shape: 'circle', color: '#3b82f6' }] as SymbolItem[],
        output: [
          { shape: 'circle', color: '#3b82f6' },
          { shape: 'circle', color: '#3b82f6' },
        ] as SymbolItem[],
      },
      {
        input: [{ shape: 'diamond', color: '#f59e0b' }] as SymbolItem[],
        output: [
          { shape: 'diamond', color: '#f59e0b' },
          { shape: 'diamond', color: '#f59e0b' },
        ] as SymbolItem[],
      },
    ],
    question: {
      input: [{ shape: 'star', color: '#8b5cf6' }] as SymbolItem[],
      expectedOutput: [
        { shape: 'star', color: '#8b5cf6' },
        { shape: 'star', color: '#8b5cf6' },
      ] as SymbolItem[],
      choices: [
        [
          { shape: 'star', color: '#8b5cf6' },
          { shape: 'star', color: '#8b5cf6' },
        ],
        [{ shape: 'star', color: '#8b5cf6' }],
        [
          { shape: 'circle', color: '#8b5cf6' },
          { shape: 'star', color: '#8b5cf6' },
        ],
        [],
      ],
    },
    expectedRule: {
      description: 'Duplicate the shape',
      tokens: ['DUPLICATE'],
    },
    hints: [
      'Compare the number of shapes in the input vs output.',
      'The machine clones the input shape.',
      'One purple star becomes two purple stars.',
    ],
    explanation: 'The machine duplicates whatever symbol enters its chamber.',
  },

  // ==========================================
  // WORLD 4: COMBINATION MACHINES
  // ==========================================
  {
    id: 'w4-p1',
    worldId: 4,
    levelNumber: 1,
    worldTitle: 'World 4: Combination Machines',
    title: 'Double and Add One',
    description: 'Construct the precise multi-step rule bar.',
    mode: 'build',
    dataType: 'number',
    examples: [
      { input: 2, output: 5 },
      { input: 3, output: 7 },
      { input: 4, output: 9 },
    ],
    question: {
      input: 5,
      expectedOutput: 11,
    },
    expectedRule: {
      description: '×2 + 1',
      tokens: ['×', '2', '+', '1'],
    },
    availableRuleTokens: [
      { id: 'op_mult', label: '×', category: 'op' },
      { id: 'op_add', label: '+', category: 'op' },
      { id: 'op_sub', label: '-', category: 'op' },
      { id: 'val_1', label: '1', category: 'value' },
      { id: 'val_2', label: '2', category: 'value' },
      { id: 'val_3', label: '3', category: 'value' },
    ],
    hints: [
      'Try multiplying by 2 first: 2 × 2 = 4.',
      'Then add 1: 4 + 1 = 5.',
      'Build the sequence [ × ] [ 2 ] [ + ] [ 1 ].',
    ],
    explanation: 'The machine combines two operations: first multiply by 2, then add 1.',
  },
  {
    id: 'w4-p2',
    worldId: 4,
    levelNumber: 4,
    worldTitle: 'World 4: Combination Machines',
    title: 'Triple and Subtract Two',
    description: 'Assemble the multi-step formula.',
    mode: 'build',
    dataType: 'number',
    examples: [
      { input: 3, output: 7 },
      { input: 4, output: 10 },
      { input: 5, output: 13 },
    ],
    question: {
      input: 6,
      expectedOutput: 16,
    },
    expectedRule: {
      description: '×3 - 2',
      tokens: ['×', '3', '-', '2'],
    },
    availableRuleTokens: [
      { id: 'op_mult', label: '×', category: 'op' },
      { id: 'op_add', label: '+', category: 'op' },
      { id: 'op_sub', label: '-', category: 'op' },
      { id: 'val_1', label: '1', category: 'value' },
      { id: 'val_2', label: '2', category: 'value' },
      { id: 'val_3', label: '3', category: 'value' },
    ],
    hints: [
      '3 × 3 = 9. How do you get to 7?',
      'Subtract 2 from 9.',
      'Build the rule: [ × ] [ 3 ] [ - ] [ 2 ].',
    ],
    explanation: 'The machine multiplies by 3 and then subtracts 2: (Input × 3) - 2.',
  },

  // ==========================================
  // WORLD 5: CONDITIONAL MACHINES
  // ==========================================
  {
    id: 'w5-p1',
    worldId: 5,
    levelNumber: 1,
    worldTitle: 'World 5: Conditional Machines',
    title: 'Even/Odd Splitter',
    description: 'Even numbers and odd numbers trigger different pathways.',
    mode: 'choose',
    dataType: 'number',
    examples: [
      { input: 4, output: 2, notes: 'Even number' },
      { input: 6, output: 3, notes: 'Even number' },
      { input: 5, output: 15, notes: 'Odd number' },
      { input: 7, output: 21, notes: 'Odd number' },
    ],
    question: {
      input: 8,
      expectedOutput: 4,
      choices: [4, 16, 24, 2],
    },
    expectedRule: {
      description: 'If EVEN → ÷2; If ODD → ×3',
    },
    hints: [
      'Notice how 4 becomes 2 and 6 becomes 3 (divided by 2).',
      'Notice how 5 becomes 15 and 7 becomes 21 (multiplied by 3).',
      '8 is an EVEN number, so divide by 2.',
    ],
    explanation: 'The conditional rule: IF input is even, divide by 2. IF input is odd, multiply by 3. 8 is even, so 8 ÷ 2 = 4.',
  },

  // ==========================================
  // WORLD 6: HIDDEN LOGIC
  // ==========================================
  {
    id: 'w6-p1',
    worldId: 6,
    levelNumber: 1,
    worldTitle: 'World 6: Hidden Logic',
    title: 'Threshold Transformer',
    description: 'The machine behaves differently if the input is greater than 5.',
    mode: 'build',
    dataType: 'number',
    examples: [
      { input: 2, output: 5, notes: 'Input ≤ 5' },
      { input: 4, output: 7, notes: 'Input ≤ 5' },
      { input: 6, output: 12, notes: 'Input > 5' },
      { input: 8, output: 16, notes: 'Input > 5' },
    ],
    question: {
      input: 7,
      expectedOutput: 14,
    },
    expectedRule: {
      description: 'IF > 5 THEN ×2 ELSE +3',
      tokens: ['IF > 5', '×2', 'ELSE', '+3'],
    },
    availableRuleTokens: [
      { id: 'cond_gt5', label: 'IF > 5', category: 'condition' },
      { id: 'op_x2', label: '×2', category: 'transform' },
      { id: 'kw_else', label: 'ELSE', category: 'condition' },
      { id: 'op_add3', label: '+3', category: 'transform' },
      { id: 'op_add1', label: '+1', category: 'transform' },
    ],
    hints: [
      'Look at inputs 2 and 4: 2+3=5, 4+3=7.',
      'Look at inputs 6 and 8: 6×2=12, 8×2=16.',
      'Since 7 is greater than 5, multiply by 2: 7 × 2 = 14.',
    ],
    explanation: 'The machine tests if Input > 5. If true, it doubles the input. Otherwise, it adds 3.',
  },

  // ==========================================
  // WORLD 7: NESTED MACHINES
  // ==========================================
  {
    id: 'w7-p1',
    worldId: 7,
    levelNumber: 1,
    worldTitle: 'World 7: Nested Machines',
    title: 'Dual Core Pipeline',
    description: 'Data passes through Machine Alpha and then Machine Beta.',
    mode: 'discover',
    dataType: 'number',
    examples: [
      { input: 3, output: 9 }, // (3 * 2) + 3 = 9
      { input: 4, output: 11 }, // (4 * 2) + 3 = 11
      { input: 5, output: 13 }, // (5 * 2) + 3 = 13
    ],
    question: {
      input: 6,
      expectedOutput: 15,
    },
    nestedPipeline: [
      { name: 'Machine Alpha', transformDescription: 'Multiply by 2 (×2)' },
      { name: 'Machine Beta', transformDescription: 'Add 3 (+3)' },
    ],
    expectedRule: {
      description: 'Alpha: ×2 → Beta: +3',
    },
    hints: [
      'Machine Alpha doubles the input.',
      'Machine Beta takes the result from Alpha and adds 3.',
      'For input 6: Alpha produces 12, then Beta produces 12 + 3 = 15.',
    ],
    explanation: 'Nested Pipeline: Machine Alpha doubles the input (6 → 12). Machine Beta adds 3 to Alpha’s output (12 → 15).',
  },

  // ==========================================
  // WORLD 8: THE IMPOSSIBLE MACHINE (AMBIGUITY & HYPOTHESIS TESTING)
  // ==========================================
  {
    id: 'w8-p1',
    worldId: 8,
    levelNumber: 1,
    worldTitle: 'World 8: The Impossible Machine',
    title: 'The Ambiguous Doubler',
    description: 'Two rival hypotheses explain the evidence: Rule A (+2) vs Rule B (×2). Design an experiment to prove which is true!',
    mode: 'discover',
    dataType: 'number',
    examples: [
      { input: 2, output: 4, notes: 'Evidence: Both +2 and ×2 give 4!' },
    ],
    question: {
      input: 3,
      expectedOutput: 6,
    },
    ambiguityChallenge: {
      hypothesisA: 'Add 2 (+2)',
      hypothesisB: 'Multiply by 2 (×2)',
      correctHypothesis: 'B',
      correctExperimentId: 'exp_3',
      experiments: [
        {
          id: 'exp_2',
          input: 2,
          label: 'Test Input: 2',
          hypothesisAOutcome: 4,
          hypothesisBOutcome: 4,
          explanation: 'Testing 2 gives output 4 for BOTH rules! This does NOT distinguish them.',
        },
        {
          id: 'exp_3',
          input: 3,
          label: 'Test Input: 3',
          hypothesisAOutcome: 5,
          hypothesisBOutcome: 6,
          explanation: 'Crucial Experiment! If +2, 3→5. If ×2, 3→6. The machine produces 6, proving Rule B (×2)!',
        },
        {
          id: 'exp_0',
          input: 0,
          label: 'Test Input: 0',
          hypothesisAOutcome: 2,
          hypothesisBOutcome: 0,
          explanation: 'If +2, 0→2. If ×2, 0→0.',
        },
      ],
    },
    expectedRule: {
      description: 'Multiply by 2 (×2)',
    },
    hints: [
      'Look at why input 2 → 4 is ambiguous: 2 + 2 = 4 AND 2 × 2 = 4.',
      'To test which rule is real, pick an input where +2 and ×2 produce DIFFERENT outputs.',
      'Choose Test Input 3. If output is 6, it is ×2. If output is 5, it is +2.',
    ],
    explanation: 'Scientific deduction! Input 2 → 4 could mean +2 or ×2. By running an experiment with input 3, the output 6 uniquely confirmed Rule B (×2).',
  },
  {
    id: 'w8-p2',
    worldId: 8,
    levelNumber: 2,
    worldTitle: 'World 8: The Impossible Machine',
    title: 'Square vs Triple',
    description: 'Input 3 produces 9. Is the machine squaring the number (n²) or multiplying by 3 (3n)? Test an input to resolve the ambiguity!',
    mode: 'discover',
    dataType: 'number',
    examples: [
      { input: 3, output: 9, notes: 'Evidence: 3² = 9 and 3 × 3 = 9!' },
    ],
    question: {
      input: 2,
      expectedOutput: 4,
    },
    ambiguityChallenge: {
      hypothesisA: 'Square the input (n²)',
      hypothesisB: 'Multiply by 3 (×3)',
      correctHypothesis: 'A',
      correctExperimentId: 'exp_2',
      experiments: [
        {
          id: 'exp_3',
          input: 3,
          label: 'Test Input: 3',
          hypothesisAOutcome: 9,
          hypothesisBOutcome: 9,
          explanation: '3 gives 9 under both rules! This gives no new information.',
        },
        {
          id: 'exp_2',
          input: 2,
          label: 'Test Input: 2',
          hypothesisAOutcome: 4,
          hypothesisBOutcome: 6,
          explanation: 'Crucial Experiment! If n², 2→4. If ×3, 2→6. The machine outputs 4, proving Rule A (Square)!',
        },
        {
          id: 'exp_4',
          input: 4,
          label: 'Test Input: 4',
          hypothesisAOutcome: 16,
          hypothesisBOutcome: 12,
          explanation: 'Testing 4 gives 16 vs 12.',
        },
      ],
    },
    expectedRule: {
      description: 'Square the input (n²)',
    },
    hints: [
      '3 squared is 9, and 3 times 3 is 9.',
      'Test input 2: 2 squared is 4, but 2 times 3 is 6.',
      'The experiment output 4 proves the machine squares numbers.',
    ],
    explanation: 'By testing input 2, the result 4 proves the machine squares the number rather than multiplying by 3!',
  },
];

export function getPuzzleById(id: string): Puzzle | undefined {
  return HANDCRAFTED_PUZZLES.find((p) => p.id === id);
}

export function getPuzzlesByWorld(worldId: number): Puzzle[] {
  return HANDCRAFTED_PUZZLES.filter((p) => p.worldId === worldId);
}
