import { X } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useI18n } from '../i18n/context';
import { PlayerProgress } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
}

export function AchievementsModal({ isOpen, onClose, progress }: AchievementsModalProps) {
  const { t, language } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md max-h-[80vh] rounded-3xl bg-slate-900 border border-slate-700 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">{t('achievements.title')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const done = Boolean(progress.achievements[ach.id]);
            const current = ach.getProgress(progress);
            const pct = Math.min(100, Math.round((current / ach.progressMax) * 100));
            return (
              <div key={ach.id} className={`rounded-2xl border p-3 flex items-center gap-3 ${done ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-slate-800'}`}>
                <div className={`text-2xl ${done ? '' : 'grayscale opacity-40'}`}>{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-100">{ach.title[language]}</div>
                  <div className="text-xs text-slate-500">{ach.description[language]}</div>
                  {!done && (
                    <div className="w-full h-1 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                      <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
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
}
