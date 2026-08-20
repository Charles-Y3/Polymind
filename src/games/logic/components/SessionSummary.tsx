import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n/context';
import { LockResult, PlayModeId } from '../types';
import { PrimaryButton } from '../../../ui';
import { sound } from '../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

interface SessionSummaryProps {
  results: LockResult[];
  playMode: PlayModeId;
  stars?: number;
  bustedRun?: boolean;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

export function SessionSummary({ results, playMode, stars, bustedRun, onPlayAgain, onBackToMenu }: SessionSummaryProps) {
  const { t } = useI18n();
  const cracked = results.filter((r) => r.cracked).length;
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const perfectRun = !bustedRun && results.length > 0 && results.every((r) => r.cleanCrack);
  const fired = useRef(false);

  const displayScore = useCountUp(totalScore);
  const displayCracked = useCountUp(cracked);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (!bustedRun) {
      sound.playCrack();
      confetti({
        particleCount: perfectRun ? 130 : 80,
        spread: perfectRun ? 100 : 70,
        origin: { y: 0.55 },
      });
    } else {
      sound.playBust();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="text-5xl"
      >
        {bustedRun ? '🚨' : perfectRun ? '👑' : '🏆'}
      </motion.div>
      <h1 className="text-2xl font-black text-slate-100">{t('summary.title')}</h1>

      {perfectRun && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5"
        >
          {t('summary.perfectRun')}
        </motion.p>
      )}

      <div className="flex gap-6">
        <div>
          <div className="text-3xl font-black text-emerald-300 font-mono tabular-nums">
            {displayCracked}/{results.length}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">{t('summary.locksCracked')}</div>
        </div>
        <div>
          <div className="text-3xl font-black text-violet-300 font-mono tabular-nums">{displayScore}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">{t('summary.totalScore')}</div>
        </div>
        {playMode === 'heist' && stars !== undefined && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}>
            <div className="text-3xl font-black text-amber-300">{'⭐'.repeat(stars) || '—'}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">{t('summary.stars')}</div>
          </motion.div>
        )}
      </div>

      {bustedRun && <p className="text-sm text-red-300">{t(playMode === 'gauntlet' ? 'summary.gauntletBust' : 'summary.heistBust')}</p>}

      {results.length > 0 && (
        <div className="w-full max-w-sm flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 text-left">{t('summary.breakdown')}</span>
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 flex items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 text-sm text-slate-200">
                <span>{r.cracked ? '🔓' : '🚨'}</span>
                {t(`lock.${r.type}.name` as any)}
                {r.cleanCrack && <span className="text-[10px] text-amber-300 font-bold">✦ {t('summary.cleanCrack')}</span>}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {r.score} · {(r.timeMs / 1000).toFixed(1)}s
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBackToMenu} className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold text-slate-300">
          {t('summary.backToMenu')}
        </button>
        <PrimaryButton accent={ACCENT} onClick={onPlayAgain}>
          {t('summary.playAgain')}
        </PrimaryButton>
      </div>
    </div>
  );
}
