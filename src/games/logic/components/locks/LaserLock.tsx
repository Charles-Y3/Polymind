import { useEffect, useRef, useState } from 'react';
import { beamPath } from '../../engine/locks/laser';
import { useI18n } from '../../i18n/context';
import { LaserPuzzle, MirrorOrientation } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

type Dir = 'N' | 'S' | 'E' | 'W';
const OPPOSITE: Record<Dir, Dir> = { N: 'S', S: 'N', E: 'W', W: 'E' };
// Point on the cell's border in the direction itself, in a 0-100 square
const EDGE_POINT: Record<Dir, [number, number]> = { N: [50, 4], S: [50, 96], E: [96, 50], W: [4, 50] };

function dirBetween(a: { x: number; y: number }, b: { x: number; y: number }): Dir {
  if (b.x > a.x) return 'E';
  if (b.x < a.x) return 'W';
  return b.y > a.y ? 'S' : 'N';
}

// For every cell the beam passes through, compute the polyline (in 0-100 coords)
// tracing its path across that cell, so the beam reads as an actual line, not a flat tint.
function buildBeamSegments(
  path: { x: number; y: number }[],
  emitDir: Dir,
  hit: 'receiver' | 'blocker' | 'exit'
): Map<string, [number, number][]> {
  const segments = new Map<string, [number, number][]>();
  for (let i = 0; i < path.length; i++) {
    const cur = path[i];
    const outDir = i < path.length - 1 ? dirBetween(cur, path[i + 1]) : undefined;
    const inDir = i === 0 ? emitDir : dirBetween(path[i - 1], cur);

    const points: [number, number][] = [];
    if (i === 0) {
      points.push([50, 50]);
    } else {
      points.push(EDGE_POINT[OPPOSITE[inDir]]);
      points.push([50, 50]);
    }
    if (outDir) {
      points.push(EDGE_POINT[outDir]);
    } else if (i === path.length - 1 && hit === 'exit') {
      points.push(EDGE_POINT[inDir]);
    }
    segments.set(`${cur.x},${cur.y}`, points);
  }
  return segments;
}

function CellIcon({
  kind,
  emitDir,
  orientation,
  lit,
  locked,
}: {
  kind: string;
  emitDir?: Dir;
  orientation?: MirrorOrientation;
  lit: boolean;
  locked?: boolean;
}) {
  if (kind === 'emitter') {
    const rotation = { N: 0, E: 90, S: 180, W: 270 }[emitDir ?? 'N'];
    return (
      <div className="absolute inset-[15%] rounded-full bg-cyan-500/25 border-2 border-cyan-400 flex items-center justify-center">
        <div
          className="w-0 h-0"
          style={{
            transform: `rotate(${rotation}deg)`,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: '12px solid #22d3ee',
          }}
        />
      </div>
    );
  }
  if (kind === 'receiver') {
    return (
      <div
        className={`absolute inset-[12%] rounded-full border-2 flex items-center justify-center transition-colors ${
          lit ? 'border-emerald-300 bg-emerald-400/30' : 'border-emerald-500/60 bg-emerald-500/10'
        }`}
      >
        <div className={`w-2/5 h-2/5 rounded-full ${lit ? 'bg-emerald-300' : 'bg-emerald-500/50'}`} />
      </div>
    );
  }
  if (kind === 'blocker') {
    return <div className="absolute inset-[10%] rounded-md bg-slate-700 border border-slate-600" />;
  }
  if (kind === 'mirror') {
    const rotation = orientation === 0 ? -45 : 45;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[130%] h-[10%] rounded-full ${
            locked
              ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]'
              : 'bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 shadow-[0_0_8px_rgba(216,180,254,0.7)]'
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
    );
  }
  return null;
}

const BEAM_TEST_REVEAL_MS = 1800;

export function LaserLock({
  puzzle,
  disabled,
  onSubmit,
}: {
  puzzle: LaserPuzzle;
  disabled: boolean;
  onSubmit: (answer: Record<string, MirrorOrientation>) => void;
}) {
  const { t } = useI18n();
  const [overrides, setOverrides] = useState<Record<string, MirrorOrientation>>(() => {
    const init: Record<string, MirrorOrientation> = {};
    puzzle.cells.forEach((c) => {
      if (c.kind === 'mirror') init[`${c.x},${c.y}`] = c.orientation ?? 0;
    });
    return init;
  });
  const [movesLeft, setMovesLeft] = useState(puzzle.moveBudget);

  const limitedBeam = typeof puzzle.maxBeamTests === 'number';
  const [beamTestsLeft, setBeamTestsLeft] = useState(puzzle.maxBeamTests ?? 0);
  const [beamVisible, setBeamVisible] = useState(!limitedBeam);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (revealTimer.current) window.clearTimeout(revealTimer.current);
  }, []);

  const { path, hit } = beamPath(puzzle.size, puzzle.cells, overrides);
  const onPath = beamVisible ? new Set(path.map((p) => `${p.x},${p.y}`)) : new Set<string>();
  const emitter = puzzle.cells.find((c) => c.kind === 'emitter');
  const beamSegments = emitter && beamVisible ? buildBeamSegments(path, emitter.emitDir as Dir, hit) : new Map();

  const handleTestBeam = () => {
    if (disabled || beamTestsLeft <= 0) return;
    sound.playClick();
    setBeamTestsLeft((n) => n - 1);
    setBeamVisible(true);
    if (revealTimer.current) window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => setBeamVisible(false), BEAM_TEST_REVEAL_MS);
  };

  const handleRotate = (x: number, y: number, cellLocked?: boolean) => {
    if (disabled || movesLeft <= 0 || cellLocked) return;
    sound.playClick();
    const key = `${x},${y}`;
    const next = { ...overrides, [key]: (1 - (overrides[key] ?? 0)) as MirrorOrientation };
    setOverrides(next);
    setMovesLeft((m) => m - 1);
    // Running out of moves only disables further rotation — it never auto-submits.
    // The player always confirms with "Pull the Lever," win or lose, same as every
    // other lock, so they can see their configuration before the outcome is decided.
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-sm text-slate-400 text-center max-w-md">
        {t(limitedBeam ? 'laser.instructionsLimited' : 'laser.instructions')}
      </p>
      <div
        className="grid gap-1 bg-slate-950 p-2 rounded-2xl border border-slate-800 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          width: 'min(100%, 440px, 48vh)',
        }}
      >
        {Array.from({ length: puzzle.size * puzzle.size }, (_, idx) => {
          const x = idx % puzzle.size;
          const y = Math.floor(idx / puzzle.size);
          const cell = puzzle.cells.find((c) => c.x === x && c.y === y);
          const key = `${x},${y}`;
          const segment = beamSegments.get(key);
          const lit = onPath.has(key);
          const interactive = cell?.kind === 'mirror' && !cell.locked;

          return (
            <button
              key={idx}
              disabled={disabled || !interactive}
              onClick={() => handleRotate(x, y, cell?.locked)}
              className={`relative aspect-square w-full rounded-md transition-colors ${
                lit ? 'bg-amber-500/10' : 'bg-slate-900'
              } ${
                interactive
                  ? 'border border-violet-500/50 bg-violet-950/40 hover:border-violet-400 hover:bg-violet-500/20 cursor-pointer'
                  : ''
              } ${cell?.kind === 'mirror' && cell.locked ? 'border border-slate-600/60 bg-slate-800/60 cursor-default' : ''} ${
                cell?.kind === 'blocker' ? 'bg-slate-800' : ''
              }`}
            >
              {segment && segment.length > 1 && (
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline
                    points={segment.map(([px, py]) => `${px},${py}`).join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.85))' }}
                  />
                </svg>
              )}
              {cell && (
                <CellIcon
                  kind={cell.kind}
                  emitDir={cell.emitDir as Dir}
                  orientation={overrides[key] ?? cell.orientation}
                  lit={lit}
                  locked={cell.locked}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="relative w-6 h-6 rounded bg-slate-900 shrink-0">
            <CellIcon kind="emitter" emitDir="E" lit={false} />
          </span>
          {t('laser.legend.emitter')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-6 h-6 rounded bg-slate-900 shrink-0">
            <CellIcon kind="receiver" lit={false} />
          </span>
          {t('laser.legend.receiver')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-6 h-6 rounded bg-slate-900 shrink-0">
            <CellIcon kind="blocker" lit={false} />
          </span>
          {t('laser.legend.blocker')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-6 h-6 rounded bg-violet-950/40 border border-violet-500/50 shrink-0">
            <CellIcon kind="mirror" orientation={0} lit={false} />
          </span>
          {t('laser.legend.mirror')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-6 h-6 rounded bg-slate-800/60 border border-slate-600/60 shrink-0">
            <CellIcon kind="mirror" orientation={0} lit={false} locked />
          </span>
          {t('laser.legend.locked')}
        </span>
      </div>
      {limitedBeam && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestBeam}
            disabled={disabled || beamTestsLeft <= 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-200 hover:bg-amber-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t('laser.testBeam')}
          </button>
          <span className="text-xs text-slate-500">{t('laser.testsLeft', { n: beamTestsLeft })}</span>
        </div>
      )}
      <p className="text-xs text-slate-400">{t('laser.movesLeft', { n: movesLeft })}</p>
      <PrimaryButton accent={ACCENT} disabled={disabled} onClick={() => onSubmit(overrides)}>
        {t('session.submit')}
      </PrimaryButton>
    </div>
  );
}
