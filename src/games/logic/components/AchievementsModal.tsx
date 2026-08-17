import React from 'react';
import { PlayerProgress } from '../types';
import { useI18n } from '../i18n/context';
import { sound } from '../utils/audio';
import { ACHIEVEMENTS } from '../data/achievements';
import { X, Award } from 'lucide-react';

interface AchievementsModalProps {
  progress: PlayerProgress;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ progress, onClose }) => {
  const { t } = useI18n();

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.getProgress(progress) >= a.progressMax).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-violet-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <Award className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-violet-200">
              {t('achievements.title')}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {t('achievements.unlocked', { count: unlockedCount, total: ACHIEVEMENTS.length })}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {ACHIEVEMENTS.map((ach) => {
            const current = ach.getProgress(progress);
            const isDone = current >= ach.progressMax;
            const percent = Math.min(100, Math.floor((current / ach.progressMax) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  isDone
                    ? 'bg-violet-950/30 border-violet-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div
                  className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-2xl border ${
                    isDone
                      ? 'bg-violet-500/20 border-violet-500/50 shadow-md shadow-violet-500/20'
                      : 'bg-slate-800/80 border-slate-700 opacity-60'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span>{t(ach.titleKey)}</span>
                    {isDone && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                        {t('achievements.done')}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {t(ach.descKey)}
                  </p>

                  {!isDone && (
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-violet-400 rounded-full"
                        style={{ width: `${percent}%` }}
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
