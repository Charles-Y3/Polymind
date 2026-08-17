import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, ShieldCheck, Target, X } from 'lucide-react';
import { Language, PlayerStats } from '../types';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface StreakInfoModalProps {
  stats: PlayerStats;
  language: Language;
  onClose: () => void;
}

export const StreakInfoModal: React.FC<StreakInfoModalProps> = ({ stats, language, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-orange-400 font-extrabold text-sm uppercase tracking-wider">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-400" />
            <span>{t(language, 'streakInfoTitle')}</span>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-slate-200">
          {/* Current vs Best Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center space-y-1">
              <div className="text-[11px] font-bold text-orange-300 uppercase tracking-wider">
                {t(language, 'currentStreakLabel')}
              </div>
              <div className="text-3xl font-black text-orange-400 font-mono flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 fill-orange-500" />
                <span>{stats.currentStreak}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                {t(language, 'bestStreakLabel')}
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <Trophy className="w-6 h-6 fill-amber-500 text-amber-400" />
                <span>{stats.bestStreak}</span>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-xs leading-relaxed">
            <p className="text-slate-300">{t(language, 'streakInfoDesc')}</p>

            <div className="space-y-2 pt-1 border-t border-slate-700/60">
              <div className="font-bold text-amber-300 text-xs">
                {t(language, 'streakBenefitsTitle')}
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{t(language, 'streakBenefit1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{t(language, 'streakBenefit2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t(language, 'streakBenefit3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer close */}
        <div className="pt-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-all border border-slate-700"
          >
            {t(language, 'close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
