import { useEffect, useRef, useState } from 'react';
import { HEISTS } from './data/heists';
import { createPrng } from './engine/rng';
import { performanceScore } from './engine/scoring';
import { LanguageProvider, useI18n } from './i18n/context';
import { evaluateAchievements } from './data/achievements';
import { sound } from './utils/audio';
import { loadPlayerProgress, recordBest, savePlayerProgress, updateAxisScores } from './utils/storage';
import { submitLogicScore } from './services/leaderboardService';
import { Grade, GRADES, HeistDefinition, LOCK_TYPES, LockResult, LockType, PlayerProgress, PlayModeId, SKILL_BY_TYPE } from './types';

import { AchievementsModal } from './components/AchievementsModal';
import { HeistSelect } from './components/HeistSelect';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LockSession } from './components/LockSession';
import { MainMenu } from './components/MainMenu';
import { MindProfileModal } from './components/MindProfileModal';
import { Navbar } from './components/Navbar';
import { PersonalBestsModal } from './components/PersonalBestsModal';
import { PracticeModal } from './components/PracticeModal';
import { ResultModal } from './components/ResultModal';
import { SessionSummary } from './components/SessionSummary';
import { SettingsModal } from './components/SettingsModal';

function shiftGrade(grade: Grade, offset: number): Grade {
  const idx = Math.max(0, Math.min(GRADES.length - 1, GRADES.indexOf(grade) + offset));
  return GRADES[idx];
}

interface RunLock {
  type: LockType;
  grade: Grade;
  seed?: string;
  modeMult?: number;
}

function AppInner() {
  const { t } = useI18n();
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [view, setView] = useState<'menu' | 'heist-select' | 'playing' | 'summary'>('menu');
  const [playMode, setPlayMode] = useState<PlayModeId>('practice');

  const [queue, setQueue] = useState<RunLock[]>([]);
  const [lockIndex, setLockIndex] = useState(0);
  const [alarm, setAlarm] = useState(0);
  const alarmRef = useRef(0);
  const [heistBusted, setHeistBusted] = useState(false);
  const [runStreak, setRunStreak] = useState(0);
  const [results, setResults] = useState<LockResult[]>([]);
  const [pendingResult, setPendingResult] = useState<LockResult | null>(null);
  const [currentHeist, setCurrentHeist] = useState<HeistDefinition | null>(null);

  const [gauntletDepth, setGauntletDepth] = useState(0);
  const [gauntletBanked, setGauntletBanked] = useState(0);
  const [awaitingBankPush, setAwaitingBankPush] = useState(false);

  const [runOutcome, setRunOutcome] = useState<{ stars?: number; busted?: boolean }>({});

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAchievementsOpen, setAchievementsOpen] = useState(false);
  const [isPracticeOpen, setPracticeOpen] = useState(false);
  const [isMindProfileOpen, setMindProfileOpen] = useState(false);
  const [isBestsOpen, setBestsOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);

  useEffect(() => {
    sound.setEnabled(progress.settings.sound);
  }, [progress.settings.sound]);

  const persist = (next: PlayerProgress) => {
    const { progress: withAchievements } = evaluateAchievements(next);
    setProgress(withAchievements);
    savePlayerProgress(withAchievements);
  };

  const changeGrade = (grade: Grade) => persist({ ...progress, grade });
  const renamePlayer = (playerName: string) => persist({ ...progress, playerName });
  const updateSettings = (settings: PlayerProgress['settings']) => persist({ ...progress, settings });
  const resetProgressHandler = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('settings.resetProgress') + '?')) return;
    persist(loadPlayerProgress());
  };

  const carriesAlarm = playMode === 'heist' || playMode === 'gauntlet';

  const currentLock = queue[lockIndex];

  // ---- run starters ----
  const startHeist = (heist: HeistDefinition) => {
    const grade = shiftGrade(progress.grade, heist.gradeOffset);
    setCurrentHeist(heist);
    setQueue(heist.recipe.map((type) => ({ type, grade })));
    setLockIndex(0);
    setAlarm(0);
    alarmRef.current = 0;
    setHeistBusted(false);
    setRunStreak(0);
    setResults([]);
    setRunOutcome({});
    setPlayMode('heist');
    setView('playing');
  };

  const startDaily = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (progress.lastDailyDate === todayStr) return;
    const rng = createPrng(`daily-${todayStr}`);
    const shuffled = [...LOCK_TYPES].sort(() => rng() - 0.5);
    const picks = shuffled.slice(0, 3);
    setQueue(picks.map((type, i) => ({ type, grade: progress.grade, seed: `daily-${todayStr}-${i}` })));
    setLockIndex(0);
    setAlarm(0);
    setRunStreak(0);
    setResults([]);
    setRunOutcome({});
    setPlayMode('daily');
    setView('playing');
  };

  const startGauntlet = () => {
    const grade = shiftGrade(progress.grade, -1);
    const type = LOCK_TYPES[Math.floor(Math.random() * LOCK_TYPES.length)];
    setQueue([{ type, grade, modeMult: 1 }]);
    setLockIndex(0);
    setAlarm(0);
    alarmRef.current = 0;
    setRunStreak(0);
    setResults([]);
    setGauntletDepth(0);
    setGauntletBanked(0);
    setAwaitingBankPush(false);
    setRunOutcome({});
    setPlayMode('gauntlet');
    setView('playing');
  };

  const startPractice = (type: LockType, grade: Grade) => {
    setPracticeOpen(false);
    setQueue([{ type, grade, modeMult: 0.25 }]);
    setLockIndex(0);
    setAlarm(0);
    setRunStreak(0);
    setResults([]);
    setRunOutcome({});
    setPlayMode('practice');
    setView('playing');
  };

  // ---- progress bookkeeping shared by every mode ----
  const applyResultToProgress = (result: LockResult) => {
    let next = { ...progress };
    const perf = performanceScore(result.cracked, result.grade, result.hintsUsed);
    next = updateAxisScores(next, SKILL_BY_TYPE[result.type], perf);
    // Gauntlet loot is held in gauntletBanked until the player walks away.
    if (playMode !== 'gauntlet') {
      next.totalScore += result.score;
    }
    if (result.cracked) {
      next = recordBest(next, result.type, result.timeMs);
    }
    persist(next);
  };

  const handleResult = (result: LockResult) => {
    setResults((r) => [...r, result]);
    setRunStreak(result.cleanCrack ? runStreak + 1 : 0);
    applyResultToProgress(result);

    if (playMode === 'heist') {
      setHeistBusted(alarmRef.current >= 100);
    }

    if (playMode === 'gauntlet') {
      if (!result.cracked) {
        // bust: unbanked loot is lost
        setRunOutcome({ busted: true });
        setPendingResult(result);
        return;
      }
      setGauntletBanked((b) => b + result.score);
      setPendingResult(result);
      setAwaitingBankPush(true);
      return;
    }

    setPendingResult(result);
  };

  const finishHeist = (finalResults: LockResult[], busted: boolean) => {
    if (!currentHeist) return;
    const headroom = 100 - alarm;
    const stars = busted ? 0 : headroom >= 70 ? 3 : headroom >= 40 ? 2 : 1;
    const score = finalResults.reduce((s, r) => s + r.score, 0);
    const prev = progress.heists[currentHeist.id] ?? { stars: 0, bestScore: 0 };
    const next = {
      ...progress,
      heists: { ...progress.heists, [currentHeist.id]: { stars: Math.max(prev.stars, stars), bestScore: Math.max(prev.bestScore, score) } },
    };
    persist(next);
    submitLogicScore(next);
    setRunOutcome({ stars, busted });
    setView('summary');
  };

  const finishDaily = (finalResults: LockResult[]) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const allCracked = finalResults.every((r) => r.cracked);
    const nextStreak = allCracked ? (progress.lastDailyDate === yesterday ? progress.dailyStreak + 1 : 1) : 0;
    const next = {
      ...progress,
      dailyStreak: nextStreak,
      lastDailyDate: todayStr,
      lastDailyResult: {
        date: todayStr,
        cracked: finalResults.filter((r) => r.cracked).length,
        total: finalResults.length,
        score: finalResults.reduce((s, r) => s + r.score, 0),
      },
    };
    persist(next);
    submitLogicScore(next);
    setView('summary');
  };

  const advanceAfterResult = () => {
    const result = pendingResult;
    setPendingResult(null);
    if (!result) return;

    if (playMode === 'heist') {
      if (heistBusted) {
        finishHeist(results, true);
        return;
      }
      if (lockIndex + 1 >= queue.length) {
        finishHeist(results, false);
        return;
      }
      setLockIndex(lockIndex + 1);
      return;
    }

    if (playMode === 'daily') {
      if (lockIndex + 1 >= queue.length) {
        finishDaily(results);
        return;
      }
      setLockIndex(lockIndex + 1);
      return;
    }

    // practice: single lock, straight to summary
    submitLogicScore(progress);
    setView('summary');
  };

  const handleBank = () => {
    const next = { ...progress, totalScore: progress.totalScore + gauntletBanked, gauntletBest: Math.max(progress.gauntletBest, gauntletBanked) };
    persist(next);
    submitLogicScore(next);
    setPendingResult(null);
    setAwaitingBankPush(false);
    setRunOutcome({ busted: false });
    setView('summary');
  };

  const handlePush = () => {
    setPendingResult(null);
    setAwaitingBankPush(false);
    const newDepth = gauntletDepth + 1;
    setGauntletDepth(newDepth);
    const grade = shiftGrade(progress.grade, -1 + Math.floor(newDepth / 3));
    const type = LOCK_TYPES[Math.floor(Math.random() * LOCK_TYPES.length)];
    setQueue([...queue, { type, grade, modeMult: 1 + newDepth * 0.25 }]);
    setLockIndex(lockIndex + 1);
  };

  const handleGauntletBust = () => {
    setPendingResult(null);
    setRunOutcome({ busted: true });
    setView('summary');
  };

  const handleQuit = () => setView(view === 'playing' ? 'menu' : view);

  const handlePlayAgain = () => {
    if (playMode === 'heist' && currentHeist) startHeist(currentHeist);
    else if (playMode === 'daily') setView('menu');
    else if (playMode === 'gauntlet') startGauntlet();
    else setPracticeOpen(true);
  };

  const onHintUsed = () => persist({ ...progress, lockpicks: Math.max(0, progress.lockpicks - 1) });

  return (
    <div className="h-full bg-slate-950 text-slate-100 antialiased font-sans flex flex-col overflow-hidden">
      <Navbar progress={progress} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {view === 'menu' && (
          <MainMenu
            progress={progress}
            onChangeGrade={changeGrade}
            onStartHeists={() => setView('heist-select')}
            onStartDaily={startDaily}
            onStartGauntlet={startGauntlet}
            onOpenPractice={() => setPracticeOpen(true)}
            onOpenMindProfile={() => setMindProfileOpen(true)}
            onOpenBests={() => setBestsOpen(true)}
            onOpenAchievements={() => setAchievementsOpen(true)}
            onOpenLeaderboard={() => setLeaderboardOpen(true)}
          />
        )}

        {view === 'heist-select' && <HeistSelect progress={progress} onSelect={startHeist} onBack={() => setView('menu')} />}

        {view === 'playing' && currentLock && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden mx-auto w-full max-w-2xl">
            <LockSession
              key={`${lockIndex}-${currentLock.type}-${currentLock.grade}-${currentLock.seed ?? ''}`}
              type={currentLock.type}
              grade={currentLock.grade}
              seed={currentLock.seed}
              alarm={carriesAlarm ? alarm : 0}
              onAlarmChange={(next) => {
                if (!carriesAlarm) return;
                alarmRef.current = next;
                setAlarm(next);
              }}
              streak={runStreak}
              lockpicksAvailable={progress.lockpicks}
              onHintUsed={onHintUsed}
              modeMult={currentLock.modeMult}
              onResult={handleResult}
              onQuit={handleQuit}
            />
          </div>
        )}

        {view === 'summary' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-w-2xl mx-auto w-full">
            <SessionSummary
              results={results}
              playMode={playMode}
              stars={runOutcome.stars}
              bustedRun={runOutcome.busted}
              onPlayAgain={handlePlayAgain}
              onBackToMenu={() => setView('menu')}
            />
          </div>
        )}
      </div>

      {pendingResult && playMode === 'gauntlet' && (
        <ResultModal
          result={pendingResult}
          showBankOrPush={awaitingBankPush}
          gauntletBanked={gauntletBanked}
          nextLabel={t('result.next')}
          onNext={pendingResult.cracked ? handlePush : handleGauntletBust}
          onBank={handleBank}
          onPush={handlePush}
        />
      )}
      {pendingResult && playMode !== 'gauntlet' && (
        <ResultModal
          result={pendingResult}
          nextLabel={lockIndex + 1 >= queue.length ? t('result.finish') : t('result.next')}
          onNext={advanceAfterResult}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        progress={progress}
        onUpdateSettings={updateSettings}
        onResetProgress={resetProgressHandler}
      />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setAchievementsOpen(false)} progress={progress} />
      <MindProfileModal isOpen={isMindProfileOpen} onClose={() => setMindProfileOpen(false)} progress={progress} />
      <PersonalBestsModal isOpen={isBestsOpen} onClose={() => setBestsOpen(false)} progress={progress} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setLeaderboardOpen(false)} progress={progress} onRenamePlayer={renamePlayer} />
      <PracticeModal isOpen={isPracticeOpen} onClose={() => setPracticeOpen(false)} onStart={startPractice} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
