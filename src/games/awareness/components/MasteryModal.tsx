import React from 'react';
import { Language, PlayerProfile } from '../types';
import { masteryRanks, translations } from '../utils/i18n';
import { calculateMasteryLevel } from '../utils/storage';

interface MasteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  language: Language;
}

export const MasteryModal: React.FC<MasteryModalProps> = ({
  isOpen,
  onClose,
  profile,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const currentMastery = calculateMasteryLevel(profile.xp);

  return (
    <div
      id="mastery-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="mastery-modal-card"
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎖️</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {t.mastery}
            </h2>
          </div>
          <button
            id="close-mastery-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Current Level Status Card */}
        <div className="p-4 my-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block font-bold">
                {t.currentMasteryStatus}
              </span>
              <h3 className="text-xl font-bold text-slate-100">
                {currentMastery.rank.title[language]} · Lv.{currentMastery.level}
              </h3>
            </div>
            <span className="text-2xl font-mono font-black text-cyan-300">
              {profile.xp.toLocaleString()} XP
            </span>
          </div>

          {currentMastery.nextRank && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>{t.nextRankLabel}: {currentMastery.nextRank.title[language]}</span>
                <span>{currentMastery.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${currentMastery.progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 10 Mastery Tiers Ladder */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
          {masteryRanks.map((rank) => {
            const isUnlocked = profile.xp >= rank.minXp;
            const isCurrent = currentMastery.level === rank.level;

            return (
              <div
                key={rank.level}
                id={`mastery-rank-row-${rank.level}`}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                    : isUnlocked
                    ? 'bg-slate-950/60 border-slate-800/80'
                    : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border ${rank.badgeColor}`}
                  >
                    {rank.level}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span>{rank.title[language]}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {t.activeBadge}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {rank.description[language]}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className={isUnlocked ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                    {rank.minXp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
