import React, { useState } from 'react';
import { Language, PlayerProfile, SkillType } from '../types';
import { skillLabels, translations } from '../utils/i18n';
import { generateLeaderboard } from '../utils/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  language: Language;
}

type TabType = 'global' | 'daily' | 'weekly' | SkillType;

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const t = translations[language];

  if (!isOpen) return null;

  const entries = generateLeaderboard(activeTab, profile);

  return (
    <div
      id="leaderboard-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="leaderboard-modal-card"
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {t.leaderboard}
            </h2>
          </div>
          <button
            id="close-leaderboard-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800/80 no-scrollbar">
          <button
            id="lb-tab-global"
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'global'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.globalTab}
          </button>
          <button
            id="lb-tab-daily"
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dailyTab}
          </button>
          <button
            id="lb-tab-weekly"
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.weeklyTab}
          </button>
          {(['observation', 'memory', 'focus', 'discrimination', 'awareness'] as SkillType[]).map(
            (sKey) => (
              <button
                key={sKey}
                id={`lb-tab-${sKey}`}
                onClick={() => setActiveTab(sKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === sKey
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {skillLabels[sKey].icon} {skillLabels[sKey].name[language]}
              </button>
            )
          )}
        </div>

        {/* Tab Subtitle */}
        <div className="py-2 text-[11px] font-mono text-slate-400">
          {activeTab === 'daily'
            ? t.dailyRankSubtitle
            : activeTab === 'weekly'
            ? t.weeklyResetSubtitle
            : t.allTime}
        </div>

        {/* Table Rows */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 my-2">
          {entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

            return (
              <div
                key={entry.id}
                id={`lb-row-${entry.rank}`}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  entry.isPlayer
                    ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                    {medal || `#${entry.rank}`}
                  </span>
                  <span className="text-lg select-none">{entry.avatar}</span>
                  <div className="flex flex-col">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[200px] ${
                        entry.isPlayer ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {entry.masteryTitle} · {entry.accuracy}% acc
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isTop3 ? 'text-amber-400' : entry.isPlayer ? 'text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          Anti-Cheating Verified · Seed Protected
        </div>
      </div>
    </div>
  );
};
