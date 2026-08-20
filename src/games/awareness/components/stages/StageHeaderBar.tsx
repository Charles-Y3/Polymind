import React from 'react';
import { motion } from 'motion/react';

interface StageHeaderBarProps {
  borderClass: string;
  textClass: string;
  label: string;
  value?: React.ReactNode;
  right?: React.ReactNode;
}

// Shared chrome for every stage's supplementary header bar, so notice/remember/focus/
// shift/perceive read as one visual system instead of five ad-hoc bars.
export const StageHeaderBar: React.FC<StageHeaderBarProps> = ({ borderClass, textClass, label, value, right }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 border ${borderClass} shadow-md`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-xs uppercase tracking-wider font-mono font-bold ${textClass}`}>{label}</span>
        {value && <span className="text-sm font-semibold text-slate-200 truncate">{value}</span>}
      </div>
      {right}
    </motion.div>
  );
};
