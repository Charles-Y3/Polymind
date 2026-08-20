import { X } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { PlayerProgress, SkillAxis } from '../types';

const AXES: SkillAxis[] = ['patternRecognition', 'deduction', 'circuitLogic', 'hypothesisTesting', 'spatialReasoning', 'ruleInference'];

interface MindProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
}

export function MindProfileModal({ isOpen, onClose, progress }: MindProfileModalProps) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">{t('mindprofile.title')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {AXES.map((axis) => {
            const value = progress.mindProfile[axis] ?? 30;
            return (
              <div key={axis}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">{t(`axis.${axis}` as any)}</span>
                  <span className="text-violet-300 font-bold">{value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
