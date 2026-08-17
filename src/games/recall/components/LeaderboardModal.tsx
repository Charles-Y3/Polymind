import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Zap, Calendar, X, Play, Award } from 'lucide-react';
import { Language, LeaderboardRecord, PlayerStats } from '../types';
import { getLevelInfo, loadLeaderboardRecords, fetchServerLeaderboard } from '../utils/storage';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface LeaderboardModalProps {
  stats: PlayerStats;
  language: Language;
  onPlayNow?: () => void;
  onClose: () => void;
}

type TabType = 'streak' | 'xp' | 'daily';

interface DisplayEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  country: string;
  value: number;
  subValue: string;
  badge?: string;
  date?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  stats,
  language,
  onPlayNow,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('streak');
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  const levelInfo = getLevelInfo(stats.xp);

  // Load real records on mount and sync with server
  useEffect(() => {
    const loaded = loadLeaderboardRecords();
    setRecords(loaded);

    fetchServerLeaderboard().then((serverRecords) => {
      if (serverRecords && serverRecords.length > 0) {
        setRecords(serverRecords);
      }
    });
  }, []);

  // Build ranked display list from real records only
  const getRankedEntries = (): DisplayEntry[] => {
    if (!records || records.length === 0) return [];

    let sorted = [...records];
    if (activeTab === 'streak') {
      sorted.sort((a, b) => b.streak - a.streak || b.xp - a.xp);
    } else if (activeTab === 'xp') {
      sorted.sort((a, b) => b.xp - a.xp || b.streak - a.streak);
    } else {
      sorted.sort((a, b) => b.score - a.score || b.xp - a.xp);
    }

    // Limit to Top 20
    return sorted.slice(0, 20).map((r, idx) => {
      const rank = idx + 1;
      let badge = undefined;
      if (rank === 1) badge = '🥇';
      else if (rank === 2) badge = '🥈';
      else if (rank === 3) badge = '🥉';

      let val = r.streak;
      let sub = `${r.xp.toLocaleString()} XP · ${r.score} Correct`;
      if (activeTab === 'xp') {
        val = r.xp;
        sub = `${r.streak} Best Streak · ${r.score} Correct`;
      } else if (activeTab === 'daily') {
        val = r.score;
        sub = `${r.streak} Streak · ${r.xp.toLocaleString()} XP`;
      }

      return {
        id: r.id,
        rank,
        name: r.name,
        avatar: r.avatar || '🧠',
        country: r.country || '🌐',
        value: val,
        subValue: sub,
        badge,
        date: r.date,
      };
    });
  };

  const displayList = getRankedEntries();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white leading-none">
                  {t(language, 'globalLeaderboard')}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  TOP 20
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {t(language, 'leaderboardDesc')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundManager.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Buttons (Top 20 metrics) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              soundManager.playTap();
              setActiveTab('streak');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'streak'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{t(language, 'rankAllTime')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTap();
              setActiveTab('xp');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'xp'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{t(language, 'rankWeeklyXP')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTap();
              setActiveTab('daily');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-purple-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t(language, 'rankDaily')}</span>
          </button>
        </div>

        {/* Player Profile Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border border-amber-500/35 space-y-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-md border border-amber-300">
              {stats.playerAvatar || '🧠'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <span>{stats.playerCountry || '🌐'}</span>
                  <span>{stats.playerName}</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                  Lv.{levelInfo.level}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                {activeTab === 'streak' && `${t(language, 'bestStreak')}: ${stats.bestStreak} 🔥`}
                {activeTab === 'xp' && `${t(language, 'totalXpLabel')}: ${stats.xp.toLocaleString()} XP ⚡`}
                {activeTab === 'daily' && `${stats.dailyChallengeCompletedDates?.length || 0} ${language.startsWith('zh') ? '天已打卡' : 'Days Mastered'} 📅`}
              </div>
            </div>
          </div>
        </div>

        {/* Real Leaderboard Records List or Clean Empty State */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {displayList.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-2xl border border-slate-700 text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">
                  {t(language, 'noLeaderboardRecords')}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {t(language, 'noLeaderboardRecordsDesc')}
                </p>
              </div>

              {onPlayNow && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onPlayNow();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t(language, 'playNow')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            displayList.map((item) => {
              const isTop3 = item.rank <= 3;

              return (
                <div
                  key={`${item.id}_${item.rank}`}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                    isTop3
                      ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  {/* Rank + Avatar + Name */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="w-7 text-center font-black text-xs font-mono shrink-0">
                      {item.badge ? (
                        <span className="text-base">{item.badge}</span>
                      ) : (
                        <span className={item.rank <= 10 ? 'text-amber-400/90 font-bold' : 'text-slate-500'}>
                          #{item.rank}
                        </span>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-700">
                      {item.avatar}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                          {item.name}
                        </span>
                        <span className="text-xs shrink-0">{item.country}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {item.subValue}
                      </div>
                    </div>
                  </div>

                  {/* Metric Value */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-amber-400 flex items-center justify-end gap-1">
                      {activeTab === 'streak' && (
                        <>
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-400" />
                          <span>{item.value}</span>
                        </>
                      )}
                      {activeTab === 'xp' && (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.value.toLocaleString()} XP</span>
                        </>
                      )}
                      {activeTab === 'daily' && (
                        <>
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.value}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors text-center"
          >
            {t(language, 'done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
