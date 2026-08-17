import type {Accent} from './types';

interface SegmentedTabsProps<T extends string> {
  options: {value: T; label: string}[];
  value: T;
  onChange: (v: T) => void;
  accent: Accent;
}

export default function SegmentedTabs<T extends string>({options, value, onChange, accent}: SegmentedTabsProps<T>) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-slate-900/80 border border-slate-800 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
              active ? `bg-gradient-to-r ${accent.from} ${accent.to} text-white` : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
