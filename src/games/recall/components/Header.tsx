import React from 'react';
import { Flame, Settings as SettingsIcon } from 'lucide-react';
import { BgmMode, Language, PlayerStats } from '../types';
import { getLevelInfo } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { t } from '../utils/i18n';

interface HeaderProps {
  stats: PlayerStats;
  language: Language;
  bgmMode: BgmMode;
  onCycleBgm: () => void;
  onOpenLevelInfo: () => void;
  onOpenStreakInfo: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  language,
  bgmMode,
  onCycleBgm,
  onOpenLevelInfo,
  onOpenStreakInfo,
  onOpenSettings,
  onGoHome,
}) => {
  const levelInfo = getLevelInfo(stats.xp);
  const title =
    language === 'zh-CN'
      ? levelInfo.titleZhSimp
      : language === 'zh-TW'
      ? levelInfo.titleZhTrad
      : levelInfo.title;

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6">
      <div className="max-w-2xl mx-auto h-full flex items-center justify-between gap-2">
        {/* Left: App Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95 shrink-0 min-w-0"
          title="Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg sm:text-xl font-extrabold shadow-lg shadow-orange-500/20 text-slate-950 shrink-0 group-hover:scale-105 transition-transform">
            📚
          </div>
          <span className="text-sm font-black tracking-tight text-slate-100 truncate">
            {t(language, 'brandName')}
          </span>
        </button>

        {/* Right: Level/XP, Streak Badge, 3-Way BGM Toggle, and Settings ⚙️ */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Level & XP */}
          <button
            onClick={() => {
              soundManager.playTap();
              onOpenLevelInfo();
            }}
            className="text-left group/lvl px-2 py-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="Level & XP Info"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 group-hover/lvl:text-amber-300">
                Lv.{levelInfo.level}
              </span>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                {title}
              </span>
            </div>
            {/* XP progress bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-14 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {stats.xp} XP
              </span>
            </div>
          </button>

          {/* Current Streak Badge */}
          <button
            onClick={() => {
              soundManager.playTap();
              onOpenStreakInfo();
            }}
            title={`${t(language, 'streak')}: ${stats.currentStreak}`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 hover:bg-orange-500/20 text-orange-400 text-xs font-extrabold transition-all active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500/80 text-orange-400 animate-pulse" />
            <span>{stats.currentStreak}</span>
          </button>

          {/* 3-Way BGM Toggle: Mute 🔇 | Calm ☕ | Arcade ⚡ */}
          <button
            onClick={onCycleBgm}
            title={`${t(language, 'bgmMode')}: ${
              bgmMode === 'off'
                ? t(language, 'bgmOff')
                : bgmMode === 'calm'
                ? t(language, 'bgmCalm')
                : t(language, 'bgmArcade')
            }`}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
              bgmMode === 'off'
                ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                : bgmMode === 'calm'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
            }`}
          >
            <span className="text-xs">
              {bgmMode === 'off' ? '🔇' : bgmMode === 'calm' ? '☕' : '⚡'}
            </span>
            <span className="text-[11px] hidden xs:inline sm:inline">
              {bgmMode === 'off'
                ? t(language, 'bgmOff')
                : bgmMode === 'calm'
                ? t(language, 'bgmCalm')
                : t(language, 'bgmArcade')}
            </span>
          </button>

          {/* Settings ⚙️ Button */}
          <button
            onClick={() => {
              soundManager.playTap();
              onOpenSettings();
            }}
            title={t(language, 'settings')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400 transition-all active:scale-95"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
