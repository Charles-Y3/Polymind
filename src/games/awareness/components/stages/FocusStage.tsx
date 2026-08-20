import React from 'react';
import { FocusChallenge, Language } from '../../types';
import { StageHeaderBar } from './StageHeaderBar';

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
      <StageHeaderBar
        borderClass="border-indigo-500/30"
        textClass="text-indigo-400"
        label={`${language === 'en' ? 'Target Signal' : language === 'zh-CN' ? '锁定目标' : '鎖定目標'}:`}
        value={targetRule.name[language] || targetRule.name.en}
        right={
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 text-xl font-bold"
            style={{ transform: `rotate(${targetRule.rotation || 0}deg)` }}
          >
            {targetRule.symbol}
          </div>
        }
      />

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
          // The click hitbox used to be a fixed 36px at every density. At high difficulty
          // (up to 64 items packed into the same arena, plus position jitter) cells shrink
          // well below that, so overlapping hitboxes could steal a tap meant for the item
          // underneath — a real "I tapped the target and it counted as wrong" bug. Scale
          // the hitbox down alongside the glyph size so it stays smaller than the gap
          // between items, and always give the true target top stacking priority so an
          // unavoidable sliver of overlap never favors a distractor over it.
          const hitSize = (item.size || 26) + 10;

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
                    ? 'ring-4 ring-emerald-400 bg-emerald-950/90 text-emerald-300 scale-125 animate-bounce'
                    : isSelected && !item.isTarget
                    ? 'ring-4 ring-rose-500 bg-rose-950/90 text-rose-300 scale-110'
                    : 'hover:bg-slate-800/60 active:scale-95 text-slate-300 hover:text-cyan-300'
                }
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${hitSize}px`,
                height: `${hitSize}px`,
                fontSize: `${item.size || 24}px`,
                zIndex: isHighlightTarget ? 20 : isSelected && !item.isTarget ? 10 : item.isTarget ? 5 : 1,
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
