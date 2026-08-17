import React, { useState, useEffect, useCallback } from 'react';
import {
  Achievement,
  AgeTier,
  BgmMode,
  CategoryId,
  DiscoveryItem,
  FontSize,
  GameMode,
  Language,
  PlayerStats,
  Question,
} from './types';
import { CURATED_QUESTIONS } from './data/questions';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import {
  DEFAULT_PLAYER_STATS,
  DEFAULT_SETTINGS,
  getLevelInfo,
  getTodayDateString,
  loadDiscoveries,
  loadPlayerStats,
  loadSettings,
  saveDiscoveryItem,
  savePlayerStats,
  saveSettings,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { shuffleQuestionOptions } from './utils/questionUtils';

import { Header } from './components/Header';
import { BottomNav, NavTabId } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { QuestionCard } from './components/QuestionCard';
import { FactCardModal } from './components/FactCardModal';
import { DiscoveriesModal } from './components/DiscoveriesModal';
import { StatsModal } from './components/StatsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AIChallengeModal } from './components/AIChallengeModal';
import { LevelInfoModal } from './components/LevelInfoModal';
import { StreakInfoModal } from './components/StreakInfoModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { RoundSummary } from './components/RoundSummary';

type GameStage = 'home' | 'playing' | 'summary';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_PLAYER_STATS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const [gameStage, setGameStage] = useState<GameStage>('home');
  const [gameMode, setGameMode] = useState<GameMode>('quick');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(3);
  const [showFactModal, setShowFactModal] = useState(false);
  const [roundXpEarned, setRoundXpEarned] = useState(0);
  const [roundStreak, setRoundStreak] = useState(0);
  const [roundBestStreak, setRoundBestStreak] = useState(0);
  const [roundStartBestStreak, setRoundStartBestStreak] = useState(0);
  const [isRoundRecordBroken, setIsRoundRecordBroken] = useState(false);

  // Active Bottom Nav Tab
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('play');

  // Modals
  const [showDiscoveriesModal, setShowDiscoveriesModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  const applyFontSize = useCallback((size: FontSize) => {
    if (typeof document === 'undefined') return;
    if (size === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else if (size === 'xl') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, []);

  // Helper to evaluate all achievements based on current player stats and context
  const evaluateAchievements = useCallback(
    (
      baseStats: PlayerStats,
      currentAchievements: Achievement[],
      context?: {
        currentQ?: Question;
        isCorrect?: boolean;
        gameMode?: GameMode;
        finalScore?: number;
        totalQ?: number;
        savedCount?: number;
        aiPlayed?: boolean;
      }
    ): { newStats: PlayerStats; newAchievements: Achievement[]; newlyUnlockedCount: number } => {
      let updatedStats = { ...baseStats };
      let unlockedSet = new Set(updatedStats.unlockedAchievements || []);
      let xpBonus = 0;
      let newlyUnlockedCount = 0;

      const tryUnlock = (achId: string) => {
        if (!unlockedSet.has(achId)) {
          const ach = currentAchievements.find((a) => a.id === achId);
          if (ach) {
            unlockedSet.add(achId);
            xpBonus += ach.xpReward;
            newlyUnlockedCount++;
          }
        }
      };

      const correct = updatedStats.totalCorrect || 0;
      const streak = Math.max(updatedStats.currentStreak || 0, updatedStats.bestStreak || 0);
      const deceptiveCount = updatedStats.deceptiveCorrect || 0;
      const saved = context?.savedCount !== undefined ? context.savedCount : loadDiscoveries().length;
      const dailyCount = (updatedStats.dailyChallengeCompletedDates || []).length;
      const level = getLevelInfo(updatedStats.xp).level;

      // 1. Streak & Combos
      if (correct >= 1) tryUnlock('first_choice');
      if (streak >= 5) tryUnlock('on_fire');
      if (streak >= 10) tryUnlock('streak_master');
      if (streak >= 20) tryUnlock('unstoppable_legend');
      if (streak >= 35) tryUnlock('godlike_streak');
      if (streak >= 50) tryUnlock('mythic_streak');

      // 2. Deceptive / Traps
      if (deceptiveCount >= 1) tryUnlock('mind_blown');
      if (deceptiveCount >= 5) tryUnlock('trap_buster');
      if (deceptiveCount >= 15) tryUnlock('illusion_breaker');

      // 3. Category Tier 1 (10), Tier 2 (25), Tier 3 (50)
      const cats: Array<{ id: CategoryId; t1: string; t2: string; t3: string }> = [
        { id: 'space', t1: 'space_novice', t2: 'space_cadet', t3: 'space_master' },
        { id: 'animals', t1: 'animal_novice', t2: 'animal_lover', t3: 'animal_master' },
        { id: 'history', t1: 'history_novice', t2: 'history_buff', t3: 'history_master' },
        { id: 'world', t1: 'world_novice', t2: 'world_traveler', t3: 'world_master' },
        { id: 'science', t1: 'science_novice', t2: 'science_guru', t3: 'science_master' },
        { id: 'human_body', t1: 'anatomy_novice', t2: 'anatomy_expert', t3: 'anatomy_master' },
        { id: 'nature', t1: 'nature_novice', t2: 'nature_guardian', t3: 'nature_master' },
        { id: 'everyday', t1: 'everyday_novice', t2: 'everyday_sage', t3: 'everyday_master' },
      ];

      cats.forEach(({ id, t1, t2, t3 }) => {
        const catCorrect = updatedStats.categoryStats?.[id]?.correct || 0;
        if (catCorrect >= 10) tryUnlock(t1);
        if (catCorrect >= 25) tryUnlock(t2);
        if (catCorrect >= 50) tryUnlock(t3);
      });

      // 4. Discoveries collection
      if (saved >= 5) tryUnlock('knowledge_collector_1');
      if (saved >= 20) tryUnlock('knowledge_collector_2');
      if (saved >= 50) tryUnlock('knowledge_collector_3');

      // 5. Round Mastery
      if (context?.finalScore === 10 && context?.totalQ === 10) {
        tryUnlock('perfect_ten');
        if (context.gameMode === 'streak') {
          tryUnlock('streak_run_conqueror');
        }
      }

      // 6. Daily Challenge
      if (dailyCount >= 1) tryUnlock('daily_champion');
      if (dailyCount >= 5) tryUnlock('daily_loyalty');
      if (dailyCount >= 14) tryUnlock('daily_veteran');

      // 7. Total correct milestones
      if (correct >= 25) tryUnlock('trivia_initiate');
      if (correct >= 50) tryUnlock('trivia_expert');
      if (correct >= 100) tryUnlock('centurion');
      if (correct >= 200) tryUnlock('trivia_veteran');
      if (correct >= 350) tryUnlock('trivia_titan');
      if (correct >= 500) tryUnlock('trivia_legend');

      // 8. Knowledge Levels
      if (level >= 5) tryUnlock('level_scholar');
      if (level >= 8) tryUnlock('level_sage');
      if (level >= 10) tryUnlock('level_grandmaster');
      if (level >= 15) tryUnlock('level_supreme_legend');
      if (level >= 20) tryUnlock('level_omniscient');

      // 9. AI Challenge
      if (context?.aiPlayed) tryUnlock('ai_innovator');

      if (newlyUnlockedCount > 0) {
        updatedStats = {
          ...updatedStats,
          xp: updatedStats.xp + xpBonus,
          unlockedAchievements: Array.from(unlockedSet),
        };
        const newLvl = getLevelInfo(updatedStats.xp);
        updatedStats.level = newLvl.level;
        updatedStats.levelTitle = newLvl.title;
      }

      const newAchievements = currentAchievements.map((a) => ({
        ...a,
        isUnlocked: unlockedSet.has(a.id),
      }));

      return { newStats: updatedStats, newAchievements, newlyUnlockedCount };
    },
    []
  );

  // Initial load
  useEffect(() => {
    const loadedStats = loadPlayerStats();
    const loadedSettings = loadSettings();
    const loadedDisc = loadDiscoveries();

    // Re-evaluate achievements retroactively on load
    const { newStats, newAchievements } = evaluateAchievements(
      loadedStats,
      INITIAL_ACHIEVEMENTS,
      { savedCount: loadedDisc.length }
    );

    setStats(newStats);
    setSettings(loadedSettings);
    setDiscoveries(loadedDisc);
    setAchievements(newAchievements);
    savePlayerStats(newStats);

    // Apply font size
    applyFontSize(loadedSettings.fontSize || 'normal');

    soundManager.setMuted(!loadedSettings.soundEnabled);
    if (loadedSettings.soundEnabled && loadedSettings.bgmMode && loadedSettings.bgmMode !== 'off') {
      soundManager.setBgmMode(loadedSettings.bgmMode);
    }
  }, [applyFontSize, evaluateAchievements]);

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: next };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setMuted(!next);
  };

  const handleChangeLanguage = (lang: Language) => {
    const newSettings = { ...settings, language: lang };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleChangeAgeTier = (tier: AgeTier) => {
    const newSettings = { ...settings, ageTier: tier };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleChangeFontSize = (size: FontSize) => {
    const newSettings = { ...settings, fontSize: size };
    setSettings(newSettings);
    saveSettings(newSettings);
    applyFontSize(size);
  };

  const handleChangeBgmMode = (mode: BgmMode) => {
    const newSettings = { ...settings, bgmMode: mode };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setBgmMode(mode);
  };

  const handleChangeCustomApiKey = (key: string) => {
    const newSettings = { ...settings, customGeminiApiKey: key };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleChangeApiPassphrase = (passphrase: string) => {
    const newSettings = { ...settings, apiPassphrase: passphrase };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleCycleBgm = async () => {
    soundManager.playTap();
    await soundManager.unlockAudio();
    const nextMode = await soundManager.cycleBgmMode();
    const newSettings = { ...settings, bgmMode: nextMode };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Helper to build 10-question runs strictly ordered by difficulty & tuned for active AgeTier
  const buildStructuredQuestions = (categoryId?: CategoryId, totalQuestions = 10): Question[] => {
    let pool = [...CURATED_QUESTIONS];

    // Filter by Age Tier preference
    const tier = settings.ageTier || 'teen';
    let tierPool = pool.filter((q) => {
      if (q.ageTier) {
        return q.ageTier === tier || q.ageTier === 'all';
      }
      if (tier === 'kids') return q.difficulty <= 3 && !q.isDeceptive;
      if (tier === 'teen') return q.difficulty >= 2 && q.difficulty <= 4;
      if (tier === 'adult') return q.difficulty >= 3 || q.isDeceptive;
      return true;
    });

    if (tierPool.length >= totalQuestions) {
      pool = tierPool;
    }

    if (categoryId && categoryId !== 'mixed') {
      const catPool = pool.filter((q) => q.category === categoryId);
      if (catPool.length >= 5) {
        pool = catPool;
      } else {
        const rest = CURATED_QUESTIONS.filter((q) => q.category !== categoryId);
        pool = [...catPool, ...rest];
      }
    }

    const byDiff: Record<number, Question[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    pool.forEach((q) => {
      if (byDiff[q.difficulty]) {
        byDiff[q.difficulty].push(q);
      }
    });

    Object.keys(byDiff).forEach((key) => {
      const d = Number(key);
      byDiff[d].sort(() => Math.random() - 0.5);
    });

    const selected: Question[] = [];
    const perLevel = Math.max(1, Math.floor(totalQuestions / 5));

    for (let diff = 1; diff <= 5; diff++) {
      const list = byDiff[diff] || [];
      selected.push(...list.slice(0, perLevel));
    }

    if (selected.length < totalQuestions) {
      const usedIds = new Set(selected.map((q) => q.id));
      for (let diff = 1; diff <= 5; diff++) {
        for (const q of byDiff[diff] || []) {
          if (!usedIds.has(q.id) && selected.length < totalQuestions) {
            selected.push(q);
            usedIds.add(q.id);
          }
        }
      }
    }

    // Strictly sort by ascending difficulty (Level 1 -> 2 -> 3 -> 4 -> 5)
    selected.sort((a, b) => a.difficulty - b.difficulty);

    return shuffleQuestionOptions(selected);
  };

  // Start game flow
  const handleStartGame = (mode: GameMode, categoryId?: CategoryId) => {
    soundManager.playTap();
    soundManager.unlockAudio();
    setGameMode(mode);
    setCurrentIndex(0);
    setScore(0);
    setLivesRemaining(mode === 'streak' ? 1 : 3);
    setRoundXpEarned(0);
    setRoundStreak(0);
    setRoundBestStreak(0);
    setRoundStartBestStreak(stats.bestStreak);
    setIsRoundRecordBroken(false);
    setShowFactModal(false);
    setActiveNavTab('play');

    let questionsToUse: Question[] = [];

    if (mode === 'endless') {
      questionsToUse = shuffleQuestionOptions(
        [...CURATED_QUESTIONS].sort(() => Math.random() - 0.5)
      );
    } else {
      // Structured 10-question runs (Quick, Streak, Daily, Category) strictly ascending from L1 to L5
      questionsToUse = buildStructuredQuestions(categoryId, 10);
    }

    setActiveQuestions(questionsToUse);
    setGameStage('playing');
  };

  const handleAIQuestionsGenerated = (aiQuestions: Question[]) => {
    soundManager.playTap();
    soundManager.unlockAudio();
    setShowAIModal(false);
    setGameMode('ai_challenge');
    setCurrentIndex(0);
    setScore(0);
    setLivesRemaining(3);
    setRoundXpEarned(0);
    setRoundStreak(0);
    setRoundBestStreak(0);
    setRoundStartBestStreak(stats.bestStreak);
    setIsRoundRecordBroken(false);
    setShowFactModal(false);
    setActiveNavTab('play');

    // Check AI Innovator achievement
    const { newStats, newAchievements } = evaluateAchievements(stats, achievements, {
      aiPlayed: true,
    });
    setStats(newStats);
    setAchievements(newAchievements);
    savePlayerStats(newStats);

    const shuffled = shuffleQuestionOptions(aiQuestions);
    setActiveQuestions(shuffled);
    setGameStage('playing');
  };

  const unlockAchievement = (achId: string) => {
    const ach = achievements.find((a) => a.id === achId);
    if (!ach || ach.isUnlocked) return;

    const updatedAchievements = achievements.map((a) =>
      a.id === achId ? { ...a, isUnlocked: true } : a
    );
    setAchievements(updatedAchievements);

    const updatedUnlocked = Array.from(new Set([...(stats.unlockedAchievements || []), achId]));
    const newStats: PlayerStats = {
      ...stats,
      xp: stats.xp + ach.xpReward,
      unlockedAchievements: updatedUnlocked,
    };
    const lvl = getLevelInfo(newStats.xp);
    newStats.level = lvl.level;
    newStats.levelTitle = lvl.title;
    setStats(newStats);
    savePlayerStats(newStats);
  };

  const handleAnswer = (isCorrect: boolean) => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    let baseXP = 10;
    if (currentQ.difficulty === 2) baseXP = 15;
    if (currentQ.difficulty === 3) baseXP = 20;
    if (currentQ.difficulty === 4) baseXP = 30;
    if (currentQ.difficulty === 5) baseXP = 45;
    if (currentQ.isDeceptive) baseXP += 10;

    const isDeceptive = currentQ.difficulty === 5 || !!currentQ.isDeceptive;
    const newDeceptiveCorrect = (stats.deceptiveCorrect || 0) + (isCorrect && isDeceptive ? 1 : 0);

    // Track active round streak
    const nextRoundStreak = isCorrect ? roundStreak + 1 : 0;
    const nextRoundBestStreak = Math.max(roundBestStreak, nextRoundStreak);
    setRoundStreak(nextRoundStreak);
    setRoundBestStreak(nextRoundBestStreak);

    // Track player's continuous lifetime streak
    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const newBestStreak = Math.max(stats.bestStreak, newStreak);
    const earnedXp = isCorrect ? baseXP : 2;

    const currentCatStats = stats.categoryStats[currentQ.category] || {
      attempted: 0,
      correct: 0,
    };
    const updatedCategoryStats = {
      ...stats.categoryStats,
      [currentQ.category]: {
        attempted: currentCatStats.attempted + 1,
        correct: currentCatStats.correct + (isCorrect ? 1 : 0),
      },
    };

    const intermediateStats: PlayerStats = {
      ...stats,
      xp: stats.xp + earnedXp,
      totalAnswered: stats.totalAnswered + 1,
      totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      deceptiveCorrect: newDeceptiveCorrect,
      categoryStats: updatedCategoryStats,
    };

    // Auto-evaluate and award all achievements atomically
    const { newStats, newAchievements, newlyUnlockedCount } = evaluateAchievements(
      intermediateStats,
      achievements,
      { currentQ, isCorrect, gameMode }
    );

    const oldLevel = getLevelInfo(stats.xp).level;
    const newLevel = getLevelInfo(newStats.xp).level;
    if (newLevel > oldLevel) {
      setTimeout(() => {
        soundManager.playLevelUp();
      }, 500);
    }

    if (newlyUnlockedCount > 0) {
      setTimeout(() => {
        soundManager.playCorrect();
      }, 300);
    }

    setStats(newStats);
    setAchievements(newAchievements);
    savePlayerStats(newStats);
    setRoundXpEarned((prev) => prev + earnedXp);

    if (isCorrect) {
      setScore((prev) => prev + 1);

      if (newStreak > roundStartBestStreak && newStreak >= 2) {
        setIsRoundRecordBroken(true);
      }
    } else {
      if (gameMode === 'endless' || gameMode === 'streak') {
        const remaining = livesRemaining - 1;
        setLivesRemaining(remaining);
        if (remaining <= 0) {
          setTimeout(() => {
            setGameStage('summary');
          }, 1200);
        }
      }
    }
  };

  const handleNextQuestion = () => {
    setShowFactModal(false);
    if (livesRemaining <= 0 && (gameMode === 'endless' || gameMode === 'streak')) {
      setGameStage('summary');
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < activeQuestions.length) {
      setCurrentIndex(nextIndex);
    } else {
      if (gameMode === 'endless') {
        const moreQuestions = shuffleQuestionOptions(
          [...CURATED_QUESTIONS].sort(() => Math.random() - 0.5)
        );
        setActiveQuestions((prev) => [...prev, ...moreQuestions]);
        setCurrentIndex(nextIndex);
      } else {
        if (gameMode === 'daily') {
          const todayStr = getTodayDateString();
          const completed = Array.from(
            new Set([...(stats.dailyChallengeCompletedDates || []), todayStr])
          );
          const updatedStats: PlayerStats = {
            ...stats,
            dailyChallengeCompletedDates: completed,
            lastDailyDate: todayStr,
            dailyBestScore: Math.max(stats.dailyBestScore || 0, score),
          };
          const { newStats, newAchievements } = evaluateAchievements(
            updatedStats,
            achievements,
            { finalScore: score, totalQ: activeQuestions.length, gameMode }
          );
          setStats(newStats);
          setAchievements(newAchievements);
          savePlayerStats(newStats);
        } else {
          // Check round completion achievements (e.g. perfect 10, streak run conqueror)
          const { newStats, newAchievements } = evaluateAchievements(
            stats,
            achievements,
            { finalScore: score, totalQ: activeQuestions.length, gameMode }
          );
          if (newStats !== stats) {
            setStats(newStats);
            setAchievements(newAchievements);
            savePlayerStats(newStats);
          }
        }
        setGameStage('summary');
      }
    }
  };

  const handleToggleSaveDiscovery = (item: DiscoveryItem) => {
    const updated = saveDiscoveryItem(item);
    setDiscoveries(updated);
    const { newStats, newAchievements } = evaluateAchievements(stats, achievements, {
      savedCount: updated.length,
    });
    setStats(newStats);
    setAchievements(newAchievements);
    savePlayerStats(newStats);
  };

  const handleSelectBottomNavTab = (tab: NavTabId) => {
    setActiveNavTab(tab);
    // Close other modals first
    setShowDiscoveriesModal(false);
    setShowStatsModal(false);
    setShowAchievementsModal(false);
    setShowLeaderboardModal(false);
    setShowSettingsModal(false);

    if (tab === 'play') {
      // Return to active game or home
      if (gameStage === 'summary') {
        setGameStage('home');
      }
    } else if (tab === 'leaderboard') {
      setShowLeaderboardModal(true);
    } else if (tab === 'achievements') {
      setShowAchievementsModal(true);
    } else if (tab === 'discoveries') {
      setShowDiscoveriesModal(true);
    } else if (tab === 'stats') {
      setShowStatsModal(true);
    }
  };

  const isCurrentQSaved = Boolean(
    activeQuestions[currentIndex] &&
      discoveries.some((d) => d.questionId === activeQuestions[currentIndex].id)
  );

  return (
    <div
      onClick={() => soundManager.unlockAudio()}
      className="min-h-full bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between antialiased pb-20 sm:pb-24"
    >
      {/* Sleek App-Bar Header */}
      <Header
        stats={stats}
        language={settings.language}
        bgmMode={settings.bgmMode || 'off'}
        onCycleBgm={handleCycleBgm}
        onOpenLevelInfo={() => setShowLevelModal(true)}
        onOpenStreakInfo={() => setShowStreakModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onGoHome={() => {
          setGameStage('home');
          setActiveNavTab('play');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto">
        {gameStage === 'home' && (
          <HomeScreen
            stats={stats}
            language={settings.language}
            ageTier={settings.ageTier}
            hasCustomApiKey={Boolean(settings.customGeminiApiKey && settings.customGeminiApiKey.trim().length > 0)}
            onChangeAgeTier={handleChangeAgeTier}
            onStartGame={handleStartGame}
            onOpenAIChallenge={() => setShowAIModal(true)}
            onOpenLeaderboard={() => {
              setActiveNavTab('leaderboard');
              setShowLeaderboardModal(true);
            }}
          />
        )}

        {gameStage === 'playing' && activeQuestions[currentIndex] && (
          <QuestionCard
            key={`${activeQuestions[currentIndex].id}_${currentIndex}`}
            question={activeQuestions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            gameMode={gameMode}
            livesRemaining={livesRemaining}
            currentStreak={stats.currentStreak}
            language={settings.language}
            ageTier={settings.ageTier}
            onAnswer={handleAnswer}
            onNextQuestion={handleNextQuestion}
            onOpenFactModal={() => setShowFactModal(true)}
          />
        )}

        {gameStage === 'summary' && (
          <RoundSummary
            score={score}
            totalQuestions={activeQuestions.length}
            xpEarned={roundXpEarned}
            gameMode={gameMode}
            stats={stats}
            language={settings.language}
            roundStreak={roundBestStreak}
            isRecordBroken={isRoundRecordBroken || stats.bestStreak > roundStartBestStreak}
            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            onPlayAgain={() => handleStartGame(gameMode)}
            onGoHome={() => {
              setGameStage('home');
              setActiveNavTab('play');
            }}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (App-Bar & Bottom Navigation Pattern) */}
      <BottomNav
        activeTab={activeNavTab}
        language={settings.language}
        stats={stats}
        discoveriesCount={discoveries.length}
        onSelectTab={handleSelectBottomNavTab}
      />

      {/* Fact Card Modal */}
      {showFactModal && activeQuestions[currentIndex] && (
        <FactCardModal
          question={activeQuestions[currentIndex]}
          language={settings.language}
          isSaved={isCurrentQSaved}
          customApiKey={settings.customGeminiApiKey}
          onToggleSave={handleToggleSaveDiscovery}
          onNext={handleNextQuestion}
          onClose={() => setShowFactModal(false)}
        />
      )}

      {/* Settings Modal (Language, Font Size, 3-Way BGM, SFX, Age Tier, Custom API Key & Local Encryption) */}
      {showSettingsModal && (
        <SettingsModal
          language={settings.language}
          soundEnabled={settings.soundEnabled}
          bgmMode={settings.bgmMode || 'off'}
          fontSize={settings.fontSize || 'normal'}
          ageTier={settings.ageTier}
          stats={stats}
          customApiKey={settings.customGeminiApiKey}
          onToggleSound={handleToggleSound}
          onChangeBgmMode={handleChangeBgmMode}
          onChangeFontSize={handleChangeFontSize}
          onChangeAgeTier={handleChangeAgeTier}
          onChangeCustomApiKey={handleChangeCustomApiKey}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Discoveries Modal */}
      {showDiscoveriesModal && (
        <DiscoveriesModal
          discoveries={discoveries}
          language={settings.language}
          onRemoveDiscovery={(id) => {
            const updated = discoveries.filter((d) => d.id !== id);
            setDiscoveries(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('wyc_discoveries_v1', JSON.stringify(updated));
            }
          }}
          onClose={() => {
            setShowDiscoveriesModal(false);
            setActiveNavTab('play');
          }}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          language={settings.language}
          onClose={() => {
            setShowStatsModal(false);
            setActiveNavTab('play');
          }}
        />
      )}

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          language={settings.language}
          onClose={() => {
            setShowAchievementsModal(false);
            setActiveNavTab('play');
          }}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal
          stats={stats}
          language={settings.language}
          onPlayNow={() => {
            setShowLeaderboardModal(false);
            handleStartGame('endless');
          }}
          onClose={() => {
            setShowLeaderboardModal(false);
            setActiveNavTab('play');
          }}
        />
      )}

      {/* Level Info Modal */}
      {showLevelModal && (
        <LevelInfoModal
          stats={stats}
          language={settings.language}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {/* Streak Info Modal */}
      {showStreakModal && (
        <StreakInfoModal
          stats={stats}
          language={settings.language}
          onClose={() => setShowStreakModal(false)}
        />
      )}

      {/* AI Challenge Modal */}
      {showAIModal && (
        <AIChallengeModal
          language={settings.language}
          ageTier={settings.ageTier}
          customApiKey={settings.customGeminiApiKey}
          onOpenSettings={() => {
            setShowAIModal(false);
            setShowSettingsModal(true);
          }}
          onQuestionsGenerated={handleAIQuestionsGenerated}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
}
