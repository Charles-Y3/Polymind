import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '../types';
import { Trophy, RefreshCw, Share2, Globe, Check, X, ShieldCheck } from 'lucide-react';
import { BALL_SKINS } from '../data/skins';
import { fetchGlobalLeaderboard, shareScoreCard } from '../services/leaderboardService';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
  onClear: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries: initialEntries,
  currentPlayerName,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<GameMode | 'all'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialEntries);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load live scores from Firestore
  const loadLiveLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchGlobalLeaderboard(activeTab);
      setLeaderboard(data);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveLeaderboard();
  }, [activeTab]);

  // Find current player top entry
  const topPlayerEntry = leaderboard.find(
    (e) => currentPlayerName && e.playerName.toLowerCase() === currentPlayerName.toLowerCase()
  );

  const playerRank = topPlayerEntry
    ? leaderboard.findIndex((e) => e.id === topPlayerEntry.id) + 1
    : null;

  const handleShareTopRank = async () => {
    if (!topPlayerEntry || !playerRank) return;
    const res = await shareScoreCard(
      topPlayerEntry.playerName,
      topPlayerEntry.score,
      playerRank,
      topPlayerEntry.mode,
      topPlayerEntry.timeSurvived
    );
    if (res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight">Global Leaderboard</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[10px] font-extrabold uppercase">
                  <Globe className="w-2.5 h-2.5 animate-pulse" /> Live Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time Scores via Firebase Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter */}
        <div className="flex rounded-2xl bg-slate-800/60 p-1 border border-slate-700/60 gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'endless', label: 'Endless' },
            { id: 'campaign', label: 'Campaign' },
            { id: 'precision', label: 'Precision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GameMode | 'all')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs font-semibold">Syncing Real Global Scores...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              No global scores recorded yet in this mode! Be the first to balance and post!
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const skin = BALL_SKINS.find((s) => s.id === entry.skinId) || BALL_SKINS[0];
              const isCurrentPlayer =
                currentPlayerName && entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrentPlayer
                      ? 'bg-cyan-950/50 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : idx === 0
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-800/90 border-slate-400/60 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-900/30 border-amber-700/50 text-amber-300'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx === 0 ? '👑' : idx + 1}
                    </div>

                    {/* Skin & Player Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{skin.icon}</span>
                        <span className="font-bold text-sm tracking-tight">{entry.playerName}</span>
                        {isCurrentPlayer && (
                          <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black tracking-wider uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.mode.toUpperCase()} • Survived {entry.timeSurvived}s
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-mono font-black text-base text-cyan-400">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">PTS</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions: Share & Refresh */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          {topPlayerEntry && playerRank && (
            <button
              onClick={handleShareTopRank}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Rank Challenge to Clipboard!' : `Boast Rank #${playerRank} to Friends!`}</span>
            </button>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={loadLiveLeaderboard}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Scores</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> 1 Slot per IP Fair Play
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
