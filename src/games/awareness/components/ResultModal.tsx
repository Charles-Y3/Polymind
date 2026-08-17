import React from 'react';
import { Challenge, ChallengeResult, Language } from '../types';
import { skillLabels, translations } from '../utils/i18n';

interface ResultModalProps {
  result: ChallengeResult;
  challenge: Challenge;
  onNext: () => void;
  language: Language;
  isLastChallenge: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  challenge,
  onNext,
  language,
  isLastChallenge,
}) => {
  const t = translations[language];
  const skillInfo = skillLabels[challenge.skill];

  let explanationText = '';
  if (challenge.mode === 'notice') {
    explanationText = challenge.explanation[language] || challenge.explanation.en;
  } else if (challenge.mode === 'remember') {
    const correctOpt = challenge.options.find((o) => o.isCorrect);
    explanationText = `${challenge.question[language] || challenge.question.en} ➔ ${
      correctOpt?.label[language] || correctOpt?.label.en
    }`;
  } else if (challenge.mode === 'focus') {
    explanationText = `${t.focusMode}: ${challenge.targetRule.name[language] || challenge.targetRule.name.en}`;
  } else if (challenge.mode === 'shift') {
    explanationText = challenge.changeDescription[language] || challenge.changeDescription.en;
  } else if (challenge.mode === 'perceive') {
    explanationText = challenge.explanation[language] || challenge.explanation.en;
  }

  return (
    <div
      id="round-result-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="round-result-card"
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 border shadow-2xl flex flex-col items-center text-center transition-all ${
          result.isCorrect
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/40 shadow-emerald-950/50'
            : 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/40 shadow-rose-950/50'
        }`}
      >
        {/* Status Badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 shadow-lg ${
            result.isCorrect
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          {result.isCorrect ? '✓' : '✕'}
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mb-1">
          {result.isCorrect ? t.correct : t.wrong}
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-4">
          <span>{skillInfo.icon}</span>
          <span>{skillInfo.name[language]}</span>
          <span>·</span>
          <span>
            {t.difficulty} {challenge.difficulty}/10
          </span>
        </div>

        {/* Highlighted explanation */}
        <div className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 mb-5 text-left leading-relaxed">
          <span className="font-bold text-slate-200 block mb-1 text-[11px] uppercase tracking-wider">
            {language === 'en' ? 'Observation Fact' : language === 'zh-CN' ? '觉察要点' : '覺察要點'}:
          </span>
          {explanationText}
        </div>

        {/* Score & Multiplier Grid */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              {language === 'en' ? 'Time' : language === 'zh-CN' ? '用时' : '用時'}
            </span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {result.timeSpent.toFixed(2)}s
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              {t.streak}
            </span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {result.streak > 1 ? `×${result.streak}` : '×1'}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              {t.pointsEarned}
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                result.isCorrect ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              +{result.score}
            </span>
          </div>
        </div>

        {/* Next Button */}
        <button
          id="round-result-next-btn"
          autoFocus
          onClick={onNext}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base tracking-wide shadow-lg transition-all active:scale-98 cursor-pointer ${
            result.isCorrect
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-slate-900/50'
          }`}
        >
          {isLastChallenge ? t.viewSummary : t.nextChallenge} ➔
        </button>
      </div>
    </div>
  );
};
