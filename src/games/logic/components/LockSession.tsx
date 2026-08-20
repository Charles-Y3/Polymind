import { AlertTriangle, Lightbulb, Timer, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getEngine } from '../engine/locks';
import { createPrng, randomSeed } from '../engine/rng';
import { ALARM_COST, computeScore, LOCKPICK_ALLOWANCE } from '../engine/scoring';
import { useI18n } from '../i18n/context';
import { sound } from '../utils/audio';
import { Grade, HintPayload, LockPuzzle, LockResult, LockType, SKILL_BY_TYPE, ValidationResult } from '../types';
import { StatChip } from '../../../ui';
import { CircuitLock } from './locks/CircuitLock';
import { CombinationLock } from './locks/CombinationLock';
import { KeypadLock } from './locks/KeypadLock';
import { LaserLock } from './locks/LaserLock';
import { RuleSnapLock } from './locks/RuleSnapLock';
import { TumblerLock } from './locks/TumblerLock';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

interface LockSessionProps {
  type: LockType;
  grade: Grade;
  seed?: string;
  alarm: number;
  onAlarmChange: (next: number) => void;
  streak: number;
  lockpicksAvailable: number;
  onHintUsed: () => void;
  modeMult?: number;
  onResult: (result: LockResult) => void;
  onQuit: () => void;
}

export function LockSession({
  type,
  grade,
  seed,
  alarm,
  onAlarmChange,
  streak,
  lockpicksAvailable,
  onHintUsed,
  modeMult,
  onResult,
  onQuit,
}: LockSessionProps) {
  const { t } = useI18n();
  const finalSeed = useMemo(() => seed ?? randomSeed(), [seed]);
  const puzzle = useMemo<LockPuzzle>(() => {
    const rng = createPrng(finalSeed);
    return getEngine(type).generate(grade, rng, finalSeed);
  }, [type, grade, finalSeed]);

  const [status, setStatus] = useState<'playing' | 'resolved'>('playing');
  const [attemptsLeft, setAttemptsLeft] = useState(puzzle.attempts);
  const [wastedAttempts, setWastedAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hint, setHint] = useState<HintPayload | null>(null);
  const [timeLeft, setTimeLeft] = useState(puzzle.timeLimitSec);
  const [message, setMessage] = useState<string | null>(null);
  const resolvedRef = useRef(false);
  const startRef = useRef(Date.now());

  const gradeAllowance = LOCKPICK_ALLOWANCE[grade];
  const hintCap = Math.min(2, gradeAllowance, lockpicksAvailable);

  const finalize = (validation: ValidationResult) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setStatus('resolved');
    if (validation.correct) sound.playCrack();
    else sound.playBust();
    const timeTakenSec = puzzle.timeLimitSec - timeLeft;
    const score = validation.correct
      ? computeScore({
          type,
          grade,
          timeLimitSec: puzzle.timeLimitSec,
          timeTakenSec,
          hintsUsed,
          wastedAttempts,
          streak,
          modeMult,
        })
      : 0;
    onResult({
      type,
      grade,
      cracked: validation.correct,
      score,
      hintsUsed,
      attemptsUsed: puzzle.attempts - attemptsLeft + (validation.correct ? 0 : 1),
      timeMs: Date.now() - startRef.current,
      cleanCrack: validation.correct && hintsUsed === 0 && wastedAttempts === 0,
      ruleDescription: getEngine(type).describeSolution(puzzle),
    });
  };

  const handleBustOrFail = () => {
    finalize({ correct: false });
  };

  const handleSubmit = (answer: any) => {
    if (status !== 'playing') return;
    const validation = getEngine(type).validate(puzzle, answer);
    if (validation.correct) {
      finalize(validation);
      return;
    }
    const nextAttempts = attemptsLeft - 1;
    const nextWasted = wastedAttempts + 1;
    setAttemptsLeft(nextAttempts);
    setWastedAttempts(nextWasted);
    const nextAlarm = Math.min(100, alarm + ALARM_COST[grade]);
    onAlarmChange(nextAlarm);
    if (nextAlarm >= 100 || nextAttempts <= 0) {
      finalize({ correct: false });
      return;
    }
    setMessage(t('session.wrongTryAgain'));
    window.setTimeout(() => setMessage(null), 1400);
  };

  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) {
      handleBustOrFail();
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status]);

  const handleHint = () => {
    if (hintsUsed >= hintCap || status !== 'playing') return;
    const nextTier = (hintsUsed + 1) as 1 | 2;
    const payload = getEngine(type).getHint(puzzle, nextTier);
    setHint(payload);
    setHintsUsed(hintsUsed + 1);
    sound.playHint();
    onHintUsed();
  };

  const timeCritical = timeLeft <= Math.max(5, Math.floor(puzzle.timeLimitSec * 0.15));

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <StatChip icon={<Timer size={14} />} value={`${timeLeft}s`} label={t('session.time')} accent={timeCritical ? { from: '', to: '', text: 'text-red-400', ring: '' } : ACCENT} />
          <StatChip icon={<AlertTriangle size={14} />} value={`${Math.round(alarm)}%`} label={t('session.alarm')} accent={alarm > 60 ? { from: '', to: '', text: 'text-red-400', ring: '' } : ACCENT} />
          {type !== 'rulesnap' && <StatChip icon="🔁" value={attemptsLeft} label={t('session.attempts')} />}
          <button
            onClick={handleHint}
            disabled={hintsUsed >= hintCap || status !== 'playing'}
            className="flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
            title={hintCap === 0 ? t('session.noHints') : t('session.hintsLeft', { n: hintCap - hintsUsed })}
          >
            <Lightbulb size={14} /> {t('session.hint')} ({hintCap - hintsUsed})
          </button>
        </div>
        <button onClick={onQuit} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-full">
          <X size={18} />
        </button>
      </div>

      {hint && (
        <div className="mx-4 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-200 flex items-center justify-between">
          <span>{hint.text}</span>
          <button onClick={() => setHint(null)} className="text-amber-400 hover:text-amber-200 ml-2">
            <X size={14} />
          </button>
        </div>
      )}
      {message && (
        <div className="mx-4 mt-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-200 text-center">{message}</div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {type === 'keypad' && <KeypadLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
        {type === 'tumbler' && <TumblerLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
        {type === 'circuit' && <CircuitLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
        {type === 'combination' && <CombinationLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
        {type === 'laser' && <LaserLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
        {type === 'rulesnap' && <RuleSnapLock puzzle={puzzle as any} disabled={status !== 'playing'} onSubmit={handleSubmit} />}
      </div>
    </div>
  );
}

export { SKILL_BY_TYPE };
