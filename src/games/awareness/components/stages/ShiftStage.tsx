import React, { useEffect, useState } from 'react';
import { Language, ShiftChallenge, ShiftItem } from '../../types';
import { soundManager } from '../../utils/audio';

interface ShiftStageProps {
  challenge: ShiftChallenge;
  onSelectHotspot: (itemId: string, isCorrect: boolean) => void;
  disabled: boolean;
  selectedItemId?: string | null;
  language: Language;
}

export const ShiftStage: React.FC<ShiftStageProps> = ({
  challenge,
  onSelectHotspot,
  disabled,
  selectedItemId,
  language,
}) => {
  const [activeScene, setActiveScene] = useState<'A' | 'B'>('A');
  const [isShuttering, setIsShuttering] = useState(false);

  useEffect(() => {
    setActiveScene('A');
    // Auto transition to Scene B after initial observation window
    const autoTimer = setTimeout(() => {
      handleFlipTo('B');
    }, 2800);

    return () => clearTimeout(autoTimer);
  }, [challenge]);

  const handleFlipTo = (target: 'A' | 'B') => {
    if (activeScene === target) return;
    setIsShuttering(true);
    soundManager.playShift();

    setTimeout(() => {
      setActiveScene(target);
      setIsShuttering(false);
    }, 200);
  };

  const currentItems = activeScene === 'A' ? challenge.sceneA : challenge.sceneB;

  // Find all possible click targets across both scenes
  const allItemMap = new Map<string, ShiftItem>();
  challenge.sceneA.forEach((it) => allItemMap.set(it.id, it));
  challenge.sceneB.forEach((it) => allItemMap.set(it.id, it));
  const unionItems = Array.from(allItemMap.values());

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 p-2">
      {/* Scene Header & Blink Comparator Controls */}
      <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/80 border border-teal-500/30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-mono text-teal-400 font-bold">
            {challenge.sceneName[language] || challenge.sceneName.en}
          </span>
        </div>

        {/* Scene Toggle Switch */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="shift-btn-scene-a"
            onClick={() => handleFlipTo('A')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeScene === 'A'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'en' ? 'Scene A' : language === 'zh-CN' ? '场景 A' : '場景 A'}
          </button>
          <button
            id="shift-btn-scene-b"
            onClick={() => handleFlipTo('B')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeScene === 'B'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'en' ? 'Scene B' : language === 'zh-CN' ? '场景 B' : '場景 B'}
          </button>
        </div>
      </div>

      {/* Interactive Scene Canvas */}
      <div
        id="shift-scene-viewport"
        className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden p-2 select-none"
      >
        {/* Shutter transition overlay */}
        {isShuttering && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex items-center justify-center animate-pulse">
            <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">
              {language === 'en' ? 'Aperture Shift...' : language === 'zh-CN' ? '切换场景中...' : '切換場景中...'}
            </span>
          </div>
        )}

        {/* Ambient room background styling based on scene */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e293b50_0%,transparent_70%)] pointer-events-none" />

        {/* Render visible items for current scene */}
        {currentItems.map((item) => {
          const isTarget = challenge.changedItemIds.includes(item.id);
          const isSelected = selectedItemId === item.id;
          const isHighlightCorrect = disabled && isTarget;

          return (
            <button
              key={item.id}
              id={`shift-item-${item.id}`}
              disabled={disabled}
              onClick={() => onSelectHotspot(item.id, isTarget)}
              aria-label={`Hotspot ${item.name}`}
              className={`
                absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-150
                ${
                  isHighlightCorrect
                    ? 'ring-4 ring-emerald-400 bg-emerald-950/80 shadow-lg shadow-emerald-500/30 scale-110 z-20 animate-bounce'
                    : isSelected && !isTarget
                    ? 'ring-4 ring-rose-500 bg-rose-950/80 scale-105 z-10'
                    : 'hover:bg-slate-800/60 active:scale-95'
                }
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
              `}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
              }}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                {item.icon}
              </span>
            </button>
          );
        })}

        {/* If an item disappeared in Scene B, provide an invisible hotspot on Scene B so the player can tap where it disappeared */}
        {activeScene === 'B' &&
          unionItems
            .filter((item) => !currentItems.some((b) => b.id === item.id))
            .map((vanishedItem) => {
              const isTarget = challenge.changedItemIds.includes(vanishedItem.id);
              const isSelected = selectedItemId === vanishedItem.id;
              const isHighlightCorrect = disabled && isTarget;

              return (
                <button
                  key={`vanished-${vanishedItem.id}`}
                  id={`shift-vanished-hotspot-${vanishedItem.id}`}
                  disabled={disabled}
                  onClick={() => onSelectHotspot(vanishedItem.id, isTarget)}
                  aria-label="Empty spot where item vanished"
                  className={`
                    absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-dashed transition-all flex items-center justify-center
                    ${
                      isHighlightCorrect
                        ? 'border-emerald-400 bg-emerald-950/70 ring-4 ring-emerald-400 z-20 animate-pulse'
                        : isSelected && !isTarget
                        ? 'border-rose-500 bg-rose-950/70'
                        : 'border-slate-700/40 hover:border-teal-500/60 hover:bg-teal-500/10'
                    }
                    ${disabled ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  style={{
                    left: `${vanishedItem.x}%`,
                    top: `${vanishedItem.y}%`,
                  }}
                >
                  {isHighlightCorrect && (
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {vanishedItem.icon}
                    </span>
                  )}
                </button>
              );
            })}
      </div>

      {/* Subtext instruction */}
      <div className="text-center text-xs text-slate-400">
        {language === 'en'
          ? 'Switch between Scene A and B to compare details, then tap what changed.'
          : language === 'zh-CN'
          ? '可自由切换 A/B 场景进行对比，发现不同后直接点击该位置。'
          : '可自由切換 A/B 場景進行對比，發現不同後直接點擊該位置。'}
      </div>
    </div>
  );
};
