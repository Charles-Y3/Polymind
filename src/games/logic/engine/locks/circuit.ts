import { CircuitPuzzle, Gate, GateKind, Grade, HintPayload, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { randInt, shuffle } from '../rng';

const GRADE_PARAMS: Record<
  Grade,
  {
    k: number;
    gateCount: number;
    kinds: GateKind[];
    allow3Input: boolean;
    minFrac: number;
    maxFrac: number;
    probes: number;
    attempts: number;
    timeLimitSec: number;
  }
> = {
  brass: { k: 3, gateCount: 3, kinds: ['AND', 'OR', 'NOT'], allow3Input: false, minFrac: 0.25, maxFrac: 1, probes: 3, attempts: 3, timeLimitSec: 90 },
  steel: { k: 4, gateCount: 5, kinds: ['AND', 'OR', 'NOT', 'XOR'], allow3Input: false, minFrac: 0.1, maxFrac: 0.25, probes: 2, attempts: 3, timeLimitSec: 90 },
  titanium: { k: 5, gateCount: 7, kinds: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'], allow3Input: false, minFrac: 0.05, maxFrac: 0.1, probes: 1, attempts: 2, timeLimitSec: 75 },
  obsidian: { k: 6, gateCount: 9, kinds: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'], allow3Input: true, minFrac: 0, maxFrac: 2, probes: 0, attempts: 2, timeLimitSec: 75 },
};

function evalGate(kind: GateKind, ins: boolean[]): boolean {
  switch (kind) {
    case 'AND':
      return ins.every(Boolean);
    case 'OR':
      return ins.some(Boolean);
    case 'NOT':
      return !ins[0];
    case 'XOR':
      return ins.reduce((a, b) => a !== b, false);
    case 'NAND':
      return !ins.every(Boolean);
    case 'NOR':
      return !ins.some(Boolean);
  }
}

export function evaluateCircuitFull(inputIds: string[], gates: Gate[], values: boolean[]): Map<string, boolean> {
  const valueOf = new Map<string, boolean>(inputIds.map((id, i) => [id, values[i]]));
  for (const gate of gates) {
    const ins = gate.inputs.map((id) => valueOf.get(id)!);
    valueOf.set(gate.id, evalGate(gate.kind, ins));
  }
  return valueOf;
}

function evaluateCircuit(inputIds: string[], gates: Gate[], outputId: string, values: boolean[]): boolean {
  return evaluateCircuitFull(inputIds, gates, values).get(outputId)!;
}

function buildCircuit(grade: Grade, rand: () => number) {
  const params = GRADE_PARAMS[grade];
  const inputIds = Array.from({ length: params.k }, (_, i) => `in-${i}`);
  const gates: Gate[] = [];
  const nodes = [...inputIds];
  for (let i = 0; i < params.gateCount; i++) {
    const kind = params.kinds[Math.floor(rand() * params.kinds.length)];
    const maxArity = kind === 'NOT' ? 1 : params.allow3Input && rand() < 0.35 ? 3 : 2;
    const arity = Math.min(maxArity, nodes.length);
    const chosen = shuffle(rand, nodes).slice(0, Math.max(1, arity));
    const gate: Gate = { id: `gate-${i}`, kind, inputs: chosen };
    gates.push(gate);
    nodes.push(gate.id);
  }
  const outputId = gates[gates.length - 1].id;
  return { inputIds, gates, outputId, params };
}

function countSolutions(inputIds: string[], gates: Gate[], outputId: string): number {
  const k = inputIds.length;
  let count = 0;
  for (let mask = 0; mask < 1 << k; mask++) {
    const values = Array.from({ length: k }, (_, i) => ((mask >> i) & 1) === 1);
    if (evaluateCircuit(inputIds, gates, outputId, values)) count++;
  }
  return count;
}

function firstSolution(inputIds: string[], gates: Gate[], outputId: string): boolean[] {
  const k = inputIds.length;
  for (let mask = 0; mask < 1 << k; mask++) {
    const values = Array.from({ length: k }, (_, i) => ((mask >> i) & 1) === 1);
    if (evaluateCircuit(inputIds, gates, outputId, values)) return values;
  }
  return Array(k).fill(false);
}

export const circuitEngine: PuzzleEngine<CircuitPuzzle, boolean[]> = {
  type: 'circuit',
  skill: 'circuitLogic',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    const total = 1 << params.k;
    let best: ReturnType<typeof buildCircuit> | null = null;
    let bestCount = -1;

    for (let attempt = 0; attempt < 40; attempt++) {
      const built = buildCircuit(grade, rand);
      const solCount = countSolutions(built.inputIds, built.gates, built.outputId);
      if (solCount === 0) continue;
      const frac = solCount / total;
      if (frac >= params.minFrac && frac <= params.maxFrac) {
        best = built;
        bestCount = solCount;
        break;
      }
      // keep the closest-to-band candidate as a fallback
      if (best === null || Math.abs(frac - (params.minFrac + params.maxFrac) / 2) < Math.abs(bestCount / total - (params.minFrac + params.maxFrac) / 2)) {
        best = built;
        bestCount = solCount;
      }
    }
    const built = best!;

    return {
      id: `circuit-${seed}`,
      type: 'circuit',
      grade,
      seed,
      timeLimitSec: params.timeLimitSec,
      attempts: params.attempts,
      probes: params.probes,
      inputIds: built.inputIds,
      gates: built.gates,
      outputId: built.outputId,
      solutionCount: bestCount,
    };
  },

  validate(puzzle, answer): ValidationResult {
    const result = evaluateCircuit(puzzle.inputIds, puzzle.gates, puzzle.outputId, answer);
    return { correct: result };
  },

  getHint(puzzle, tier): HintPayload {
    const solution = firstSolution(puzzle.inputIds, puzzle.gates, puzzle.outputId);
    if (tier === 1) {
      const idx = randInt(() => Math.random(), 0, puzzle.inputIds.length - 1);
      return { text: `Switch ${idx + 1} must be ${solution[idx] ? 'ON' : 'OFF'} in a valid solution.`, reveal: { index: idx, value: solution[idx] } };
    }
    return { text: `One valid switch pattern: ${solution.map((v) => (v ? 'ON' : 'OFF')).join(', ')}.`, reveal: solution };
  },

  describeSolution(puzzle) {
    const solution = firstSolution(puzzle.inputIds, puzzle.gates, puzzle.outputId);
    return `A valid switch pattern is: ${solution.map((v) => (v ? 'ON' : 'OFF')).join(', ')} (${puzzle.solutionCount} of ${1 << puzzle.inputIds.length} combinations work).`;
  },
};

registerEngine(circuitEngine);
