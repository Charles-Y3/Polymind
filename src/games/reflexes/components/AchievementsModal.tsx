import React from 'react';
import { Achievement } from '../types';
import { Award, Lock, Check, X, Zap, ShieldCheck } from 'lucide-react';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedBoosts = achievements.filter((a) => a.isUnlocked && a.passiveBoost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Achievements & Perks</h2>
              <p className="text-xs text-slate-400">Unlock permanent passive gameplay boosts!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permanent Passive Boost Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400 fill-purple-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
              Active Permanent Passive Boosts ({unlockedBoosts.length}/{achievements.length})
            </h3>
          </div>

          {unlockedBoosts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {unlockedBoosts.map((ach) => (
                <span
                  key={ach.id}
                  className="px-2.5 py-1 rounded-xl bg-purple-900/80 border border-purple-400/50 text-purple-200 text-[11px] font-bold flex items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  {ach.passiveBoost.description}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No passive boosts active yet. Complete achievements below to unlock permanent stacking perks!
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {achievements.map((ach) => {
            const progressPercent = Math.min(Math.round((ach.progress / ach.maxProgress) * 100), 100);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  ach.isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0 ${
                    ach.isUnlocked
                      ? 'bg-amber-500/20 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-800 border-slate-700 grayscale opacity-50'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm tracking-tight truncate">{ach.title}</h3>
                    {ach.isUnlocked ? (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        {ach.progress}/{ach.maxProgress}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                  {/* Passive Boost Badge */}
                  {ach.passiveBoost && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                          ach.isUnlocked
                            ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>
                          {ach.isUnlocked ? 'Active Boost: ' : 'Unlock Boost: '}
                          {ach.passiveBoost.description}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {!ach.isUnlocked && (
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/50">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
