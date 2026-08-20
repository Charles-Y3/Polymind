import { Lock } from 'lucide-react';
import { HEISTS } from '../data/heists';
import { useI18n } from '../i18n/context';
import { HeistDefinition, PlayerProgress } from '../types';
import { Card } from '../../../ui';

interface HeistSelectProps {
  progress: PlayerProgress;
  onSelect: (heist: HeistDefinition) => void;
  onBack: () => void;
}

export function HeistSelect({ progress, onSelect, onBack }: HeistSelectProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('heist.select')}</h2>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-200">
          ← {t('summary.backToMenu')}
        </button>
      </div>

      {HEISTS.map((heist, i) => {
        const prevStars = i === 0 ? 1 : progress.heists[HEISTS[i - 1].id]?.stars ?? 0;
        const unlocked = i === 0 || prevStars > 0;
        const stars = progress.heists[heist.id]?.stars ?? 0;

        return (
          <button key={heist.id} onClick={() => unlocked && onSelect(heist)} disabled={!unlocked} className="text-left disabled:opacity-40 disabled:cursor-not-allowed">
            <Card className="p-4 flex items-center gap-4 hover:border-violet-500/50 transition-colors">
              <div className="text-3xl">{unlocked ? heist.emoji : <Lock size={26} className="text-slate-600" />}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-100">{heist.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{unlocked ? t('heist.stars', { n: stars }) : t('heist.locked')}</div>
              </div>
              {unlocked && <div className="text-amber-300 text-sm">{'⭐'.repeat(stars) || '·'}</div>}
            </Card>
          </button>
        );
      })}
    </div>
  );
}
