import React, { useState, useEffect } from 'react';
import { GameMode, PlayerProgress, WorldId } from './types';
import { loadPlayerProgress, savePlayerProgress, updateMindProfileOnCompletion } from './utils/storage';
import { sound } from './utils/audio';
import { LanguageProvider, useI18n } from './i18n/context';
import { Header } from './components/Header';
import { JourneyView } from './components/JourneyView';
import { DailyMachineView } from './components/DailyMachineView';
import { EndlessLabView } from './components/EndlessLabView';
import { ChallengeLabView } from './components/ChallengeLabView';
import { LearnTutorial } from './components/LearnTutorial';
import { MindProfileModal } from './components/MindProfileModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Compass, Calendar, Infinity as InfinityIcon, Sliders, BookOpen, Brain, Trophy, Award } from 'lucide-react';
import { Tile } from '../../ui';

function MainApp() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadPlayerProgress());
  const [gameMode, setGameMode] = useState<GameMode>('journey');
  const [showMindProfile, setShowMindProfile] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const { t } = useI18n();

  // Sync audio enabled state with progress settings
  useEffect(() => {
    sound.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

  // Save progress changes to LocalStorage
  const handleUpdateProgress = (updater: (prev: PlayerProgress) => PlayerProgress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      savePlayerProgress(updated);
      return updated;
    });
  };

  const handleToggleSound = () => {
    handleUpdateProgress((p) => ({
      ...p,
      soundEnabled: !p.soundEnabled,
    }));
  };

  const handleCompleteJourneyPuzzle = (
    puzzleId: string,
    worldId: WorldId,
    scoreEarned: number,
    hintsUsed: number
  ) => {
    handleUpdateProgress((p) => {
      const completedIds = p.completedPuzzleIds.includes(puzzleId)
        ? p.completedPuzzleIds
        : [...p.completedPuzzleIds, puzzleId];

      const newScore = p.totalScore + scoreEarned;

      // Unlock next world if world 1-7 completed
      const nextWorldId = (worldId + 1) as WorldId;
      const unlockedWorlds =
        worldId < 8 && !p.unlockedWorlds.includes(nextWorldId)
          ? [...p.unlockedWorlds, nextWorldId]
          : p.unlockedWorlds;

      const newMindProfile = updateMindProfileOnCompletion(
        p.mindProfile,
        worldId,
        scoreEarned,
        hintsUsed
      );

      return {
        ...p,
        completedPuzzleIds: completedIds,
        totalScore: newScore,
        unlockedWorlds,
        mindProfile: newMindProfile,
      };
    });
  };

  const handleCompleteDailyMachine = (scoreEarned: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    handleUpdateProgress((p) => {
      const newStreak = p.lastDailyDate === todayStr ? p.dailyStreak : p.dailyStreak + 1;
      return {
        ...p,
        dailyStreak: newStreak,
        lastDailyDate: todayStr,
        dailyCompleted: true,
        totalScore: p.totalScore + scoreEarned,
      };
    });
  };

  const handleEarnScore = (score: number) => {
    handleUpdateProgress((p) => ({
      ...p,
      totalScore: p.totalScore + score,
    }));
  };

  const MODE_TABS: {mode: GameMode; label: string; icon: React.ReactNode; accent: string}[] = [
    {mode: 'journey', label: t('nav.journey'), icon: <Compass className="w-3.5 h-3.5" />, accent: 'violet'},
    {mode: 'daily', label: t('nav.daily'), icon: <Calendar className="w-3.5 h-3.5 text-amber-400" />, accent: 'amber'},
    {mode: 'endless', label: t('nav.endless'), icon: <InfinityIcon className="w-3.5 h-3.5 text-emerald-400" />, accent: 'emerald'},
    {mode: 'challenge', label: t('nav.challenge'), icon: <Sliders className="w-3.5 h-3.5 text-purple-400" />, accent: 'purple'},
    {mode: 'learn', label: t('nav.learn'), icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" />, accent: 'blue'},
  ];

  const ACCENT_ACTIVE: Record<string, string> = {
    violet: 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm',
    amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm',
    emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm',
    purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm',
    blue: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm',
  };

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-violet-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header
        progress={progress}
        onToggleSound={handleToggleSound}
        onGoHome={() => setGameMode('journey')}
      />

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">

      {/* Hero */}
      <div className="shrink-0 flex flex-col items-center text-center pt-8 pb-1 max-w-2xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-violet-400 text-xs font-semibold mb-2 shadow-lg">
          <Compass className="w-3.5 h-3.5" />
          <span>{t('brand.tagline')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
          {t('brand.hook')}
        </h1>
      </div>

      {/* Mode Tab Switcher */}
      <div className="shrink-0 px-2 py-4 max-w-2xl mx-auto w-full">
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80 shadow-lg backdrop-blur-md w-full">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => { sound.playClick(); setGameMode(tab.mode); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                gameMode === tab.mode
                  ? ACCENT_ACTIVE[tab.accent]
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Mode View Container */}
      <main className="py-2 px-2 sm:px-4 max-w-2xl mx-auto w-full">
        {gameMode === 'journey' && (
          <JourneyView
            progress={progress}
            onCompletePuzzle={handleCompleteJourneyPuzzle}
          />
        )}

        {gameMode === 'daily' && (
          <DailyMachineView
            onCompleteDaily={handleCompleteDailyMachine}
            dailyStreak={progress.dailyStreak}
          />
        )}

        {gameMode === 'endless' && (
          <EndlessLabView
            onEarnScore={handleEarnScore}
            highScore={progress.endlessHighScore}
          />
        )}

        {gameMode === 'challenge' && (
          <ChallengeLabView onEarnScore={handleEarnScore} />
        )}

        {gameMode === 'learn' && (
          <LearnTutorial onStartJourney={() => setGameMode('journey')} />
        )}
      </main>
      </div>

      {/* Bottom Utility Row */}
      <div className="shrink-0 max-w-2xl mx-auto w-full px-2 sm:px-4 pb-4">
        <div className="flex items-center gap-3 h-[68px] pt-3 border-t border-slate-900">
          <Tile
            icon={<Brain className="w-5 h-5" />}
            label={t('header.mindProfile')}
            onClick={() => { sound.playClick(); setShowMindProfile(true); }}
            accentText="text-purple-400"
          />
          <Tile
            icon={<Trophy className="w-5 h-5" />}
            label={t('header.leaderboard')}
            onClick={() => { sound.playClick(); setShowLeaderboard(true); }}
            accentText="text-amber-400"
          />
          <Tile
            icon={<Award className="w-5 h-5" />}
            label={t('header.achievements')}
            onClick={() => { sound.playClick(); setShowAchievements(true); }}
            accentText="text-violet-400"
          />
        </div>
      </div>

      {/* Mind Profile Modal */}
      {showMindProfile && (
        <MindProfileModal
          mindProfile={progress.mindProfile}
          totalScore={progress.totalScore}
          onClose={() => setShowMindProfile(false)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          totalScore={progress.totalScore}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsModal
          progress={progress}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
