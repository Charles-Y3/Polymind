import React from 'react';
import { Language, PlayerProfile } from '../types';
import { translations } from '../utils/i18n';
import { achievementsList } from '../utils/storage';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  language: Language;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  profile,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const unlockedCount = Object.keys(profile.completedAchievements || {}).length;

  return (
    <div
      id="achievements-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="achievements-modal-card"
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎖️</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {t.achievements}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
            {t.unlockedSummary.replace('{count}', String(unlockedCount)).replace('{total}', String(achievementsList.length))}
          </span>
          <button
            id="close-achievements-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-3">
          {achievementsList.map((ach) => {
            const isCompleted = !!profile.completedAchievements[ach.id];
            const currentProgress = isCompleted ? ach.progressMax : ach.getProgress(profile);
            const percent = Math.min(100, Math.floor((currentProgress / ach.progressMax) * 100));

            return (
              <div
                key={ach.id}
                id={`achievement-card-${ach.id}`}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/80 border-slate-700 opacity-60'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span>{ach.title[language]}</span>
                      {isCompleted && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {t.achievementDone}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[260px] leading-snug">
                      {ach.description[language]}
                    </p>

                    {!isCompleted && (
                      <div className="w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-amber-400">+{ach.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
