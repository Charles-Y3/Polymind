import { useState } from 'react';
import { scoreGuess } from '../../engine/locks/combination';
import { useI18n } from '../../i18n/context';
import { CombinationPuzzle } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

export function CombinationLock({ puzzle, disabled, onSubmit }: { puzzle: CombinationPuzzle; disabled: boolean; onSubmit: (answer: string[]) => void }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState<string[]>(() => Array(puzzle.length).fill(puzzle.symbols[0]));
  const [history, setHistory] = useState<{ guess: string[]; exact: number; partial: number }[]>([]);

  const cycle = (idx: number) => {
    sound.playClick();
    const symIdx = puzzle.symbols.indexOf(current[idx]);
    const next = puzzle.symbols[(symIdx + 1) % puzzle.symbols.length];
    setCurrent(current.map((v, i) => (i === idx ? next : v)));
  };

  const handleGuess = () => {
    sound.playClick();
    const { exact, partial } = scoreGuess(puzzle.code, current);
    setHistory([{ guess: [...current], exact, partial }, ...history]);
    onSubmit(current);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-400">{t('combination.instructions', { n: puzzle.length })}</p>

      <div className="flex items-center gap-2">
        {current.map((sym, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => cycle(i)}
            className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-700 text-2xl flex items-center justify-center hover:border-violet-500"
          >
            {sym}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <PrimaryButton accent={ACCENT} disabled={disabled} onClick={handleGuess}>
          {t('combination.guess')}
        </PrimaryButton>
        <span className="text-xs text-slate-500">{t('combination.guessesLeft', { n: Math.max(0, puzzle.maxGuesses - history.length) })}</span>
      </div>

      <p className="text-xs text-slate-500">{t('combination.legend')}</p>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-sm bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="flex gap-1">{h.guess.map((s, j) => <span key={j}>{s}</span>)}</span>
            <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
              {Array.from({ length: h.exact }).map((_, k) => <span key={`e${k}`} className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />)}
              {Array.from({ length: h.partial }).map((_, k) => <span key={`p${k}`} className="w-2 h-2 rounded-full border border-slate-400 inline-block" />)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
