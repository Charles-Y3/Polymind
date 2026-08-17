import React from 'react';
import { Language, PlayerProfile } from '../types';
import { skillLabels, translations } from '../utils/i18n';
import { calculateMasteryLevel } from '../utils/storage';
import { Tile } from '../../../ui';

interface MainMenuProps {
  profile: PlayerProfile;
  language: Language;
  onStartDaily: () => void;
  onStartCampaign: () => void;
  onOpenPractice: () => void;
  onStartEndless: () => void;
  onOpenLeaderboard: () => void;
  onOpenMastery: () => void;
  onOpenAchievements: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  language,
  onStartDaily,
  onStartCampaign,
  onOpenPractice,
  onStartEndless,
  onOpenLeaderboard,
  onOpenMastery,
  onOpenAchievements,
}) => {
  const t = translations[language];
  const mastery = calculateMasteryLevel(profile.xp);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isDailyDoneToday = profile.lastDailyDate === todayStr;

  return (
    <div id="main-menu-container" className="h-full w-full flex flex-col overflow-hidden">
    <div className="flex-1 min-h-0 overflow-y-auto">
    <div className="w-full flex flex-col items-center p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Top Title & Philosophy Banner */}
      <div className="w-full text-center my-4 sm:my-6 animate-fadeIn">
        {/* Category pill */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-800/60 text-fuchsia-400 text-[11px] font-bold mb-3 shadow-lg">
          <span>👁️</span>
          <span>{t.heroPill}</span>
        </div>

        {/* Eye visual focal emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-fuchsia-500/20 via-slate-900 to-pink-500/20 border border-fuchsia-500/40 shadow-xl shadow-fuchsia-500/10 mb-3 text-3xl sm:text-4xl select-none">
          👁️
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
          {t.gameSubtitle}
        </h1>
        <p className="text-xs text-slate-400 italic mt-1 font-serif">
          &ldquo;{t.philosophy}&rdquo;
        </p>
      </div>

      {/* Main Mode Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-2">
        {/* 1. Daily Challenge Card */}
        <div
          id="main-daily-challenge-card"
          onClick={onStartDaily}
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-fuchsia-950/40 via-slate-900 to-slate-950 border border-fuchsia-500/40 hover:border-fuchsia-400 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-fuchsia-400 font-bold block mb-1">
                {todayStr}
              </span>
              <h2 className="text-lg font-black text-slate-100 group-hover:text-fuchsia-300 transition-colors">
                {t.dailyChallenge}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.dailySeedDesc} ({t.dailyTasksCount})
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center text-xl shadow-md">
              📅
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-fuchsia-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-fuchsia-400 font-bold flex items-center gap-1">
              🔥 {t.streakDays.replace('{days}', String(profile.dailyStreak))}
            </span>
            <span className="text-slate-300 font-semibold group-hover:translate-x-1 transition-transform">
              {isDailyDoneToday ? (
                <span className="text-emerald-400 font-bold">
                  {t.doneScore.replace('{score}', String(profile.personalBests.dailyScore))}
                </span>
              ) : (
                t.startTest
              )}
            </span>
          </div>
        </div>

        {/* 2. Campaign Mode Card */}
        <div
          id="main-campaign-card"
          onClick={onStartCampaign}
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block mb-1">
                {t.progressiveStagesEyebrow}
              </span>
              <h2 className="text-lg font-black text-slate-100 group-hover:text-indigo-300 transition-colors">
                {t.playCampaign}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.campaignModesSummary}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xl shadow-md">
              🚀
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-300">
              {t.stageProgress.replace('{current}', String(profile.unlockedLevel)).replace('{total}', '50')}
            </span>
            <span className="text-slate-300 font-semibold group-hover:translate-x-1 transition-transform">
              {t.playNext}
            </span>
          </div>
        </div>

        {/* 3. Practice Mode */}
        <div
          id="main-practice-card"
          onClick={onOpenPractice}
          className="group relative p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold block mb-1">
                {t.customSkillEyebrow}
              </span>
              <h2 className="text-lg font-black text-slate-100 group-hover:text-teal-300 transition-colors">
                {t.practiceMode}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.customSkillDesc}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center text-xl">
              🎯
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.modesAvailable}</span>
            <span className="text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
              {t.configure}
            </span>
          </div>
        </div>

        {/* 4. Endless Perception */}
        <div
          id="main-endless-card"
          onClick={onStartEndless}
          className="group relative p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-fuchsia-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-fuchsia-400 font-bold block mb-1">
                {t.endlessEyebrow}
              </span>
              <h2 className="text-lg font-black text-slate-100 group-hover:text-fuchsia-300 transition-colors">
                {t.endlessMode}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.endlessDesc}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center text-xl">
              ⚡
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.bestScore.replace('{score}', String(profile.personalBests.endlessScore))}</span>
            <span className="text-fuchsia-400 font-semibold group-hover:translate-x-1 transition-transform">
              {t.launch}
            </span>
          </div>
        </div>
      </div>

    </div>
    </div>

    {/* Quick Access Utility Bar */}
    <div className="shrink-0 w-full h-[68px] border-t border-slate-800/80 bg-slate-950">
      <div className="max-w-2xl mx-auto h-full flex items-center gap-2 px-4">
        <Tile icon="🏆" label={t.leaderboard} onClick={onOpenLeaderboard} accentText="text-fuchsia-400" />
        <Tile icon="🎖️" label={t.mastery} onClick={onOpenMastery} accentText="text-fuchsia-400" />
        <Tile icon="✨" label={t.achievements} onClick={onOpenAchievements} accentText="text-fuchsia-400" />
      </div>
    </div>
    </div>
  );
};
