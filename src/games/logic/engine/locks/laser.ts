import { Grade, HintPayload, LaserCell, LaserPuzzle, MirrorOrientation, ValidationResult } from '../../types';
import { PuzzleEngine, registerEngine } from '../registry';
import { randInt } from '../rng';

type Dir = 'N' | 'S' | 'E' | 'W';
const DELTA: Record<Dir, [number, number]> = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const PERPENDICULAR: Record<Dir, Dir[]> = { N: ['E', 'W'], S: ['E', 'W'], E: ['N', 'S'], W: ['N', 'S'] };

// '/' = orientation 0, '\' = orientation 1
function mirrorForTurn(from: Dir, to: Dir): MirrorOrientation {
  const slash: [Dir, Dir][] = [
    ['E', 'N'], ['N', 'E'], ['W', 'S'], ['S', 'W'],
  ];
  return slash.some(([a, b]) => a === from && b === to) ? 0 : 1;
}

function reflect(dir: Dir, orientation: MirrorOrientation): Dir {
  const map0: Record<Dir, Dir> = { E: 'N', N: 'E', W: 'S', S: 'W' }; // '/'
  const map1: Record<Dir, Dir> = { E: 'S', S: 'E', W: 'N', N: 'W' }; // '\'
  return orientation === 0 ? map0[dir] : map1[dir];
}

const GRADE_PARAMS: Record<
  Grade,
  { size: number; pathMirrors: number; decoys: number; slack: number; timeLimitSec: number; attempts: number; maxBeamTests?: number }
> = {
  brass: { size: 4, pathMirrors: 3, decoys: 1, slack: 6, timeLimitSec: 90, attempts: 3 },
  steel: { size: 5, pathMirrors: 4, decoys: 2, slack: 4, timeLimitSec: 90, attempts: 3 },
  titanium: { size: 6, pathMirrors: 5, decoys: 4, slack: 1, timeLimitSec: 90, attempts: 2, maxBeamTests: 3 },
  obsidian: { size: 7, pathMirrors: 6, decoys: 5, slack: 0, timeLimitSec: 100, attempts: 2, maxBeamTests: 2 },
};

function inBounds(size: number, x: number, y: number) {
  return x >= 0 && x < size && y >= 0 && y < size;
}

interface BuildResult {
  cells: LaserCell[];
  size: number;
  minRotations: number;
}

function buildLaser(grade: Grade, rand: () => number): BuildResult | null {
  const params = GRADE_PARAMS[grade];
  const size = params.size;

  const borders: { pos: [number, number]; dir: Dir }[] = [];
  for (let i = 0; i < size; i++) {
    borders.push({ pos: [0, i], dir: 'E' });
    borders.push({ pos: [size - 1, i], dir: 'W' });
    borders.push({ pos: [i, 0], dir: 'S' });
    borders.push({ pos: [i, size - 1], dir: 'N' });
  }
  const emitterChoice = borders[Math.floor(rand() * borders.length)];
  const [ex, ey] = emitterChoice.pos;
  const emitDir = emitterChoice.dir;

  const visited = new Set<string>([`${ex},${ey}`]);
  const pathMirrorCells: { x: number; y: number; orientation: MirrorOrientation; incomingDir: Dir }[] = [];

  let x = ex;
  let y = ey;
  let dir = emitDir;

  for (let turn = 0; turn < params.pathMirrors; turn++) {
    const incomingDir = dir;
    const maxStep = Math.max(1, Math.floor(size / 2));
    const steps = randInt(rand, 1, maxStep);
    let nx = x;
    let ny = y;
    for (let s = 0; s < steps; s++) {
      const [dx, dy] = DELTA[dir];
      const cx = nx + dx;
      const cy = ny + dy;
      if (!inBounds(size, cx, cy) || visited.has(`${cx},${cy}`)) break;
      nx = cx;
      ny = cy;
      // Every cell the beam actually crosses (not just the turn point) must be
      // protected from later becoming a decoy mirror or blocker, or the puzzle
      // becomes unsolvable.
      visited.add(`${nx},${ny}`);
    }
    if (nx === x && ny === y) return null; // couldn't move, abort this attempt
    x = nx;
    y = ny;

    const options = PERPENDICULAR[dir].filter((d) => {
      const [dx, dy] = DELTA[d];
      return inBounds(size, x + dx, y + dy) && !visited.has(`${x + dx},${y + dy}`);
    });
    if (options.length === 0) return null;
    const newDir = options[Math.floor(rand() * options.length)];
    const orientation = mirrorForTurn(dir, newDir);
    pathMirrorCells.push({ x, y, orientation, incomingDir });
    dir = newDir;
  }

  // final leg to the receiver
  const maxStep = Math.max(1, Math.floor(size / 2));
  const steps = randInt(rand, 1, maxStep);
  let rx = x;
  let ry = y;
  for (let s = 0; s < steps; s++) {
    const [dx, dy] = DELTA[dir];
    const cx = rx + dx;
    const cy = ry + dy;
    if (!inBounds(size, cx, cy) || visited.has(`${cx},${cy}`)) break;
    rx = cx;
    ry = cy;
    visited.add(`${rx},${ry}`);
  }
  if (rx === x && ry === y) return null;

  // scramble each path mirror's starting orientation
  let minRotations = 0;
  const scrambled = pathMirrorCells.map((m) => {
    const flip = rand() < 0.5;
    if (flip) minRotations++;
    return { ...m, startOrientation: (flip ? (1 - m.orientation) : m.orientation) as MirrorOrientation };
  });

  const cells: LaserCell[] = [];
  for (let gy = 0; gy < size; gy++) {
    for (let gx = 0; gx < size; gx++) {
      if (gx === ex && gy === ey) {
        cells.push({ x: gx, y: gy, kind: 'emitter', emitDir });
      } else if (gx === rx && gy === ry) {
        cells.push({ x: gx, y: gy, kind: 'receiver' });
      } else {
        const pm = scrambled.find((m) => m.x === gx && m.y === gy);
        if (pm) {
          cells.push({ x: gx, y: gy, kind: 'mirror', orientation: pm.startOrientation, solvedOrientation: pm.orientation });
        } else {
          cells.push({ x: gx, y: gy, kind: 'empty' });
        }
      }
    }
  }
  const cellMap = new Map<string, LaserCell>(cells.map((c) => [`${c.x},${c.y}`, c]));

  // Trap decoys: for every path mirror that starts in the WRONG orientation, walk a
  // short branch in the direction that wrong setting would actually send the beam,
  // and drop a locked (non-rotatable) mirror at the end of it. This makes a wrong
  // guess bounce plausibly deeper into the board instead of dead-ending after one
  // cell, so the player can't just flip a mirror and watch the beam "obviously" stop —
  // they have to actually trace where a wrong choice leads.
  const trapReserved = new Set<string>();
  scrambled.forEach((m) => {
    if (m.startOrientation === m.orientation) return; // starts correct, no wrong branch to disguise
    const wrongDir = reflect(m.incomingDir, m.startOrientation);
    const hops = randInt(rand, 1, 2);
    let tx = m.x;
    let ty = m.y;
    let curDir = wrongDir;
    for (let h = 0; h < hops; h++) {
      const [dx, dy] = DELTA[curDir];
      const nx = tx + dx;
      const ny = ty + dy;
      const key = `${nx},${ny}`;
      if (!inBounds(size, nx, ny) || visited.has(key) || trapReserved.has(key)) break;
      const cell = cellMap.get(key);
      if (!cell || cell.kind !== 'empty') break;
      tx = nx;
      ty = ny;
      trapReserved.add(key);
      // Only the final hop becomes a visible locked mirror; intermediate hops just
      // stay empty pass-through cells (the branch is a straight line unless bent once).
      if (h === hops - 1) {
        const trapOrientation: MirrorOrientation = rand() < 0.5 ? 0 : 1;
        cell.kind = 'mirror';
        cell.orientation = trapOrientation;
        cell.locked = true;
        curDir = reflect(curDir, trapOrientation);
      }
    }
  });

  // Decoy mirrors + blockers must never land on a cell the true beam passes through
  // (including straight-line cells between turns, tracked in `visited`), or a trap
  // branch cell, or the puzzle becomes unsolvable / a trap gets silently overwritten.
  const emptyCells = cells.filter((c) => c.kind === 'empty' && !visited.has(`${c.x},${c.y}`) && !trapReserved.has(`${c.x},${c.y}`));
  for (let i = 0; i < params.decoys && emptyCells.length > 0; i++) {
    const idx = Math.floor(rand() * emptyCells.length);
    const cell = emptyCells.splice(idx, 1)[0];
    cell.kind = 'mirror';
    cell.orientation = rand() < 0.5 ? 0 : 1;
    cell.locked = true;
  }
  for (let i = 0; i < 2 && emptyCells.length > 0; i++) {
    const idx = Math.floor(rand() * emptyCells.length);
    const cell = emptyCells.splice(idx, 1)[0];
    cell.kind = 'blocker';
  }

  // Safety net: the true solution (every path mirror at its solved orientation) must
  // actually reach the receiver, or this build is rejected and the caller retries.
  const solvedAnswer: Record<string, MirrorOrientation> = {};
  scrambled.forEach((m) => {
    solvedAnswer[`${m.x},${m.y}`] = m.orientation;
  });
  if (!traceBeam(size, cells, solvedAnswer)) return null;

  return { cells, size, minRotations };
}

export function beamPath(
  size: number,
  cells: LaserCell[],
  overrides?: Record<string, MirrorOrientation>
): { path: { x: number; y: number }[]; hit: 'receiver' | 'blocker' | 'exit' } {
  const grid = new Map<string, LaserCell>(cells.map((c) => [`${c.x},${c.y}`, c]));
  const emitter = cells.find((c) => c.kind === 'emitter')!;
  let x = emitter.x;
  let y = emitter.y;
  let dir = emitter.emitDir!;
  const path: { x: number; y: number }[] = [{ x, y }];
  const maxSteps = size * size * 4;

  for (let step = 0; step < maxSteps; step++) {
    const [dx, dy] = DELTA[dir];
    x += dx;
    y += dy;
    if (!inBounds(size, x, y)) return { path, hit: 'exit' };
    const cell = grid.get(`${x},${y}`);
    if (!cell) return { path, hit: 'exit' };
    path.push({ x, y });
    if (cell.kind === 'blocker') return { path, hit: 'blocker' };
    if (cell.kind === 'receiver') return { path, hit: 'receiver' };
    if (cell.kind === 'mirror') {
      const orientation = overrides?.[`${x},${y}`] ?? cell.orientation ?? 0;
      dir = reflect(dir, orientation);
    }
  }
  return { path, hit: 'exit' };
}

export function traceBeam(size: number, cells: LaserCell[], overrides?: Record<string, MirrorOrientation>): boolean {
  const grid = new Map<string, LaserCell>(cells.map((c) => [`${c.x},${c.y}`, c]));
  const emitter = cells.find((c) => c.kind === 'emitter')!;
  let x = emitter.x;
  let y = emitter.y;
  let dir = emitter.emitDir!;
  const maxSteps = size * size * 4;

  for (let step = 0; step < maxSteps; step++) {
    const [dx, dy] = DELTA[dir];
    x += dx;
    y += dy;
    if (!inBounds(size, x, y)) return false;
    const cell = grid.get(`${x},${y}`);
    if (!cell) return false;
    if (cell.kind === 'blocker') return false;
    if (cell.kind === 'receiver') return true;
    if (cell.kind === 'mirror') {
      const orientation = overrides?.[`${x},${y}`] ?? cell.orientation ?? 0;
      dir = reflect(dir, orientation);
    }
  }
  return false;
}

export const laserEngine: PuzzleEngine<LaserPuzzle, Record<string, MirrorOrientation>> = {
  type: 'laser',
  skill: 'spatialReasoning',

  generate(grade, rand, seed) {
    const params = GRADE_PARAMS[grade];
    let built: BuildResult | null = null;
    for (let attempt = 0; attempt < 60 && !built; attempt++) {
      built = buildLaser(grade, rand);
    }
    if (!built) {
      // extremely unlikely fallback: minimal straight-line puzzle
      built = { size: params.size, minRotations: 0, cells: [] };
    }

    return {
      id: `laser-${seed}`,
      type: 'laser',
      grade,
      seed,
      timeLimitSec: params.timeLimitSec,
      attempts: params.attempts,
      size: built.size,
      cells: built.cells,
      moveBudget: built.minRotations + params.slack,
      maxBeamTests: params.maxBeamTests,
    };
  },

  validate(puzzle, answer): ValidationResult {
    const correct = traceBeam(puzzle.size, puzzle.cells, answer);
    return { correct };
  },

  getHint(puzzle, tier): HintPayload {
    const pathMirrors = puzzle.cells.filter((c) => c.kind === 'mirror' && c.solvedOrientation !== undefined);
    const wrong = pathMirrors.filter((c) => c.orientation !== c.solvedOrientation);
    if (tier === 1) {
      return { text: `${wrong.length} mirror(s) on the true path still need rotating.` };
    }
    const target = wrong[0];
    if (!target) return { text: 'All path mirrors are already correctly oriented.' };
    return {
      text: `The mirror at (${target.x + 1}, ${target.y + 1}) should be "${target.solvedOrientation === 0 ? '/' : '\\'}".`,
      reveal: { x: target.x, y: target.y, orientation: target.solvedOrientation },
    };
  },

  describeSolution(puzzle) {
    const receiver = puzzle.cells.find((c) => c.kind === 'receiver');
    return `Route the beam from the emitter to the receiver at (${(receiver?.x ?? 0) + 1}, ${(receiver?.y ?? 0) + 1}) by setting every path mirror to its solved orientation.`;
  },
};

registerEngine(laserEngine);
