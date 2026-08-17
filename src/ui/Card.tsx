import type {ReactNode} from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({children, className = ''}: CardProps) {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900/60 ${className}`}>{children}</div>
  );
}

interface TileProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  accentText?: string;
}

export function Tile({icon, label, onClick, accentText}: TileProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 transition-colors py-3 px-2"
    >
      <span className={`text-lg leading-none ${accentText ?? 'text-slate-300'}`}>{icon}</span>
      <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">{label}</span>
    </button>
  );
}
