import { Settings } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { PlayerProgress } from '../types';
import { StatChip, TopBar } from '../../../ui';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

interface NavbarProps {
  progress: PlayerProgress;
  onOpenSettings: () => void;
}

export function Navbar({ progress, onOpenSettings }: NavbarProps) {
  const { t } = useI18n();
  return (
    <TopBar
      title={t('brand.title')}
      icon="🔐"
      accent={ACCENT}
      rightSlot={
        <>
          <StatChip icon="🗝️" value={progress.lockpicks} label={t('nav.lockpicks')} accent={ACCENT} />
          <StatChip icon="💰" value={progress.totalScore} label={t('nav.loot')} accent={ACCENT} />
          <button onClick={onOpenSettings} className="p-2 rounded-full text-slate-400 hover:text-slate-200">
            <Settings size={18} />
          </button>
        </>
      }
    />
  );
}
