import type {ReactNode} from 'react';
import type {Accent} from './types';

interface StatChipProps {
  icon: ReactNode;
  label?: string;
  value: string | number;
  accent?: Accent;
}

export default function StatChip({icon, label, value, accent}: StatChipProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-semibold">
      <span className={`leading-none ${accent?.text ?? 'text-slate-300'}`}>{icon}</span>
      <span className="text-slate-100">{value}</span>
      {label && <span className="text-slate-500 font-medium">{label}</span>}
    </div>
  );
}
