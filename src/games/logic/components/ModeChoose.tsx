import React, { useState, useEffect, useMemo } from 'react';
import { PuzzleDataValue, SymbolItem } from '../types';
import { sound } from '../utils/audio';

interface ModeChooseProps {
  questionInput: PuzzleDataValue;
  choices: PuzzleDataValue[];
  onSubmitAnswer: (selectedChoice: PuzzleDataValue) => void;
  disabled?: boolean;
}

export const ModeChoose: React.FC<ModeChooseProps> = ({
  questionInput,
  choices,
  onSubmitAnswer,
  disabled = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Randomize answer choices so correct answer position is unpredictable
  const shuffledChoices = useMemo(() => {
    if (!choices || choices.length === 0) return [];
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [choices, questionInput]);

  // Reset answer selection when moving to a new question or enabling interactive mode
  useEffect(() => {
    if (!disabled) {
      setSelectedIdx(null);
    }
  }, [questionInput, choices, disabled]);

  const handleSelect = (choice: PuzzleDataValue, idx: number) => {
    if (disabled) return;
    sound.playClick();
    setSelectedIdx(idx);
    onSubmitAnswer(choice);
  };

  const renderChoiceValue = (val: PuzzleDataValue) => {
    if (typeof val === 'number') {
      return <span className="text-2xl font-black font-mono tracking-tight text-slate-100">{val}</span>;
    }

    if (typeof val === 'string') {
      return <span className="text-lg font-bold font-mono text-slate-100">{val}</span>;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 font-mono text-sm">[ Empty ]</span>;

      if (typeof val[0] === 'object' && 'shape' in val[0]) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {(val as SymbolItem[]).map((item, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-base"
                style={{ transform: `rotate(${item.rotation || 0}deg)` }}
              >
                {item.shape === 'triangle' && <span style={{ color: item.color }}>▲</span>}
                {item.shape === 'circle' && <span style={{ color: item.color }}>●</span>}
                {item.shape === 'square' && <span style={{ color: item.color }}>■</span>}
                {item.shape === 'diamond' && <span style={{ color: item.color }}>◆</span>}
                {item.shape === 'star' && <span style={{ color: item.color }}>★</span>}
                {item.shape === 'arrow' && <span style={{ color: item.color }}>➔</span>}
              </div>
            ))}
          </div>
        );
      }

      return <span className="font-mono text-lg font-bold text-slate-100">{val.join(', ')}</span>;
    }

    return <span className="font-mono text-sm text-slate-100">{JSON.stringify(val)}</span>;
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl">
      <div className="text-center mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold px-2.5 py-1 bg-cyan-950/60 rounded-full border border-cyan-500/30">
          MODE 1 — CHOOSE THE OUTPUT
        </span>
        <div className="mt-2 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
          <span>Select the output for</span>
          <span className="px-2.5 py-1 bg-slate-950 border border-cyan-500/50 rounded-lg text-cyan-300 font-mono font-bold text-base inline-flex items-center gap-1.5 shadow-inner">
            INPUT: {renderChoiceValue(questionInput)}
          </span>
        </div>
      </div>

      {/* Choice Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
        {shuffledChoices.map((choice, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => handleSelect(choice, idx)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-h-[84px] transition-all transform active:scale-95 ${
              selectedIdx === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 text-slate-200 shadow-md'
            }`}
          >
            {renderChoiceValue(choice)}
          </button>
        ))}
      </div>
    </div>
  );
};
