import React from 'react';
import { Play, Flame, Heart, Calendar, Sparkles, Compass, CheckCircle2, Users, ShieldAlert, Award, Trophy, Crown } from 'lucide-react';
import { AgeTier, CategoryId, GameMode, Language, PlayerStats } from '../types';
import { CATEGORIES } from '../data/categories';
import { CURATED_QUESTIONS } from '../data/questions';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';
import { getTodayDateString } from '../utils/storage';

interface HomeScreenProps {
  stats: PlayerStats;
  language: Language;
  ageTier: AgeTier;
  hasCustomApiKey?: boolean;
  onChangeAgeTier: (tier: AgeTier) => void;
  onStartGame: (mode: GameMode, categoryId?: CategoryId) => void;
  onOpenAIChallenge: () => void;
  onOpenLeaderboard?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  language,
  ageTier,
  hasCustomApiKey,
  onChangeAgeTier,
  onStartGame,
  onOpenAIChallenge,
  onOpenLeaderboard,
}) => {
  const todayStr = getTodayDateString();
  const isDailyDone = stats.dailyChallengeCompletedDates?.includes(todayStr);

  const currentAgeTier: AgeTier = ageTier || 'teen';

  const getAgeTierBadge = (tier: AgeTier) => {
    switch (tier) {
      case 'kids':
        return { label: t(language, 'kidsTierShort'), emoji: '🌱', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'adult':
        return { label: t(language, 'adultTierShort'), emoji: '🧠', color: 'from-purple-500 to-rose-600', text: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'teen':
      default:
        return { label: t(language, 'teenTierShort'), emoji: '⚡', color: 'from-amber-500 to-orange-600', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    }
  };

  const activeTierBadge = getAgeTierBadge(currentAgeTier);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t(language, 'tagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          {t(language, 'appTitle')}
        </h1>
      </div>

      {/* Target Audience / Difficulty Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200">
              {t(language, 'selectAgeTierMode')}
            </h2>
          </div>
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeTierBadge.bg} ${activeTierBadge.text}`}>
            {activeTierBadge.emoji} {activeTierBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Kids Mode */}
          <button
            onClick={() => {
              soundManager.playTap();
              onChangeAgeTier('kids');
            }}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
              currentAgeTier === 'kids'
                ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🌱</span>
              {currentAgeTier === 'kids' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="mt-2">
              <div className={`text-xs font-extrabold ${currentAgeTier === 'kids' ? 'text-emerald-300' : 'text-slate-200'}`}>
                {t(language, 'kidsTierShort')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {t(language, 'easyFacts')}
              </div>
            </div>
          </button>

          {/* Teenager Mode */}
          <button
            onClick={() => {
              soundManager.playTap();
              onChangeAgeTier('teen');
            }}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
              currentAgeTier === 'teen'
                ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">⚡</span>
              {currentAgeTier === 'teen' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="mt-2">
              <div className={`text-xs font-extrabold ${currentAgeTier === 'teen' ? 'text-amber-300' : 'text-slate-200'}`}>
                {t(language, 'teenTierShort')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {t(language, 'challenging')}
              </div>
            </div>
          </button>

          {/* Adult Mode */}
          <button
            onClick={() => {
              soundManager.playTap();
              onChangeAgeTier('adult');
            }}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
              currentAgeTier === 'adult'
                ? 'bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🧠</span>
              {currentAgeTier === 'adult' && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              )}
            </div>
            <div className="mt-2">
              <div className={`text-xs font-extrabold ${currentAgeTier === 'adult' ? 'text-purple-300' : 'text-slate-200'}`}>
                {t(language, 'adultTierShort')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {t(language, 'hardAndTricky')}
              </div>
            </div>
          </button>
        </div>

        {/* Active Mode Description */}
        <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {currentAgeTier === 'kids' && t(language, 'kidsTierDesc')}
            {currentAgeTier === 'teen' && t(language, 'teenTierDesc')}
            {currentAgeTier === 'adult' && t(language, 'adultTierDesc')}
          </span>
        </p>
      </div>

      {/* Main Play CTA Button */}
      <button
        onClick={() => onStartGame('quick')}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all"
      >
        <div className="bg-slate-950/40 backdrop-blur-sm group-hover:bg-transparent transition-colors px-6 py-4 rounded-[14px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
            </div>
            <div className="text-left">
              <div className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>{t(language, 'playNow')}</span>
              </div>
              <div className="text-xs text-amber-200/80 font-medium">
                {t(language, 'quickPlayDesc')}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-amber-300 font-bold text-xs bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              10 Qs
            </span>
            <span className="text-[10px] font-bold text-amber-200 opacity-90">
              {activeTierBadge.emoji} {activeTierBadge.label}
            </span>
          </div>
        </div>
      </button>

      {/* Game Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Daily Challenge */}
        <button
          onClick={() => onStartGame('daily')}
          className="relative p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-amber-500/40 group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            {isDailyDone ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {t(language, 'dailyDoneToday')}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Daily
              </span>
            )}
          </div>
          <div className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
            {t(language, 'dailyChallenge')}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {t(language, 'dailyDesc')}
          </div>
        </button>

        {/* Endless Mode */}
        <button
          onClick={() => onStartGame('endless')}
          className="relative p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-rose-500/40 group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500/50" />
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              3 Lives ❤️
            </span>
          </div>
          <div className="font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
            {t(language, 'endlessMode')}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {t(language, 'endlessDesc')}
          </div>
        </button>

        {/* Streak Mode */}
        <button
          onClick={() => onStartGame('streak')}
          className="relative p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-orange-500/40 group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500/50" />
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              1 Life · 0 Mistakes ⚠️
            </span>
          </div>
          <div className="font-bold text-slate-100 group-hover:text-orange-300 transition-colors">
            {t(language, 'streakMode')}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {t(language, 'streakDesc')}
          </div>
        </button>

        {/* AI Challenge */}
        <button
          onClick={onOpenAIChallenge}
          className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 hover:from-indigo-900/80 hover:to-purple-900/80 border border-indigo-500/30 text-left transition-all hover:border-indigo-400/60 group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            {hasCustomApiKey ? (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.7
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {t(language, 'apiKeyRequiredBadge')}
              </span>
            )}
          </div>
          <div className="font-bold text-indigo-200 group-hover:text-white transition-colors">
            {t(language, 'aiChallenge')}
          </div>
          <div className="text-xs text-indigo-300/80 mt-0.5">
            {t(language, 'aiDesc')}
          </div>
        </button>
      </div>

      {/* Global Leaderboard & Best Streak Banner */}
      {onOpenLeaderboard && (
        <button
          onClick={() => {
            soundManager.playTap();
            onOpenLeaderboard();
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/30 hover:border-amber-500/60 flex items-center justify-between text-left transition-all hover:shadow-lg hover:shadow-amber-500/5 group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {t(language, 'globalLeaderboard')}
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold px-1.5 py-0.5 rounded-full">
                  🔥 Best: {stats.bestStreak}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(language, 'leaderboardDesc')}
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            →
          </div>
        </button>
      )}

      {/* Categories Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-slate-200">
              {t(language, 'categories')}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {CATEGORIES.length - 1} {language.startsWith('zh') ? '个主题' : 'Topics'} · {CURATED_QUESTIONS.length} {t(language, 'questionsCountLabel')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const catName =
              language === 'zh-CN'
                ? cat.nameZhSimp
                : language === 'zh-TW'
                ? cat.nameZhTrad
                : cat.name;

            const qCount =
              cat.id === 'mixed'
                ? CURATED_QUESTIONS.length
                : CURATED_QUESTIONS.filter((q) => q.category === cat.id).length;

            const categoryStats = stats.categoryStats?.[cat.id] || { attempted: 0, correct: 0 };

            return (
              <button
                key={cat.id}
                onClick={() => onStartGame('category', cat.id)}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/30 text-left transition-all group flex flex-col justify-between active:scale-[0.97]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </span>
                  <div className="flex items-center gap-1">
                    {categoryStats.attempted > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {Math.round((categoryStats.correct / categoryStats.attempted) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                    {catName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {qCount} {language.startsWith('zh') ? '题' : 'Questions'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
