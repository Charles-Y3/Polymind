import React, { useState, useEffect } from 'react';
import { PuzzleDataValue } from '../types';
import { sound } from '../utils/audio';
import { Send, Calculator } from 'lucide-react';

interface ModeEnterProps {
  questionInput: PuzzleDataValue;
  onSubmitAnswer: (inputVal: PuzzleDataValue) => void;
  disabled?: boolean;
}

export const ModeEnter: React.FC<ModeEnterProps> = ({
  questionInput,
  onSubmitAnswer,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  // Clear typed answer when moving to a new question or enabling interactive mode
  useEffect(() => {
    if (!disabled) {
      setInputValue('');
    }
  }, [questionInput, disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    sound.playClick();

    // Check if input is a number
    const num = Number(inputValue.trim());
    if (!isNaN(num) && inputValue.trim() !== '') {
      onSubmitAnswer(num);
    } else {
      onSubmitAnswer(inputValue.trim());
    }
  };

  const handleKeypadPress = (val: string) => {
    if (disabled) return;
    sound.playClick();
    if (val === 'DEL') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (val === 'CLEAR') {
      setInputValue('');
    } else {
      setInputValue((prev) => prev + val);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl">
      <div className="text-center mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-1 bg-emerald-950/60 rounded-full border border-emerald-500/30">
          MODE 2 — ENTER THE OUTPUT
        </span>
        <div className="mt-2 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
          <span>Calculate and type the output for</span>
          <span className="px-2.5 py-1 bg-slate-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono font-bold text-base shadow-inner">
            INPUT: {typeof questionInput === 'object' ? JSON.stringify(questionInput) : String(questionInput)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            disabled={disabled}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || disabled}
            className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold font-mono rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>SUBMIT</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* On-Screen Numeric Keypad */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-4 gap-2">
          {['7', '8', '9', 'DEL', '4', '5', '6', 'CLEAR', '1', '2', '3', '-', '0', '.'].map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleKeypadPress(key)}
              className={`p-2.5 rounded-lg text-sm font-mono font-bold transition-all active:scale-90 ${
                key === 'DEL' || key === 'CLEAR'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-emerald-300'
              } ${key === '0' ? 'col-span-2' : ''}`}
            >
              {key}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
