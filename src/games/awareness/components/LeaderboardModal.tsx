import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Language, PlayerProfile, SkillType } from '../types';
import { skillLabels, translations } from '../utils/i18n';
import { AwarenessLeaderboardEntry, AwarenessSortField, fetchAwarenessLeaderboard, submitAwarenessScore } from '../services/leaderboardService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  language: Language;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, profile, language }) => {
  const [sortField, setSortField] = useState<AwarenessSortField>('total');
  const [entries, setEntries] = useState<AwarenessLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const load = async () => {
    setLoading(true);
    const data = await fetchAwarenessLeaderboard(sortField);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Sync this player's latest score, then refresh the board with it included.
    submitAwarenessScore(profile).finally(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sortField]);

  if (!isOpen) return null;

  const myKey = profile.username.trim().toLowerCase();

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
            onClick={() => setSortField('total')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              sortField === 'total'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.globalTab}
          </button>
          {(['observation', 'memory', 'focus', 'discrimination', 'awareness'] as SkillType[]).map(
            (sKey) => (
              <button
                key={sKey}
                id={`lb-tab-${sKey}`}
                onClick={() => setSortField(sKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  sortField === sKey
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
        <div className="py-2 text-[11px] font-mono text-slate-400">{t.allTime}</div>

        {/* Table Rows */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 my-2">
          {loading && (
            <div className="py-12 text-center text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> {t.loadingScores}
            </div>
          )}
          {!loading && entries.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">{t.noScoresYet}</div>
          )}
          {!loading &&
            entries.map((entry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
              const isPlayer = entry.id === myKey;
              const value = entry[sortField];

              return (
                <div
                  key={entry.id}
                  id={`lb-row-${rank}`}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isPlayer
                      ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                      {medal || `#${rank}`}
                    </span>
                    <span className="text-lg select-none">{entry.avatar}</span>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[200px] ${
                          isPlayer ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {entry.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        isTop3 ? 'text-amber-400' : isPlayer ? 'text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      {value.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">pts</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-center">
          <button
            onClick={load}
            disabled={loading}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refreshScores}
          </button>
        </div>
      </div>
    </div>
  );
};
