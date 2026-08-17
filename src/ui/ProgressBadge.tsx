import type {Accent} from './types';

interface ProgressBadgeProps {
  value: string | number;
  label?: string;
  accent?: Accent;
}

export default function ProgressBadge({value, label, accent}: ProgressBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
        accent ? `${accent.text} border-current/30` : 'text-slate-300 border-slate-700'
      }`}
    >
      {value}
      {label && <span className="font-medium opacity-70">{label}</span>}
    </span>
  );
}
