import React from 'react';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Lightbulb, X } from 'lucide-react';

interface HintDialogProps {
  hints: [string, string, string];
  hintsUsedCount: number;
  onUnlockNextHint: () => void;
  onClose: () => void;
}

export const HintDialog: React.FC<HintDialogProps> = ({
  hints,
  hintsUsedCount,
  onUnlockNextHint,
  onClose,
}) => {
  const { t } = useI18n();
  const nextCost = hintsUsedCount === 0 ? 10 : hintsUsedCount === 1 ? 20 : 30;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm uppercase">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>{t('hints.title')}</span>
        </div>

        <div className="space-y-3 my-2">
          {hints.map((hintText, idx) => {
            const isUnlocked = idx < hintsUsedCount;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border font-mono text-xs transition-all ${
                  isUnlocked
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">
                  {t('hints.hintNum', { num: idx + 1 })} {isUnlocked ? `• ${t('hints.unlocked')}` : `• ${t('hints.locked')}`}
                </div>
                <div>{isUnlocked ? hintText : t('hints.unlockPrompt')}</div>
              </div>
            );
          })}
        </div>

        {/* UNLOCK BUTTON */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <span className="text-xs text-slate-400 font-mono">
            {hintsUsedCount >= 3 ? t('hints.allUnlocked') : t('hints.cost', { cost: nextCost })}
          </span>

          <div className="flex items-center gap-2">
            {hintsUsedCount < 3 && (
              <button
                onClick={() => { sound.playHint(); onUnlockNextHint(); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{t('hints.unlockBtn', { num: hintsUsedCount + 1 })}</span>
              </button>
            )}

            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs rounded-xl transition-all"
            >
              {t('hints.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
