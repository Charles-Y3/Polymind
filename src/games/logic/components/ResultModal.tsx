import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n/context';
import { LockResult, LockType } from '../types';
import { explainLock } from '../utils/ai';
import { PrimaryButton } from '../../../ui';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };
const EXPLAIN_TYPES: LockType[] = ['keypad', 'tumbler', 'rulesnap'];

interface ResultModalProps {
  result: LockResult;
  showBankOrPush?: boolean;
  gauntletBanked?: number;
  nextLabel: string;
  onNext: () => void;
  onBank?: () => void;
  onPush?: () => void;
}

export function ResultModal({ result, showBankOrPush, gauntletBanked, nextLabel, onNext, onBank, onPush }: ResultModalProps) {
  const { t, language } = useI18n();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (result.cracked) {
      confetti({ particleCount: result.cleanCrack ? 60 : 40, spread: 55, origin: { y: 0.4 }, scalar: 0.8 });
    }
  }, [result.cracked, result.cleanCrack]);

  const handleExplain = async () => {
    setLoadingExplain(true);
    const text = await explainLock(result, language);
    setExplanation(text);
    setLoadingExplain(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col items-center gap-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="text-4xl"
        >
          {result.cracked ? '🔓' : '🚨'}
        </motion.div>
        <h2 className={`text-xl font-black ${result.cracked ? 'text-emerald-300' : 'text-red-300'}`}>
          {result.cracked ? t('result.title.cracked') : t('result.title.busted')}
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>{t('result.score')}:</span>
          <span className="font-bold text-violet-300">{result.score}</span>
        </div>

        {EXPLAIN_TYPES.includes(result.type) && (
          <div className="w-full">
            {explanation ? (
              <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">{explanation}</p>
            ) : (
              <button onClick={handleExplain} disabled={loadingExplain} className="text-xs font-semibold text-violet-300 hover:text-violet-200 disabled:opacity-50">
                {loadingExplain ? '…' : t('result.explain')}
              </button>
            )}
          </div>
        )}

        {showBankOrPush && result.cracked ? (
          <div className="w-full flex flex-col gap-2 mt-2">
            <p className="text-xs text-slate-400">{t('summary.bankOrPush.title')}</p>
            <p className="text-xs text-slate-500">{t('summary.gauntletBanked', { n: gauntletBanked ?? 0 })}</p>
            <div className="flex gap-2">
              <button onClick={onBank} className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 py-2.5 text-sm font-bold text-slate-200">
                {t('summary.bankOrPush.bank')}
              </button>
              <PrimaryButton accent={ACCENT} onClick={onPush ?? (() => {})} fullWidth>
                {t('summary.bankOrPush.push')}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <PrimaryButton accent={ACCENT} onClick={onNext} fullWidth>
            {nextLabel}
          </PrimaryButton>
        )}
      </motion.div>
    </div>
  );
}
