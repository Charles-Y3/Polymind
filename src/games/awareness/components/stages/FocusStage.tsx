import React from 'react';
import { FocusChallenge, Language } from '../../types';

interface FocusStageProps {
  challenge: FocusChallenge;
  onSelectItem: (item: FocusChallenge['items'][0]) => void;
  disabled: boolean;
  selectedItemId?: string | null;
  language: Language;
}

export const FocusStage: React.FC<FocusStageProps> = ({
  challenge,
  onSelectItem,
  disabled,
  selectedItemId,
  language,
}) => {
  const { targetRule, items } = challenge;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 p-2">
      {/* Target Signal Header */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-mono text-indigo-400 font-bold">
            {language === 'en' ? 'Target Signal' : language === 'zh-CN' ? '锁定目标' : '鎖定目標'}:
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {targetRule.name[language] || targetRule.name.en}
          </span>
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 text-xl font-bold"
          style={{ transform: `rotate(${targetRule.rotation || 0}deg)` }}
        >
          {targetRule.symbol}
        </div>
      </div>

      {/* Visual Search Arena */}
      <div
        id="focus-arena"
        className="relative w-full aspect-[4/3] rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-2xl overflow-hidden p-2 select-none"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const isHighlightTarget = disabled && item.isTarget;

          return (
            <button
              key={item.id}
              id={`focus-item-${item.id}`}
              disabled={disabled}
              onClick={() => onSelectItem(item)}
              aria-label="Search item"
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg transition-all duration-150
                ${
                  isHighlightTarget
                    ? 'ring-4 ring-emerald-400 bg-emerald-950/90 text-emerald-300 scale-125 z-20 animate-bounce'
                    : isSelected && !item.isTarget
                    ? 'ring-4 ring-rose-500 bg-rose-950/90 text-rose-300 scale-110 z-10'
                    : 'hover:bg-slate-800/60 active:scale-95 text-slate-300 hover:text-cyan-300'
                }
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: '36px',
                height: '36px',
                fontSize: `${item.size || 24}px`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                color: item.color,
              }}
            >
              <span className="pointer-events-none select-none font-bold drop-shadow-sm">
                {item.symbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
