import React, { useEffect, useState } from 'react';
import { Language, RememberChallenge } from '../../types';
import { translations } from '../../utils/i18n';

interface RememberStageProps {
  challenge: RememberChallenge;
  onSelectOption: (option: RememberChallenge['options'][0]) => void;
  disabled: boolean;
  selectedOptionId?: string | null;
  language: Language;
  onMemorizeComplete?: () => void;
}

export const RememberStage: React.FC<RememberStageProps> = ({
  challenge,
  onSelectOption,
  disabled,
  selectedOptionId,
  language,
}) => {
  const t = translations[language];
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [timeLeft, setTimeLeft] = useState<number>(challenge.displayDuration);

  useEffect(() => {
    setPhase('memorize');
    setTimeLeft(challenge.displayDuration);

    const interval = 100; // 100ms interval for smooth progress
    const totalMs = challenge.displayDuration * 1000;
    const start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, (totalMs - elapsed) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setPhase('recall');
      }
    }, interval);

    return () => clearInterval(timer);
  }, [challenge]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / challenge.displayDuration) * 100));

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center p-2">
      {phase === 'memorize' ? (
        <div id="remember-memorize-view" className="w-full flex flex-col items-center gap-6 animate-fadeIn">
          {/* Circular Countdown Header */}
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-cyan-500/30 shadow-lg">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-100 ease-linear"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-cyan-300">
                {Math.ceil(timeLeft)}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-300 tracking-wide">
              {t.memorizePrompt}
            </span>
          </div>

          {/* Memorize Items Display */}
          <div className="w-full p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {challenge.memorizeItems.map((item, idx) => (
                <div
                  key={item.id}
                  id={`remember-mem-item-${idx}`}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-800/90 border border-slate-700 shadow-md min-w-[64px] sm:min-w-[76px]"
                >
                  <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow-md select-none">
                    {item.symbol}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skip button if memorized early */}
          <button
            id="remember-skip-btn"
            onClick={() => setPhase('recall')}
            className="text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition-all active:scale-95"
          >
            {language === 'en' ? 'I Have Memorized It ➔' : language === 'zh-CN' ? '已记住，立即答题 ➔' : '已記住，立即答題 ➔'}
          </button>
        </div>
      ) : (
        <div id="remember-recall-view" className="w-full flex flex-col items-center gap-6 animate-fadeIn">
          {/* Question Banner */}
          <div className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 text-center shadow-lg">
            <p className="text-xs uppercase tracking-wider font-mono text-cyan-400 mb-1">
              {t.recallPrompt}
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              {challenge.question[language] || challenge.question.en}
            </h3>
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
            {challenge.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isHighlightCorrect = disabled && opt.isCorrect;

              return (
                <button
                  key={opt.id}
                  id={`remember-opt-${opt.id}`}
                  disabled={disabled}
                  onClick={() => onSelectOption(opt)}
                  className={`
                    p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 select-none
                    ${
                      isHighlightCorrect
                        ? 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                        : isSelected && !opt.isCorrect
                        ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-200 ring-2 ring-rose-500'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:border-cyan-500/50'
                    }
                    ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                  `}
                >
                  {opt.symbol && (
                    <span className="text-3xl sm:text-4xl filter drop-shadow-sm">
                      {opt.symbol}
                    </span>
                  )}
                  <span className="text-sm font-semibold tracking-wide">
                    {opt.label[language] || opt.label.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
