import type {ReactNode} from 'react';
import type {Accent} from './types';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  accent: Accent;
  icon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<PrimaryButtonProps['size']>, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-xl',
  md: 'text-sm px-4 py-2.5 rounded-2xl',
  lg: 'text-base px-5 py-3.5 rounded-2xl',
};

export default function PrimaryButton({
  children,
  onClick,
  accent,
  icon,
  fullWidth,
  disabled,
  size = 'md',
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold text-white bg-gradient-to-r ${accent.from} ${accent.to} shadow-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {icon}
      {children}
    </button>
  );
}
