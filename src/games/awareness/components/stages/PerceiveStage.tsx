import React from 'react';
import { Language, PerceiveChallenge } from '../../types';

interface PerceiveStageProps {
  challenge: PerceiveChallenge;
  onSelectAnomaly: (itemId: string, isAnomaly: boolean) => void;
  disabled: boolean;
  selectedItemId?: string | null;
  language: Language;
}

export const PerceiveStage: React.FC<PerceiveStageProps> = ({
  challenge,
  onSelectAnomaly,
  disabled,
  selectedItemId,
  language,
}) => {
  const { themeTitle, items } = challenge;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 p-2">
      {/* Scene Theme Header */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 border border-fuchsia-500/30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-mono text-fuchsia-400 font-bold">
            {language === 'en' ? 'Context' : language === 'zh-CN' ? '当前场景' : '當前場景'}:
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {themeTitle[language] || themeTitle.en}
          </span>
        </div>
        <span className="text-xs font-mono text-fuchsia-400/80 bg-fuchsia-950/60 px-2 py-0.5 rounded border border-fuchsia-500/20">
          {language === 'en' ? 'Anomaly Detection' : language === 'zh-CN' ? '反常捕获' : '反常捕獲'}
        </span>
      </div>

      {/* Illustrated Contextual Canvas */}
      <div
        id="perceive-canvas"
        className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden p-2 select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#3b076420_0%,transparent_80%)] pointer-events-none" />

        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const isHighlightAnomaly = disabled && item.isAnomaly;

          return (
            <button
              key={item.id}
              id={`perceive-item-${item.id}`}
              disabled={disabled}
              onClick={() => onSelectAnomaly(item.id, item.isAnomaly)}
              aria-label={`Item ${item.name.en}`}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-150
                ${
                  isHighlightAnomaly
                    ? 'ring-4 ring-emerald-400 bg-emerald-950/80 shadow-lg shadow-emerald-500/40 scale-115 z-20 animate-bounce'
                    : isSelected && !item.isAnomaly
                    ? 'ring-4 ring-rose-500 bg-rose-950/80 scale-105 z-10'
                    : 'hover:bg-slate-800/70 hover:scale-105 active:scale-95'
                }
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-1 max-w-[80px] text-center truncate">
                {item.name[language] || item.name.en}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-400">
        {language === 'en'
          ? 'Identify which object defies real-world logic or context in this scene.'
          : language === 'zh-CN'
          ? '观察场景常理逻辑，点击与该情境完全不相符的反常物品。'
          : '觀察場景常理邏輯，點擊與該情境完全不相符的反常物品。'}
      </div>
    </div>
  );
};
