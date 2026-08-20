import React, { useEffect, useState } from 'react';
import {
  Challenge,
  ChallengeResult,
  DifficultyTier,
  GameMode,
  Language,
  PlayMode,
  PlayerProfile,
} from './types';
import { soundManager } from './utils/audio';
import {
  generateCampaignChallenges,
  generateChallengeByMode,
  generateDailyChallenges,
} from './utils/generator';
import { translations } from './utils/i18n';
import {
  AppSettings,
  getStoredProfile,
  getStoredSettings,
  saveStoredProfile,
  saveStoredSettings,
  updateProfileAfterChallenge,
} from './utils/storage';

// Subcomponents & Modals
import { AchievementsModal } from './components/AchievementsModal';
import { ChallengeView } from './components/ChallengeView';
import { LeaderboardModal } from './components/LeaderboardModal';
import { submitAwarenessScore } from './services/leaderboardService';
import { MainMenu } from './components/MainMenu';
import { MasteryModal } from './components/MasteryModal';
import { Navbar } from './components/Navbar';
import { PracticeModal } from './components/PracticeModal';
import { SessionSummary } from './components/SessionSummary';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(getStoredProfile);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);

  // App Navigation View
  const [currentView, setCurrentView] = useState<'menu' | 'playing' | 'summary'>('menu');
  const [playMode, setPlayMode] = useState<PlayMode>('campaign');
  const [modeTitle, setModeTitle] = useState<string>('Perception Challenge');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [sessionResults, setSessionResults] = useState<ChallengeResult[]>([]);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);

  // Sync sound settings with audio manager
  useEffect(() => {
    soundManager.setEnabled(settings.sound);
  }, [settings.sound]);

  const handleToggleSound = () => {
    const nextSound = !settings.sound;
    const newSettings = { ...settings, sound: nextSound };
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    soundManager.setEnabled(nextSound);
  };

  const handleChangeLanguage = (newLang: Language) => {
    const newSettings = { ...settings, language: newLang };
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // 1. Start Daily Challenge
  // The first attempt each day is seeded purely by date, so every player gets the same
  // fixed challenge for fair leaderboard comparison. Any replay the same day uses a fresh
  // random seed instead, so "play again" doesn't just repeat the exact same content.
  const handleStartDaily = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const alreadyAttemptedToday = profile.lastDailyDate === todayStr;
    const seed = alreadyAttemptedToday ? `${todayStr}-replay-${Math.floor(Math.random() * 1e9)}` : todayStr;
    const dailyList = generateDailyChallenges(seed);
    setChallenges(dailyList);
    setPlayMode('daily');
    setModeTitle(translations[settings.language].dailyChallenge);
    setCurrentView('playing');
  };

  // 2. Start Campaign Mode
  const handleStartCampaign = () => {
    const currentStage = profile.unlockedLevel || 1;
    // Generate a mini-campaign set of 5 challenges around current stage
    const campaignList: Challenge[] = [];
    const modes: GameMode[] = ['notice', 'remember', 'focus', 'shift', 'perceive'];
    for (let i = 0; i < 5; i++) {
      const stageNum = currentStage + i;
      const mode = modes[(stageNum - 1) % modes.length];
      const diff = Math.min(10, Math.floor((stageNum - 1) / 5) + 1);
      campaignList.push(generateChallengeByMode(mode, diff));
    }

    setChallenges(campaignList);
    setPlayMode('campaign');
    setModeTitle(`${translations[settings.language].playCampaign} · Stage ${currentStage}`);
    setCurrentView('playing');
  };

  // 3. Start Practice Mode
  const handleStartPractice = (mode: GameMode, tier: DifficultyTier) => {
    setIsPracticeOpen(false);
    const baseDiff = tier === 'beginner' ? 2 : tier === 'advanced' ? 5 : 8;
    const practiceList: Challenge[] = [];
    for (let i = 0; i < 5; i++) {
      practiceList.push(generateChallengeByMode(mode, baseDiff + (i % 2)));
    }
    setChallenges(practiceList);
    setPlayMode('practice');
    setModeTitle(`${translations[settings.language].practiceMode} (${mode.toUpperCase()})`);
    setCurrentView('playing');
  };

  // 4. Start Endless Mode
  const handleStartEndless = () => {
    const endlessList: Challenge[] = [];
    const modes: GameMode[] = ['notice', 'remember', 'focus', 'shift', 'perceive'];
    for (let i = 0; i < 15; i++) {
      const mode = modes[i % modes.length];
      const diff = Math.min(10, Math.floor(i / 2) + 2);
      endlessList.push(generateChallengeByMode(mode, diff));
    }
    setChallenges(endlessList);
    setPlayMode('endless');
    setModeTitle(translations[settings.language].endlessMode);
    setCurrentView('playing');
  };

  // On session completion
  const handleFinishSession = (results: ChallengeResult[]) => {
    setSessionResults(results);

    let updated = { ...profile };
    results.forEach((r) => {
      const { profile: nextP } = updateProfileAfterChallenge(updated, r);
      updated = nextP;
    });

    const sessionTotal = results.reduce((sum, r) => sum + r.score, 0);

    // Update Personal Bests
    if (playMode === 'campaign' && sessionTotal > updated.personalBests.campaignScore) {
      updated.personalBests.campaignScore = sessionTotal;
      updated.unlockedLevel = Math.min(50, (updated.unlockedLevel || 1) + 1);
    } else if (playMode === 'daily') {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (updated.lastDailyDate !== todayStr) {
        updated.dailyStreak = (updated.dailyStreak || 0) + 1;
        updated.lastDailyDate = todayStr;
      }
      if (sessionTotal > updated.personalBests.dailyScore) {
        updated.personalBests.dailyScore = sessionTotal;
      }
    } else if (playMode === 'endless' && sessionTotal > updated.personalBests.endlessScore) {
      updated.personalBests.endlessScore = sessionTotal;
    }

    setProfile(updated);
    saveStoredProfile(updated);
    submitAwarenessScore(updated);
    setCurrentView('summary');
  };

  const handlePlayAgain = () => {
    if (playMode === 'daily') {
      handleStartDaily();
    } else if (playMode === 'campaign') {
      handleStartCampaign();
    } else if (playMode === 'endless') {
      handleStartEndless();
    } else {
      setIsPracticeOpen(true);
      setCurrentView('menu');
    }
  };

  return (
    <div
      className={`h-full bg-slate-950 text-slate-100 antialiased font-sans flex flex-col overflow-hidden ${
        settings.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Navigation Header */}
      <Navbar
        profile={profile}
        language={settings.language}
        soundEnabled={settings.sound}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMastery={() => setIsMasteryOpen(true)}
      />

      {/* Main View Router */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {currentView === 'menu' && (
          <MainMenu
            profile={profile}
            language={settings.language}
            onStartDaily={handleStartDaily}
            onStartCampaign={handleStartCampaign}
            onOpenPractice={() => setIsPracticeOpen(true)}
            onStartEndless={handleStartEndless}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenMastery={() => setIsMasteryOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
          />
        )}

        {currentView === 'playing' && (
          <ChallengeView
            challenges={challenges}
            modeTitle={modeTitle}
            language={settings.language}
            highContrast={settings.highContrast}
            onFinishSession={handleFinishSession}
            onQuit={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'summary' && (
          <SessionSummary
            results={sessionResults}
            playMode={playMode}
            profile={profile}
            language={settings.language}
            onPlayAgain={handlePlayAgain}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}
      </div>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <MasteryModal
        isOpen={isMasteryOpen}
        onClose={() => setIsMasteryOpen(false)}
        profile={profile}
        language={settings.language}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        profile={profile}
        language={settings.language}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        profile={profile}
        language={settings.language}
      />

      <PracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        language={settings.language}
        onStartPractice={handleStartPractice}
      />
    </div>
  );
}
