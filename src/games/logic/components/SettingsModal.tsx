import { useI18n } from '../i18n/context';
import { PlayerProgress } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
  onUpdateSettings: (settings: PlayerProgress['settings']) => void;
  onResetProgress: () => void;
}

export function SettingsModal({ isOpen, onClose, progress, onUpdateSettings, onResetProgress }: SettingsModalProps) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-100">{t('settings.title')}</h2>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{t('settings.sound')}</span>
          <button
            onClick={() => onUpdateSettings({ ...progress.settings, sound: !progress.settings.sound })}
            className={`w-11 h-6 rounded-full transition-colors relative ${progress.settings.sound ? 'bg-violet-500' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${progress.settings.sound ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{t('settings.reducedMotion')}</span>
          <button
            onClick={() => onUpdateSettings({ ...progress.settings, reducedMotion: !progress.settings.reducedMotion })}
            className={`w-11 h-6 rounded-full transition-colors relative ${progress.settings.reducedMotion ? 'bg-violet-500' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${progress.settings.reducedMotion ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <button onClick={onResetProgress} className="text-xs text-red-400 hover:text-red-300 mt-2">
          {t('settings.resetProgress')}
        </button>

        <button onClick={onClose} className="rounded-2xl bg-slate-800 border border-slate-700 py-2.5 text-sm font-bold text-slate-300 mt-1">
          {t('settings.close')}
        </button>
      </div>
    </div>
  );
}
