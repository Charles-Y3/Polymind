import React, { useState } from 'react';
import { DifficultyTier, GameMode, Language } from '../types';
import { translations } from '../utils/i18n';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (mode: GameMode, tier: DifficultyTier) => void;
  language: Language;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  isOpen,
  onClose,
  onStartPractice,
  language,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('notice');
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('beginner');

  const t = translations[language];

  if (!isOpen) return null;

  const modes: { id: GameMode; icon: string; name: string; desc: string }[] = [
    { id: 'notice', icon: '👁️', name: t.noticeMode, desc: t.noticeDesc },
    { id: 'remember', icon: '🧠', name: t.rememberMode, desc: t.rememberDesc },
    { id: 'focus', icon: '🎯', name: t.focusMode, desc: t.focusDesc },
    { id: 'shift', icon: '🔄', name: t.shiftMode, desc: t.shiftDesc },
    { id: 'perceive', icon: '⚠️', name: t.perceiveMode, desc: t.perceiveDesc },
  ];

  const tiers: { id: DifficultyTier; label: string; desc: string }[] = [
    {
      id: 'beginner',
      label: t.beginner,
      desc: t.tierBeginnerDesc,
    },
    {
      id: 'advanced',
      label: t.advanced,
      desc: t.tierAdvancedDesc,
    },
    {
      id: 'expert',
      label: t.expert,
      desc: t.tierExpertDesc,
    },
  ];

  return (
    <div
      id="practice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="practice-modal-card"
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {t.practiceMode}
            </h2>
          </div>
          <button
            id="close-practice-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mode selection */}
        <div className="py-3">
          <label className="text-xs uppercase font-mono text-slate-400 font-bold block mb-2">
            {t.selectModeStep}
          </label>
          <div className="space-y-2">
            {modes.map((m) => (
              <button
                key={m.id}
                id={`practice-mode-${m.id}`}
                onClick={() => setSelectedMode(m.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  selectedMode === m.id
                    ? 'bg-cyan-950/50 border-cyan-500/60 ring-1 ring-cyan-500/50 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tier selection */}
        <div className="py-3 border-t border-slate-800">
          <label className="text-xs uppercase font-mono text-slate-400 font-bold block mb-2">
            {t.selectTierStep}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tiers.map((tr) => (
              <button
                key={tr.id}
                id={`practice-tier-${tr.id}`}
                onClick={() => setSelectedTier(tr.id)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                  selectedTier === tr.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold">{tr.label}</span>
                <span
                  className={`text-[10px] ${
                    selectedTier === tr.id ? 'text-slate-800 font-medium' : 'text-slate-500'
                  }`}
                >
                  {tr.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="pt-3">
          <button
            id="start-practice-session-btn"
            onClick={() => onStartPractice(selectedMode, selectedTier)}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {t.startChallenge} (5 {language === 'en' ? 'Rounds' : language === 'zh-CN' ? '题' : '題'}) ➔
          </button>
        </div>
      </div>
    </div>
  );
};
