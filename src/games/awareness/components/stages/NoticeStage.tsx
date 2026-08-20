import React from 'react';
import { Language, NoticeChallenge } from '../../types';
import { StageHeaderBar } from './StageHeaderBar';

interface NoticeStageProps {
  challenge: NoticeChallenge;
  onSelect: (item: NoticeChallenge['items'][0]) => void;
  disabled: boolean;
  selectedItemId?: string | null;
  highContrast: boolean;
  language: Language;
}

export const NoticeStage: React.FC<NoticeStageProps> = ({
  challenge,
  onSelect,
  disabled,
  selectedItemId,
  highContrast,
  language,
}) => {
  const { gridSize, items } = challenge;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center gap-3 p-2">
      <StageHeaderBar
        borderClass="border-cyan-500/30"
        textClass="text-cyan-400"
        label={language === 'en' ? 'Odd One Out' : language === 'zh-CN' ? '寻找异类' : '尋找異類'}
        right={
          <span className="text-[10px] text-slate-500 font-mono">
            {gridSize}×{gridSize}
          </span>
        }
      />
      <div
        id="notice-grid"
        className="grid gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: '100%',
          maxWidth: gridSize === 3 ? '320px' : gridSize === 4 ? '380px' : '440px',
        }}
      >
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const isHighlightOdd = disabled && item.isOdd;

          return (
            <button
              key={item.id}
              id={`notice-item-${item.id}`}
              disabled={disabled}
              onClick={() => onSelect(item)}
              aria-label={`Grid element ${item.symbol}`}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-150 select-none
                ${
                  highContrast
                    ? 'bg-slate-800 border-2 border-slate-600 active:scale-95'
                    : 'bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700/80 hover:border-cyan-500/50 active:scale-95'
                }
                ${
                  isHighlightOdd
                    ? 'ring-4 ring-emerald-400 bg-emerald-950/70 border-emerald-500 text-emerald-300 animate-pulse'
                    : isSelected && !item.isOdd
                    ? 'ring-4 ring-rose-500 bg-rose-950/70 border-rose-500 text-rose-300'
                    : 'text-slate-200'
                }
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{
                transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
                color: highContrast && isHighlightOdd ? '#34d399' : item.color || '#f1f5f9',
              }}
            >
              <span className="inline-block pointer-events-none drop-shadow-sm">
                {item.symbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
