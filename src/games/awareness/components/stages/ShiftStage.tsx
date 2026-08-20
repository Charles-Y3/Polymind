import React, { useEffect, useMemo, useState } from 'react';
import { Language, ShiftChallenge, ShiftItem } from '../../types';
import { StageHeaderBar } from './StageHeaderBar';
import { soundManager } from '../../utils/audio';

interface ShiftStageProps {
  challenge: ShiftChallenge;
  onSelectHotspot: (itemId: string, isCorrect: boolean) => void;
  disabled: boolean;
  selectedItemId?: string | null;
  language: Language;
}

// More panels at higher difficulty: more ground to scan, so the odd one out gets harder to spot.
function getPanelCount(difficulty: number): number {
  if (difficulty >= 9) return 6;
  if (difficulty >= 6) return 5;
  if (difficulty >= 3) return 4;
  return 3;
}

function getGridColumns(panelCount: number): number {
  if (panelCount <= 3) return panelCount;
  if (panelCount === 4) return 2;
  return 3;
}

function ScenePanelContents({ items }: { items: ShiftItem[] }) {
  return (
    <>
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute text-lg sm:text-2xl filter drop-shadow-sm select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
          }}
        >
          {item.icon}
        </span>
      ))}
    </>
  );
}

export const ShiftStage: React.FC<ShiftStageProps> = ({
  challenge,
  onSelectHotspot,
  disabled,
  selectedItemId,
  language,
}) => {
  const panelCount = useMemo(() => getPanelCount(challenge.difficulty), [challenge.difficulty]);
  const [oddIndex, setOddIndex] = useState(() => Math.floor(Math.random() * panelCount));

  // Re-roll which panel is the odd one out whenever a new challenge loads
  useEffect(() => {
    setOddIndex(Math.floor(Math.random() * getPanelCount(challenge.difficulty)));
  }, [challenge]);

  const columns = getGridColumns(panelCount);
  const rows = Math.ceil(panelCount / columns);
  // Bound each row's height by viewport space (not just container width) so a 4-6 panel
  // grid never grows taller than the visible area and requires scrolling to reach it.
  const rowHeightVh = 42 / rows;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 p-2">
      <StageHeaderBar
        borderClass="border-teal-500/30"
        textClass="text-teal-400"
        label={challenge.sceneName[language] || challenge.sceneName.en}
        right={
          <span className="text-[10px] text-slate-500 font-mono">
            {panelCount} {language === 'en' ? 'panels' : language === 'zh-CN' ? '面板' : '面板'}
          </span>
        }
      />

      {/* Panel Grid — exactly one panel differs from the rest */}
      <div
        className="w-full grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: `${rowHeightVh}vh`,
        }}
      >
        {Array.from({ length: panelCount }, (_, idx) => {
          const isOddPanel = idx === oddIndex;
          const items = isOddPanel ? challenge.sceneB : challenge.sceneA;
          const panelId = `panel-${idx}`;
          const isSelected = selectedItemId === panelId;
          const showCorrectHighlight = disabled && isOddPanel;
          const showWrongHighlight = disabled && isSelected && !isOddPanel;

          return (
            <button
              key={panelId}
              id={`shift-panel-${idx}`}
              disabled={disabled}
              onClick={() => {
                soundManager.playShift();
                onSelectHotspot(panelId, isOddPanel);
              }}
              aria-label={`Panel ${idx + 1}`}
              className={`relative w-full h-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 overflow-hidden transition-all duration-150 select-none ${
                showCorrectHighlight
                  ? 'border-emerald-400 ring-4 ring-emerald-400/50 scale-[1.03] z-10'
                  : showWrongHighlight
                    ? 'border-rose-500 ring-4 ring-rose-500/40'
                    : 'border-slate-800 hover:border-teal-500/50'
              } ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e293b50_0%,transparent_70%)] pointer-events-none" />
              <ScenePanelContents items={items} />
            </button>
          );
        })}
      </div>

      {/* Subtext instruction */}
      <div className="text-center text-xs text-slate-400">
        {language === 'en'
          ? `One of these ${panelCount} panels is different from the rest — tap it.`
          : language === 'zh-CN'
            ? `这 ${panelCount} 个面板中有一个与其他不同，点击找出它。`
            : `這 ${panelCount} 個面板中有一個與其他不同，點擊找出它。`}
      </div>
    </div>
  );
};
