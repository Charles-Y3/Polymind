import { useState } from 'react';
import { Delete } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { KeypadPuzzle } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

export function KeypadLock({ puzzle, disabled, onSubmit }: { puzzle: KeypadPuzzle; disabled: boolean; onSubmit: (answer: number[]) => void }) {
  const { t } = useI18n();
  const [values, setValues] = useState<string[]>(() => Array(puzzle.predictCount).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);

  const canSubmit = values.every((v) => v.trim() !== '' && v !== '-' && !Number.isNaN(Number(v)));

  const setActiveValue = (updater: (v: string) => string) => {
    setValues((prev) => prev.map((old, idx) => (idx === activeIndex ? updater(old) : old)));
  };

  const pressDigit = (d: string) => {
    if (disabled) return;
    sound.playClick();
    setActiveValue((v) => (v.length >= 8 ? v : v + d));
  };

  const pressBackspace = () => {
    if (disabled) return;
    sound.playClick();
    setActiveValue((v) => v.slice(0, -1));
  };

  const pressSign = () => {
    if (disabled) return;
    sound.playClick();
    setActiveValue((v) => (v.startsWith('-') ? v.slice(1) : `-${v}`));
  };

  const selectSlot = (i: number) => {
    if (disabled) return;
    setActiveIndex(i);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-sm text-slate-400 text-center">{t('keypad.instructions', { n: puzzle.predictCount })}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {puzzle.shown.map((v, i) => (
          <div key={i} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-bold text-slate-100">
            {v}
          </div>
        ))}
        {values.map((v, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => selectSlot(i)}
            className={`w-14 h-14 rounded-2xl bg-slate-950 border-2 flex items-center justify-center text-lg font-bold text-violet-200 transition-colors ${
              activeIndex === i ? 'border-violet-400 shadow-[0_0_0_3px_rgba(167,139,250,0.25)]' : 'border-dashed border-violet-500/60'
            }`}
          >
            {v || <span className="text-violet-500/40">?</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[16rem]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => pressDigit(d)}
            className="h-12 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-slate-100 hover:border-violet-500 active:scale-95 transition-transform"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={pressSign}
          className="h-12 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-slate-300 hover:border-violet-500 active:scale-95 transition-transform"
        >
          +/-
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => pressDigit('0')}
          className="h-12 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-slate-100 hover:border-violet-500 active:scale-95 transition-transform"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={pressBackspace}
          className="h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-violet-500 active:scale-95 transition-transform"
        >
          <Delete size={18} />
        </button>
      </div>

      <PrimaryButton accent={ACCENT} disabled={disabled || !canSubmit} onClick={() => onSubmit(values.map(Number))}>
        {t('keypad.submit')}
      </PrimaryButton>
    </div>
  );
}
