import React from 'react';
import { Compass, Crown, Trophy, Bookmark, BarChart3 } from 'lucide-react';
import { Language, PlayerStats } from '../types';
import { soundManager } from '../utils/audio';
import { t } from '../utils/i18n';

export type NavTabId = 'play' | 'leaderboard' | 'achievements' | 'discoveries' | 'stats';

interface BottomNavProps {
  activeTab: NavTabId;
  language: Language;
  stats: PlayerStats;
  discoveriesCount: number;
  onSelectTab: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  language,
  stats,
  discoveriesCount,
  onSelectTab,
}) => {
  const achievementsCount = stats.unlockedAchievements?.length || 0;

  const tabs: {
    id: NavTabId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    color: string;
  }[] = [
    {
      id: 'play',
      label: t(language, 'tabPlay'),
      icon: Compass,
      color: 'text-amber-400',
    },
    {
      id: 'leaderboard',
      label: t(language, 'tabRank'),
      icon: Crown,
      color: 'text-orange-400',
    },
    {
      id: 'achievements',
      label: t(language, 'tabTrophies'),
      icon: Trophy,
      badge: achievementsCount,
      color: 'text-yellow-400',
    },
    {
      id: 'discoveries',
      label: t(language, 'tabDiscoveries'),
      icon: Bookmark,
      badge: discoveriesCount,
      color: 'text-emerald-400',
    },
    {
      id: 'stats',
      label: t(language, 'tabStats'),
      icon: BarChart3,
      color: 'text-cyan-400',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 sm:px-6 pb-[env(safe-area-inset-bottom)] shadow-2xl">
      <div className="max-w-2xl mx-auto h-full grid grid-cols-5 gap-1 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playTap();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 group active:scale-95 ${
                isActive
                  ? 'text-white font-black bg-slate-800/80 border border-slate-700/60 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? tab.color : 'text-slate-400'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-md ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-700 text-slate-200 border border-slate-600'
                    }`}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full ${
                  isActive ? 'font-extrabold text-slate-100' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className={`w-4 h-0.5 rounded-full mt-0.5 bg-gradient-to-r from-amber-400 to-orange-500`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
