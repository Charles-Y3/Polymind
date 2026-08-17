import React from 'react';
import { Language, PlayerProfile } from '../types';
import { translations } from '../utils/i18n';
import { calculateMasteryLevel } from '../utils/storage';

interface NavbarProps {
  profile: PlayerProfile;
  language: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenMastery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  language,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenMastery,
}) => {
  const t = translations[language];
  const mastery = calculateMasteryLevel(profile.xp);

  return (
    <nav
      id="app-navbar"
      className="w-full h-[60px] bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40"
    >
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-pink-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-fuchsia-500/20 text-base select-none">
            👁️
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-100 uppercase">
              {t.gameTitle}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {t.humanAbilitiesCollection}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Mastery Chip */}
          <button
            id="nav-mastery-chip"
            onClick={onOpenMastery}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-xs font-mono transition-all cursor-pointer"
          >
            <span className="text-slate-300 font-bold">
              {mastery.rank.title[language]}
            </span>
            <span className="text-fuchsia-400 font-bold">Lv.{mastery.level}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle-btn"
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all text-xs cursor-pointer"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Settings / Profile Button */}
          <button
            id="nav-profile-settings-btn"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 transition-all cursor-pointer"
          >
            <span className="text-sm select-none">{profile.avatar}</span>
            <span className="text-xs font-mono font-bold text-slate-300 hidden sm:inline truncate max-w-[90px]">
              {profile.username}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

