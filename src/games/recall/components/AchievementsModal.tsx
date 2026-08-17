import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Check, Lock, X, Sparkles } from 'lucide-react';
import { Achievement, Language } from '../types';
import { t } from '../utils/i18n';

interface AchievementsModalProps {
  achievements: Achievement[];
  language: Language;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  language,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

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
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">
                {t(language, 'achievements')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {unlockedCount} / {achievements.length} {t(language, 'unlockedBadge')}
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

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {achievements.map((ach) => {
            const title =
              language === 'zh-CN'
                ? ach.titleZhSimp
                : language === 'zh-TW'
                ? ach.titleZhTrad
                : ach.title;

            const desc =
              language === 'zh-CN'
                ? ach.descriptionZhSimp
                : language === 'zh-TW'
                ? ach.descriptionZhTrad
                : ach.description;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  ach.isUnlocked
                    ? 'bg-slate-800/80 border-amber-500/30 text-slate-100 shadow'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      ach.isUnlocked ? 'bg-amber-400/10 border border-amber-400/30' : 'bg-slate-800'
                    }`}
                  >
                    {ach.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">
                        {title}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {ach.isUnlocked ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-600 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            {t(language, 'done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
