import { useState } from 'react';
import { useI18n } from '../i18n/context';
import { Grade, GRADES, LOCK_TYPES, LockType } from '../types';
import { PrimaryButton } from '../../../ui';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (type: LockType, grade: Grade) => void;
}

export function PracticeModal({ isOpen, onClose, onStart }: PracticeModalProps) {
  const { t } = useI18n();
  const [type, setType] = useState<LockType>('keypad');
  const [grade, setGrade] = useState<Grade>('brass');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-100">{t('menu.practice')}</h2>

        <div className="grid grid-cols-2 gap-2">
          {LOCK_TYPES.map((lt) => (
            <button
              key={lt}
              onClick={() => setType(lt)}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold border transition-colors ${
                type === lt ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {t(`lock.${lt}.name` as any)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`rounded-xl px-2 py-2 text-xs font-semibold border transition-colors ${
                grade === g ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {t(`grade.${g}` as any)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 py-2.5 text-sm font-bold text-slate-300">
            {t('settings.close')}
          </button>
          <PrimaryButton accent={ACCENT} fullWidth onClick={() => onStart(type, grade)}>
            {t('menu.play')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
