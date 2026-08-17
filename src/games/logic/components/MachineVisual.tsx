import React, { useEffect, useState } from 'react';
import { PuzzleDataValue, SymbolItem } from '../types';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Cpu, Zap, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface MachineVisualProps {
  currentInput?: PuzzleDataValue;
  currentOutput?: PuzzleDataValue;
  isProcessing?: boolean;
  statusState?: 'idle' | 'running' | 'success' | 'error';
  machineTitle?: string;
  ruleDescription?: string;
}

export const MachineVisual: React.FC<MachineVisualProps> = ({
  currentInput,
  currentOutput,
  isProcessing = false,
  statusState = 'idle',
  machineTitle = 'MACHINE CORE ALPHA',
  ruleDescription,
}) => {
  const { t } = useI18n();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isProcessing || statusState === 'running') {
      sound.playMachineRun();
      const interval = setInterval(() => setPulse((p) => !p), 250);
      return () => clearInterval(interval);
    }
  }, [isProcessing, statusState]);

  // Helper renderer for arbitrary puzzle data (number, symbols, sequences)
  const renderDataDisplay = (val: PuzzleDataValue | undefined, placeholder: string) => {
    if (val === undefined || val === null) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-amber-400 font-mono font-black text-2xl tracking-widest animate-pulse px-3 py-1 bg-amber-950/60 border border-amber-500/40 rounded-lg">
            ❓ ?
          </span>
          <span className="text-[9px] font-mono font-bold text-amber-500/80 uppercase tracking-wider mt-1">
            {t('visual.findPattern')}
          </span>
        </div>
      );
    }

    if (typeof val === 'number') {
      return (
        <span className="text-3xl font-black tracking-tight font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
          {val}
        </span>
      );
    }

    if (typeof val === 'string') {
      return (
        <span className="text-xl font-bold font-mono text-cyan-200">
          {val}
        </span>
      );
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 font-mono text-sm">{t('visual.empty')}</span>;

      // Check if it's an array of SymbolItems
      if (typeof val[0] === 'object' && 'shape' in val[0]) {
        return (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {(val as SymbolItem[]).map((item, idx) => (
              <div
                key={idx}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner"
                style={{
                  transform: `rotate(${item.rotation || 0}deg)`,
                }}
              >
                {item.shape === 'triangle' && <span className="text-xl" style={{ color: item.color }}>▲</span>}
                {item.shape === 'circle' && <span className="text-xl" style={{ color: item.color }}>●</span>}
                {item.shape === 'square' && <span className="text-xl" style={{ color: item.color }}>■</span>}
                {item.shape === 'diamond' && <span className="text-xl" style={{ color: item.color }}>◆</span>}
                {item.shape === 'star' && <span className="text-xl" style={{ color: item.color }}>★</span>}
                {item.shape === 'arrow' && <span className="text-xl" style={{ color: item.color }}>➔</span>}
              </div>
            ))}
          </div>
        );
      }

      // Plain array of numbers or strings
      return (
        <div className="flex items-center gap-1.5 flex-wrap justify-center font-mono font-bold text-cyan-300 text-lg">
          {(val as any[]).map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-cyan-500/30">
                {typeof item === 'object' ? JSON.stringify(item) : item}
              </span>
              {idx < val.length - 1 && <span className="text-slate-600 text-xs">,</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <span className="font-mono text-sm text-cyan-300">{JSON.stringify(val)}</span>;
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden group">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

      {/* Top Machine Status Header */}
      <div className="flex items-center justify-between mb-4 relative z-10 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            {machineTitle}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              statusState === 'running' || isProcessing
                ? 'bg-amber-400 animate-ping'
                : statusState === 'success'
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : statusState === 'error'
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                : 'bg-cyan-500/60'
            }`}
          ></div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            {isProcessing || statusState === 'running'
              ? t('visual.processing')
              : statusState === 'success'
              ? t('visual.cracked')
              : statusState === 'error'
              ? t('visual.failed')
              : t('visual.ready')}
          </span>
        </div>
      </div>

      {/* Main Machine Layout: Input Tube -> Machine Core -> Output Tube */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center relative z-10 py-2">
        {/* INPUT POD (Cols 1-3) */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[96px] shadow-lg relative group-hover:border-cyan-500/40 transition-colors">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 mb-1 flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 text-cyan-400" /> {t('visual.inputStream')}
            </span>
            <div className="mt-1 flex items-center justify-center min-h-[40px]">
              {renderDataDisplay(currentInput, t('visual.waiting'))}
            </div>
          </div>
        </div>

        {/* CONVEYOR / ENERGY CHANNEL IN (Col 4) */}
        <div className="md:col-span-1 flex items-center justify-center py-2 md:py-0">
          <div className="relative flex items-center justify-center w-full">
            <div className={`h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative`}>
              <div
                className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all ${
                  isProcessing ? 'w-full animate-pulse' : 'w-1/2'
                }`}
              ></div>
            </div>
            <ArrowRight className={`w-4 h-4 text-cyan-400 absolute ${isProcessing ? 'animate-bounce' : ''}`} />
          </div>
        </div>

        {/* CENTRAL MACHINE REACTOR CORE (Cols 5-7) */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div
            className={`w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-2xl transition-all duration-300 ${
              statusState === 'success'
                ? 'border-emerald-500/80 shadow-emerald-500/20'
                : statusState === 'error'
                ? 'border-rose-500/80 shadow-rose-500/20'
                : isProcessing
                ? 'border-amber-400 shadow-amber-400/30 scale-[1.02]'
                : 'border-cyan-500/50 shadow-cyan-500/10'
            }`}
          >
            {/* Spinning Gears & Core Visual */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-2">
              {/* Outer Ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 ${
                  isProcessing ? 'animate-spin' : 'animate-[spin_10s_linear_infinite]'
                }`}
              ></div>

              {/* Central Core Icon */}
              <div className="text-3xl select-none transition-transform hover:scale-125 duration-200">
                {statusState === 'success' ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400 animate-bounce" />
                ) : statusState === 'error' ? (
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                ) : (
                  <span className={isProcessing ? 'animate-spin inline-block' : ''}>⚙️</span>
                )}
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {t('visual.engine')}
              </span>
              {ruleDescription && statusState === 'success' && (
                <div className="mt-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold">
                  {t('visual.rule')} {ruleDescription}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONVEYOR / ENERGY CHANNEL OUT (Col 8) */}
        <div className="md:col-span-1 flex items-center justify-center py-2 md:py-0">
          <div className="relative flex items-center justify-center w-full">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all ${
                  isProcessing ? 'w-full animate-pulse' : 'w-1/2'
                }`}
              ></div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 absolute" />
          </div>
        </div>

        {/* OUTPUT POD (Cols 9-11) */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[96px] shadow-lg relative group-hover:border-emerald-500/40 transition-colors">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 mb-1 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" /> {t('visual.outputStream')}
            </span>
            <div className="mt-1 flex items-center justify-center min-h-[40px]">
              {renderDataDisplay(currentOutput, '?')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
