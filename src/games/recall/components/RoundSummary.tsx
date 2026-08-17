import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { GameMode, Language, PlayerStats } from '../types';
import { getLevelInfo, saveLeaderboardRecord } from '../utils/storage';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface RoundSummaryProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  gameMode: GameMode;
  stats: PlayerStats;
  language: Language;
  roundStreak?: number;
  isRecordBroken?: boolean;
  onOpenLeaderboard?: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  score,
  totalQuestions,
  xpEarned,
  gameMode,
  stats,
  language,
  roundStreak,
  isRecordBroken = false,
  onOpenLeaderboard,
  onPlayAgain,
  onGoHome,
}) => {
  const levelInfo = getLevelInfo(stats.xp);
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const displayStreak = roundStreak !== undefined ? roundStreak : stats.currentStreak;

  useEffect(() => {
    soundManager.playLevelUp();
    confetti({
      particleCount: isRecordBroken ? 120 : 80,
      spread: isRecordBroken ? 90 : 70,
      origin: { y: 0.55 },
    });

    // Auto-record run in leaderboard, identity sourced from the shared profile
    if (score > 0 || stats.bestStreak > 0) {
      const cleanName = stats.playerName || (language.startsWith('zh') ? '挑战者' : 'Challenger');
      saveLeaderboardRecord({
        id: `run_${Date.now()}`,
        name: cleanName,
        avatar: stats.playerAvatar || '🧠',
        country: stats.playerCountry || '🌐',
        streak: stats.bestStreak,
        xp: stats.xp,
        score: score,
        totalQuestions: totalQuestions,
        gameMode: gameMode,
        date: new Date().toISOString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecordBroken, score, totalQuestions, gameMode, stats.bestStreak, stats.xp, stats.playerName, stats.playerAvatar, stats.playerCountry, language]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-8 space-y-5 text-center animate-fade-in">
      {/* Hero Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-4xl shadow-xl shadow-orange-500/25 border-2 border-amber-300"
      >
        {isRecordBroken ? '👑' : '🏆'}
      </motion.div>

      {/* Summary Title & XP */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t(language, 'summaryTitle')}
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
          +{xpEarned} {t(language, 'xpEarned')}
        </p>
      </div>

      {/* Record Broken Banner */}
      {isRecordBroken && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border-2 border-amber-400/80 shadow-xl shadow-amber-500/10 text-left space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <div>
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                {t(language, 'recordBroken')}
              </h3>
              <p className="text-[11px] text-slate-300 leading-tight">
                {t(language, 'recordBrokenDesc')}
              </p>
            </div>
          </div>

          {onOpenLeaderboard && (
            <div className="pt-1 text-right">
              <button
                onClick={() => {
                  soundManager.playTap();
                  onOpenLeaderboard();
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-black inline-flex items-center gap-1 underline underline-offset-2"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{t(language, 'viewLeaderboard')} (Top 20) →</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Score Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-2xl font-black text-white font-mono">
            {score} / {totalQuestions}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">
            {t(language, 'score')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">
            {t(language, 'accuracy')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 col-span-2 sm:col-span-1">
          <div className="text-2xl font-black text-orange-400 font-mono flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-500" />
            {displayStreak}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">
            {t(language, 'streak')}
          </div>
        </div>
      </div>

      {/* Level Progress Banner */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-amber-400">
            Lv.{levelInfo.level} {language === 'zh-CN' ? levelInfo.titleZhSimp : levelInfo.title}
          </span>
          <span className="text-slate-400 font-mono">{stats.xp} XP</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onGoHome}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
        >
          <Home className="w-4 h-4" />
          <span>{t(language, 'backToHome')}</span>
        </button>

        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>{t(language, 'playAgain')}</span>
        </button>
      </div>
    </div>
  );
};
