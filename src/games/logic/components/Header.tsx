import React from 'react';
import { PlayerProgress } from '../types';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import {
  Volume2,
  VolumeX,
  Flame,
  Trophy,
} from 'lucide-react';

interface HeaderProps {
  progress: PlayerProgress;
  onToggleSound: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onToggleSound,
  onGoHome,
}) => {
  const { t } = useI18n();

  return (
    <header className="bg-slate-900/90 border-b border-violet-500/20 backdrop-blur-md sticky top-0 z-40 h-[60px] px-4 text-slate-100">
      <div className="max-w-2xl mx-auto h-full flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="relative w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-violet-300/30 group cursor-pointer"
            onClick={onGoHome}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🧠</span>
            <div className="absolute -inset-1 rounded-xl bg-violet-400/20 blur-sm -z-10 animate-pulse"></div>
          </div>
          <div className="min-w-0 cursor-pointer" onClick={onGoHome}>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300">
              {t('brand.title')}
            </h1>
            <p className="text-xs text-violet-400/80 font-medium tracking-wider uppercase">
              {t('brand.tagline')}
            </p>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-violet-950/40 border border-violet-500/30 rounded-lg text-violet-300 text-xs font-semibold shrink-0">
            <Trophy className="w-3.5 h-3.5 text-violet-400" />
            <span>{progress.totalScore} {t('header.points')}</span>
          </div>

          {/* Daily Streak */}
          {progress.dailyStreak > 0 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-bold"
              title="Daily Streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{progress.dailyStreak}{t('header.streak')}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => { onToggleSound(); sound.playClick(); }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title={progress.soundEnabled ? t('header.muteSound') : t('header.enableSound')}
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-violet-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
