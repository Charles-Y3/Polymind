import { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { TumblerPuzzle } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

export function TumblerLock({ puzzle, disabled, onSubmit }: { puzzle: TumblerPuzzle; disabled: boolean; onSubmit: (answer: string[]) => void }) {
  const { t } = useI18n();
  const [assignment, setAssignment] = useState<(string | null)[]>(() => Array(puzzle.n).fill(null));

  const usedElsewhere = (slotIdx: number) => new Set(assignment.filter((_, i) => i !== slotIdx).filter(Boolean) as string[]);
  const filled = assignment.every(Boolean);
  const distinct = new Set(assignment).size === puzzle.n;

  const cycleSlot = (slot: number) => {
    if (disabled) return;
    sound.playClick();
    const used = usedElsewhere(slot);
    const available = puzzle.keys.filter((k) => !used.has(k.id));
    const options: (string | null)[] = [null, ...available.map((k) => k.id)];
    const currentIdx = options.indexOf(assignment[slot]);
    const next = options[(currentIdx + 1) % options.length];
    setAssignment(assignment.map((v, i) => (i === slot ? next : v)));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-400">{t('tumbler.instructions')}</p>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${puzzle.n}, minmax(0, 1fr))` }}>
        {assignment.map((val, slot) => {
          const key = val ? puzzle.keys.find((k) => k.id === val) : null;
          return (
            <div key={slot} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500 font-semibold">{t('tumbler.slot', { n: slot + 1 })}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => cycleSlot(slot)}
                className={`w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 text-center transition-colors ${
                  key ? 'bg-violet-950/40 border-violet-500/60 text-violet-100' : 'bg-slate-900 border-dashed border-slate-700 text-slate-500'
                } hover:border-violet-400 active:scale-95`}
              >
                {key ? (
                  <>
                    <span className="text-xl leading-none">{key.symbol}</span>
                    <span className="text-[9px] leading-tight px-1 line-clamp-1">{key.label}</span>
                  </>
                ) : (
                  <span className="text-lg">?</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-1.5">
        {puzzle.clues.map((clue, i) => (
          <p key={i} className="text-xs text-slate-300">
            • {t(`clue.${clue.type}` as any, { key: clue.key, key2: clue.key2 ?? '', slot: clue.slot ?? '' })}
          </p>
        ))}
      </div>

      <PrimaryButton accent={ACCENT} disabled={disabled || !filled || !distinct} onClick={() => onSubmit(assignment as string[])}>
        {t('session.submit')}
      </PrimaryButton>
    </div>
  );
}
