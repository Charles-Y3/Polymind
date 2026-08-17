import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Flame, Target, Trophy, X, Compass } from 'lucide-react';
import { Language, PlayerStats } from '../types';
import { CATEGORIES } from '../data/categories';
import { getLevelInfo } from '../utils/storage';
import { t } from '../utils/i18n';

interface StatsModalProps {
  stats: PlayerStats;
  language: Language;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, language, onClose }) => {
  const levelInfo = getLevelInfo(stats.xp);
  const accuracyPercent =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">
                {t(language, 'stats')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {t(language, 'knowledgeMetrics')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Level Progress Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
              {levelInfo.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Level {levelInfo.level}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {stats.xp} XP
                </span>
              </div>
              <div className="text-base font-extrabold text-white">
                {language === 'zh-CN' ? levelInfo.titleZhSimp : language === 'zh-TW' ? levelInfo.titleZhTrad : levelInfo.title}
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <div className="text-xl font-black text-white font-mono">
                {stats.totalAnswered}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                {t(language, 'totalAnswered')}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <div className="text-xl font-black text-emerald-400 font-mono">
                {accuracyPercent}%
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                {t(language, 'accuracy')}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <div className="text-xl font-black text-orange-400 font-mono flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-orange-500" />
                {stats.currentStreak}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                {t(language, 'streak')}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <div className="text-xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                {stats.bestStreak}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                {t(language, 'bestStreak')}
              </div>
            </div>
          </div>

          {/* Category Mastery Breakdown */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{t(language, 'categoryMasteryTitle')}</span>
            </div>

            <div className="space-y-2">
              {CATEGORIES.map((c) => {
                const cStat = stats.categoryStats?.[c.id] || { attempted: 0, correct: 0 };
                const pct = cStat.attempted > 0 ? Math.round((cStat.correct / cStat.attempted) * 100) : 0;
                const cName =
                  language === 'zh-CN'
                    ? c.nameZhSimp
                    : language === 'zh-TW'
                    ? c.nameZhTrad
                    : c.name;

                return (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <span>{c.emoji}</span>
                        <span>{cName}</span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        {language.startsWith('zh')
                          ? `${cStat.correct} 次答对 / ${cStat.attempted} 次尝试 (正确率: ${pct}%)`
                          : `${cStat.correct} correct answers / ${cStat.attempted} total attempts (accuracy: ${pct}%)`}
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            {t(language, 'close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
