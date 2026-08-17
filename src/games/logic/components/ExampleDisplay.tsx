import React from 'react';
import { PuzzleExample, SymbolItem } from '../types';
import { useI18n } from '../i18n/context';
import { ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface ExampleDisplayProps {
  examples: PuzzleExample[];
  title?: string;
}

export const ExampleDisplay: React.FC<ExampleDisplayProps> = ({
  examples,
  title,
}) => {
  const { t } = useI18n();
  const displayTitle = title || t('examples.title');

  const renderValue = (val: any) => {
    if (val === undefined || val === null) {
      return <span className="text-slate-500 font-mono text-sm">?</span>;
    }

    if (typeof val === 'number') {
      return <span className="font-mono text-lg font-bold text-cyan-300">{val}</span>;
    }

    if (typeof val === 'string') {
      return <span className="font-mono text-base font-semibold text-cyan-200">{val}</span>;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 font-mono text-xs">{t('visual.empty')}</span>;

      // Symbol items array
      if (typeof val[0] === 'object' && val[0] !== null && 'shape' in val[0]) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {(val as SymbolItem[]).map((item, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shadow-sm"
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

      // Array of numbers/strings
      return (
        <span className="font-mono text-base font-bold text-cyan-300">
          {val.join(', ')}
        </span>
      );
    }

    return <span className="font-mono text-sm text-cyan-300">{JSON.stringify(val)}</span>;
  };

  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> {displayTitle}
        </h3>
        <span className="text-[10px] font-mono text-slate-500">
          {t('examples.pairsCount', { count: examples.length })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {examples.map((ex, idx) => (
          <div
            key={idx}
            className="bg-slate-950/90 rounded-xl border border-slate-800/80 p-3 flex flex-col justify-between hover:border-cyan-500/30 transition-all shadow-md group"
          >
            <div className="flex items-center justify-between gap-2">
              {/* Input Value */}
              <div className="flex-1 flex flex-col items-start min-w-0">
                <span className="text-[9px] font-mono uppercase text-slate-500 font-bold mb-0.5">
                  {t('examples.input')}
                </span>
                <div className="w-full overflow-x-auto">{renderValue(ex.input)}</div>
              </div>

              {/* Arrow */}
              <div className="px-1.5 text-slate-600 group-hover:text-cyan-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Output Value */}
              <div className="flex-1 flex flex-col items-end min-w-0">
                <span className="text-[9px] font-mono uppercase text-slate-500 font-bold mb-0.5">
                  {t('examples.output')}
                </span>
                <div className="w-full flex justify-end overflow-x-auto">{renderValue(ex.output)}</div>
              </div>
            </div>

            {/* Optional Example Notes */}
            {ex.notes && (
              <div className="mt-2 pt-1.5 border-t border-slate-900 text-[10px] font-mono text-slate-400 italic flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{ex.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
