import React from 'react';
import { MindProfile } from '../types';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Brain, Star, Trophy, X } from 'lucide-react';

interface MindProfileModalProps {
  mindProfile: MindProfile;
  totalScore: number;
  onClose: () => void;
}

export const MindProfileModal: React.FC<MindProfileModalProps> = ({
  mindProfile,
  totalScore,
  onClose,
}) => {
  const { t } = useI18n();

  const skills = [
    { label: t('mind.patternRecognition'), val: mindProfile.patternRecognition, color: 'bg-cyan-500', icon: '🔍' },
    { label: t('mind.deduction'), val: mindProfile.deduction, color: 'bg-blue-500', icon: '🎯' },
    { label: t('mind.hypothesisTesting'), val: mindProfile.hypothesisTesting, color: 'bg-amber-500', icon: '🧪' },
    { label: t('mind.logicalConditions'), val: mindProfile.logicalConditions, color: 'bg-rose-500', icon: '🔀' },
    { label: t('mind.abstractThinking'), val: mindProfile.abstractThinking, color: 'bg-purple-500', icon: '🌌' },
    { label: t('mind.problemSolving'), val: mindProfile.problemSolving, color: 'bg-emerald-500', icon: '⚙️' },
  ];

  // Helper to calculate star rating 1 to 5
  const getStars = (val: number) => {
    const starCount = Math.min(5, Math.max(1, Math.ceil(val / 20)));
    return Array.from({ length: 5 }, (_, i) => i < starCount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Brain className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-purple-200">
              {t('mind.title')}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {t('mind.subtitle')}
            </p>
          </div>
        </div>

        {/* Cognitive Skill Bars */}
        <div className="space-y-3.5 my-2">
          {skills.map((s, idx) => {
            const stars = getStars(s.val);
            return (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {stars.map((filled, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-3.5 h-3.5 ${
                          filled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${s.color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(5, s.val))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>{t('mind.totalPoints')} <strong className="text-cyan-300">{totalScore}</strong></span>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-bold font-mono text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            {t('mind.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
