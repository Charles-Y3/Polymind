import type {ReactNode} from 'react';
import type {Accent} from './types';

interface TopBarProps {
  title: string;
  icon?: ReactNode;
  accent: Accent;
  rightSlot?: ReactNode;
  sticky?: boolean;
}

export default function TopBar({title, icon, accent, rightSlot, sticky = true}: TopBarProps) {
  return (
    <div
      className={`${sticky ? 'sticky top-0' : ''} z-40 w-full h-[60px] border-b border-slate-800/80 bg-slate-950/95 backdrop-blur`}
    >
      <div className="max-w-2xl mx-auto h-full flex items-center gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-lg leading-none shrink-0">{icon}</span>}
          <span className={`text-sm font-bold truncate ${accent.text}`}>{title}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">{rightSlot}</div>
      </div>
    </div>
  );
}
