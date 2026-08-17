import React, { useState, useEffect } from 'react';
import { RuleTokenOption } from '../types';
import { sound } from '../utils/audio';
import { Wrench, Trash2, Play, Check } from 'lucide-react';

interface ModeBuildProps {
  availableTokens: RuleTokenOption[];
  onSubmitRule: (tokens: string[]) => void;
  disabled?: boolean;
}

export const ModeBuild: React.FC<ModeBuildProps> = ({
  availableTokens,
  onSubmitRule,
  disabled = false,
}) => {
  const [builtBar, setBuiltBar] = useState<RuleTokenOption[]>([]);

  // Clear assembled rule bar when enabling interactive mode or changing tokens
  useEffect(() => {
    if (!disabled) {
      setBuiltBar([]);
    }
  }, [availableTokens, disabled]);

  const handleAddToken = (token: RuleTokenOption) => {
    if (disabled) return;
    sound.playClick();
    setBuiltBar((prev) => [...prev, token]);
  };

  const handleRemoveToken = (idx: number) => {
    if (disabled) return;
    sound.playClick();
    setBuiltBar((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearBar = () => {
    if (disabled) return;
    sound.playClick();
    setBuiltBar([]);
  };

  const handleSubmit = () => {
    if (builtBar.length === 0 || disabled) return;
    sound.playClick();
    const tokenLabels = builtBar.map((t) => t.label);
    onSubmitRule(tokenLabels);
  };

  // Default fallback token choices if none specified
  const tokensToDisplay = availableTokens.length > 0 ? availableTokens : [
    { id: 'op_mult', label: '×', category: 'op' as const },
    { id: 'op_add', label: '+', category: 'op' as const },
    { id: 'op_sub', label: '-', category: 'op' as const },
    { id: 'op_div', label: '÷', category: 'op' as const },
    { id: 'val_1', label: '1', category: 'value' as const },
    { id: 'val_2', label: '2', category: 'value' as const },
    { id: 'val_3', label: '3', category: 'value' as const },
    { id: 'val_4', label: '4', category: 'value' as const },
  ];

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-1 bg-amber-950/60 rounded-full border border-amber-500/30">
          MODE 3 — BUILD THE RULE
        </span>
        <h4 className="text-slate-200 text-sm mt-2 font-medium">
          Click operators and values to assemble the machine transformation rule:
        </h4>
      </div>

      {/* ACTIVE RULE WORKBENCH BAR */}
      <div className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/40 min-h-[72px] flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-h-[40px]">
          {builtBar.length === 0 ? (
            <span className="text-slate-600 italic font-mono text-xs">
              [ Empty Rule Bar — Click components below ]
            </span>
          ) : (
            builtBar.map((token, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveToken(idx)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-rose-950/60 border border-amber-500/50 hover:border-rose-500/60 text-amber-300 hover:text-rose-300 font-mono font-black text-lg transition-all shadow-md flex items-center gap-1 group"
                title="Click to remove"
              >
                <span>{token.label}</span>
                <span className="text-xs text-rose-400 opacity-0 group-hover:opacity-100">✕</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          {builtBar.length > 0 && (
            <button
              onClick={handleClearBar}
              disabled={disabled}
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              title="Clear Rule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={builtBar.length === 0 || disabled}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-mono rounded-lg shadow-md disabled:opacity-40 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>APPLY RULE</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPONENT PALETTE */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-bold">
          AVAILABLE RULE COMPONENTS:
        </span>
        <div className="flex flex-wrap gap-2">
          {tokensToDisplay.map((token) => (
            <button
              key={token.id}
              disabled={disabled}
              onClick={() => handleAddToken(token)}
              className={`px-3.5 py-2 rounded-lg font-mono font-bold text-base transition-all active:scale-90 shadow-sm ${
                token.category === 'op'
                  ? 'bg-blue-950/80 hover:bg-blue-900 border border-blue-600/50 text-blue-300'
                  : token.category === 'value'
                  ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-300'
                  : token.category === 'condition'
                  ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300'
              }`}
            >
              {token.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
