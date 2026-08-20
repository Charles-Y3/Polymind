import { X } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { LOCK_TYPES, PlayerProgress } from '../types';
import { HEISTS } from '../data/heists';

interface PersonalBestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function PersonalBestsModal({ isOpen, onClose, progress }: PersonalBestsModalProps) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-100">{t('bests.title')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 -mr-1 pr-1">
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">{t('bests.gauntlet')}</span>
          <span className="text-sm font-bold text-amber-300">{progress.gauntletBest || '—'}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('bests.heists')}</span>
          {HEISTS.map((heist) => {
            const record = progress.heists[heist.id];
            return (
              <div key={heist.id} className="rounded-2xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between gap-2">
                <span className="text-sm text-slate-300 flex items-center gap-1.5">
                  <span>{heist.emoji}</span>
                  {heist.name}
                </span>
                {record ? (
                  <span className="text-xs text-slate-400 text-right shrink-0">
                    <span className="text-amber-300">{'⭐'.repeat(record.stars)}{'☆'.repeat(3 - record.stars)}</span>
                    {' · '}
                    {t('bests.score')}: <span className="text-violet-300 font-bold">{record.bestScore}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-600 shrink-0">{t('bests.notAttempted')}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {LOCK_TYPES.map((type) => {
            const best = progress.bests[type];
            return (
              <div key={type} className="rounded-2xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between">
                <span className="text-sm text-slate-300">{t(`lock.${type}.name` as any)}</span>
                {best ? (
                  <span className="text-xs text-slate-400">
                    {t('bests.bestTime')}: <span className="text-violet-300 font-bold">{formatTime(best.bestTimeMs)}</span> · {t('bests.cracks')}: {best.cracks}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">{t('bests.none')}</span>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
