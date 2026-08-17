import React from 'react';
import { PuzzleDataValue, SymbolItem, InteractionMode } from '../types';
import { useI18n } from '../i18n/context';
import { HelpCircle, ArrowRight, Wrench, TestTube } from 'lucide-react';

interface QuestionCardProps {
  questionInput?: PuzzleDataValue;
  mode: InteractionMode;
  worldId?: number;
  title?: string;
  isSolved?: boolean;
  revealedOutput?: PuzzleDataValue;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionInput,
  mode,
  worldId,
  title,
  isSolved = false,
  revealedOutput,
}) => {
  const { t } = useI18n();

  const renderValue = (val: PuzzleDataValue | undefined) => {
    if (val === undefined || val === null) {
      return <span className="text-amber-400 font-black font-mono text-2xl animate-pulse">?</span>;
    }

    if (typeof val === 'number') {
      return <span className="font-mono text-2xl font-black text-cyan-300">{val}</span>;
    }

    if (typeof val === 'string') {
      return <span className="font-mono text-xl font-bold text-cyan-200">{val}</span>;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 font-mono text-sm">{t('visual.empty')}</span>;

      if (typeof val[0] === 'object' && 'shape' in val[0]) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {(val as SymbolItem[]).map((item, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shadow-sm"
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

      return <span className="font-mono text-xl font-bold text-cyan-300">{val.join(', ')}</span>;
    }

    return <span className="font-mono text-sm text-cyan-300">{JSON.stringify(val)}</span>;
  };

  if (worldId === 8) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold text-2xl shrink-0">
            <TestTube className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                {t('question.ambiguityChallenge')}
              </span>
            </div>
            <h3 className="text-base font-bold font-mono text-slate-100 mt-1">
              {t('question.ambiguityTitle')}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 leading-relaxed">
              {t('question.ambiguityDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'build') {
    return (
      <div className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold text-2xl shrink-0">
            <Wrench className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                {t('question.reconstructRule')}
              </span>
            </div>
            <h3 className="text-base font-bold font-mono text-slate-100 mt-1">
              {t('question.constructFormula')}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 leading-relaxed">
              {t('question.assembleBlocks')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/90 border-2 border-cyan-500/60 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-2xl shrink-0">
            <HelpCircle className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-black px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">
                {t('question.target')}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black font-mono text-slate-100 mt-1">
              {t('question.whatOutput')}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 leading-relaxed">
              {t('question.deducePattern')}
            </p>
          </div>
        </div>

        {/* PROMINENT TARGET FORMULA BOX */}
        <div className="bg-slate-950 border-2 border-cyan-400/50 rounded-xl px-5 py-2.5 flex items-center gap-3 shadow-inner shrink-0">
          <div className="text-center">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">{t('question.targetInput')}</span>
            <div className="mt-0.5">{renderValue(questionInput)}</div>
          </div>

          <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />

          <div className="text-center">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">{t('question.targetOutput')}</span>
            <div className="mt-0.5 font-mono text-2xl font-black">
              {isSolved && revealedOutput !== undefined ? (
                <span className="text-emerald-400 drop-shadow-[0_0_8px_#34d399]">{renderValue(revealedOutput)}</span>
              ) : (
                <span className="text-amber-400 animate-pulse drop-shadow-[0_0_8px_#f59e0b]">?</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
