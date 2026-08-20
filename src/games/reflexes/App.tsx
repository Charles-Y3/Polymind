import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GameMode, 
  LevelConfig, 
  PlayerStats, 
  ActivePowerUp, 
  LeaderboardEntry, 
  Achievement,
  PowerUpType,
  ActivePassiveBoosts
} from './types';
import { CAMPAIGN_LEVELS } from './data/levels';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import { getUnlockedStarterPowerUps } from './data/starterLoadouts';
import { 
  getPlayerStats, 
  savePlayerStats, 
  getLeaderboard, 
  addLeaderboardEntry, 
  clearLeaderboard 
} from './utils/storage';
import { submitGlobalScore, fetchGlobalLeaderboard, getRegisteredNameForCurrentIp } from './services/leaderboardService';
import { soundManager } from './utils/sound';
import { calculateStars } from './utils/stars';

import { MainMenu } from './components/MainMenu';
import { PhysicsCanvas } from './components/PhysicsCanvas';
import { TiltHUD } from './components/TiltHUD';
import { VirtualTiltControl } from './components/VirtualTiltControl';
import { GyroPermissionModal } from './components/GyroPermissionModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GarageModal } from './components/GarageModal';
import { AchievementsModal } from './components/AchievementsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'game_over'>('menu');
  const [activeMode, setActiveMode] = useState<GameMode>('campaign');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(CAMPAIGN_LEVELS[0]);

  // Player Stats & Unlocks
  const [stats, setStats] = useState<PlayerStats>(() => getPlayerStats());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());

  // Calculate live achievements & passive boosts from stats
  const achievements: Achievement[] = useMemo(() => {
    const starValues = Object.values(stats.starsEarned || {}) as number[];
    const totalStars = starValues.reduce((a, b) => a + b, 0);
    const stageEntries = Object.entries(stats.starsEarned || {}) as [string, number][];
    const stageIdsWithStars = stageEntries
      .filter(([_, stars]) => stars > 0)
      .map(([id]) => parseInt(id, 10));
    const maxStageCleared = stageIdsWithStars.length > 0 ? Math.max(...stageIdsWithStars) : 0;

    return INITIAL_ACHIEVEMENTS.map((ach) => {
      let progress = ach.progress;
      if (ach.id === 'first_balance') progress = Math.min(stats.totalTimeSurvived, ach.maxProgress);
      if (ach.id === 'obstacle_dodger') progress = Math.min(stats.totalObstaclesDodged, ach.maxProgress);
      if (ach.id === 'powerup_collector') progress = Math.min(stats.totalPowerUpsCollected, ach.maxProgress);
      if (ach.id === 'star_collector') progress = Math.min(totalStars, ach.maxProgress);
      if (ach.id === 'endless_runner') progress = Math.min(stats.highestScore, ach.maxProgress);
      if (ach.id === 'void_master') progress = Math.min(maxStageCleared, ach.maxProgress);

      const isUnlocked = progress >= ach.maxProgress;
      return { ...ach, progress, isUnlocked };
    });
  }, [stats]);

  const activePassiveBoosts: ActivePassiveBoosts = useMemo(() => {
    return {
      powerUpDurationMult: 1.0 + (achievements.find((a) => a.id === 'first_balance')?.isUnlocked ? 0.15 : 0),
      tiltControlMult: 1.0 + (achievements.find((a) => a.id === 'obstacle_dodger')?.isUnlocked ? 0.15 : 0),
      extraShieldHp: achievements.find((a) => a.id === 'powerup_collector')?.isUnlocked ? 1 : 0,
      comboRateMult: 1.0 + (achievements.find((a) => a.id === 'star_collector')?.isUnlocked ? 0.25 : 0),
      scoreBonusMult: 1.0 + (achievements.find((a) => a.id === 'endless_runner')?.isUnlocked ? 0.15 : 0),
      recoveryForceMult: 1.0 + (achievements.find((a) => a.id === 'void_master')?.isUnlocked ? 0.20 : 0),
    };
  }, [achievements]);

  const unlockedStarterPowerUps = useMemo(() => {
    return getUnlockedStarterPowerUps(stats.starsEarned);
  }, [stats.starsEarned]);

  // Live Gameplay State
  const [gameRunId, setGameRunId] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [runSummary, setRunSummary] = useState({
    score: 0,
    timeSurvived: 0,
    obstaclesDodged: 0,
    powerupsCollected: 0,
  });

  // Sensor / Tilt state
  const [tiltX, setTiltX] = useState(0); // -1 to +1
  const [tiltY, setTiltY] = useState(0); // -1 to +1
  const [hasSensorPermission, setHasSensorPermission] = useState(false);

  // Sensor Calibration Zero Offset
  const calibRef = useRef({ beta: 0, gamma: 0 });
  // Most recent raw device angles, tracked so "Calibrate" can zero against
  // the device's actual flat-on-table reading (sensors rarely report exact
  // 0/0 when flat, so a hardcoded zero left a phantom tilt baked in)
  const lastRawOrientationRef = useRef({ beta: 0, gamma: 0 });

  // True while the on-screen joystick is being dragged — sensor input must not fight it
  const isJoystickActiveRef = useRef(false);

  // Active Modals
  const [showGyroModal, setShowGyroModal] = useState(false);
  const [isFirstTimeCalibration, setIsFirstTimeCalibration] = useState(false);
  const pendingGameLaunch = useRef<{ mode: GameMode; level: LevelConfig } | null>(null);

  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Initialize Sound setting
  useEffect(() => {
    soundManager.setEnabled(stats.soundEnabled);
  }, [stats.soundEnabled]);

  // Device Orientation Sensor Listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      setHasSensorPermission(true);

      // Raw angles
      const beta = e.beta; // pitch (-90 to +90)
      const gamma = e.gamma; // roll (-90 to +90)
      lastRawOrientationRef.current = { beta, gamma };

      // Subtract calibration offset
      const relBeta = beta - calibRef.current.beta;
      const relGamma = gamma - calibRef.current.gamma;

      // Clamp & normalize to -1..+1
      const normX = Math.min(Math.max(relGamma / 30, -1), 1);
      const normY = Math.min(Math.max(relBeta / 30, -1), 1);

      if (
        (stats.controlMode === 'sensor' || stats.controlMode === 'hybrid') &&
        !isJoystickActiveRef.current
      ) {
        setTiltX(normX);
        setTiltY(normY);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [stats.controlMode]);

  // Request iOS Sensor Permission
  const requestSensorPermission = async (): Promise<boolean> => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      // @ts-expect-error - iOS 13+ DeviceOrientationEvent.requestPermission
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        // @ts-expect-error - iOS permission request
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setHasSensorPermission(true);
          return true;
        }
      } catch {
        return false;
      }
    } else if (window.DeviceOrientationEvent) {
      setHasSensorPermission(true);
      return true;
    }
    return false;
  };

  // Calibrate Zero Position
  const calibrateZero = () => {
    soundManager.playClick();
    // Zero against the device's current raw reading (its own sensor bias
    // when flat), not a hardcoded (0, 0) that assumed a perfect sensor
    calibRef.current = { ...lastRawOrientationRef.current };
    setTiltX(0);
    setTiltY(0);
  };

  // Desktop WASD / Arrow Keys Global Tilt Listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      keysDown.add(e.key.toLowerCase());
      updateTiltFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      keysDown.delete(e.key.toLowerCase());
      updateTiltFromKeys();
    };

    const updateTiltFromKeys = () => {
      let x = 0;
      let y = 0;
      if (keysDown.has('arrowleft') || keysDown.has('a')) x -= 0.8;
      if (keysDown.has('arrowright') || keysDown.has('d')) x += 0.8;
      if (keysDown.has('arrowup') || keysDown.has('w')) y -= 0.8;
      if (keysDown.has('arrowdown') || keysDown.has('s')) y += 0.8;

      setTiltX(x);
      setTiltY(y);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Start Game Core
  const startGame = (mode: GameMode, level: LevelConfig) => {
    soundManager.playClick();
    setActiveMode(mode);
    setActiveLevel(level);
    setCurrentScore(0);
    setCombo(1);
    setTimeSurvived(0);
    setActivePowerUps([]);
    setTiltX(0);
    setTiltY(0);
    setGameRunId((prev) => prev + 1);
    setGameState('playing');
  };

  // Start Game Request (Intercepts first-time play to show calibration test)
  const handleStartGameRequest = (mode: GameMode, level: LevelConfig) => {
    if (!stats.hasCalibrated) {
      pendingGameLaunch.current = { mode, level };
      setIsFirstTimeCalibration(true);
      setShowGyroModal(true);
    } else {
      startGame(mode, level);
    }
  };

  // Handle Game Over
  const handleGameOver = useCallback(
    (score: number, timeSurvived: number, obstaclesDodged: number, powerupsCollected: number) => {
      soundManager.stopRollSound();
      setRunSummary({ score, timeSurvived, obstaclesDodged, powerupsCollected });
      setGameState('game_over');

      setStats((prevStats) => {
        const starsEarned = calculateStars(score, timeSurvived, activeLevel, activeMode);

        const currentBest = Number(
          prevStats.starsEarned?.[activeLevel.id] || (prevStats.starsEarned as any)?.[String(activeLevel.id)] || 0
        );
        const finalStars = Math.max(currentBest, starsEarned);

        const updatedStats: PlayerStats = {
          ...prevStats,
          gamesPlayed: prevStats.gamesPlayed + 1,
          totalTimeSurvived: prevStats.totalTimeSurvived + timeSurvived,
          highestScore: Math.max(prevStats.highestScore, score),
          totalObstaclesDodged: prevStats.totalObstaclesDodged + obstaclesDodged,
          totalPowerUpsCollected: prevStats.totalPowerUpsCollected + powerupsCollected,
          starsEarned:
            activeMode === 'campaign'
              ? {
                  ...prevStats.starsEarned,
                  [activeLevel.id]: finalStars,
                }
              : prevStats.starsEarned,
        };

        savePlayerStats(updatedStats);
        return updatedStats;
      });
    },
    [activeMode, activeLevel]
  );

  // Initial load of global leaderboard & IP registration from Firebase
  useEffect(() => {
    fetchGlobalLeaderboard('all').then((data) => {
      if (data && data.length > 0) {
        setLeaderboard(data);
      }
    });

    getRegisteredNameForCurrentIp().then((regName) => {
      if (regName) {
        setStats((prev) => {
          if (!prev.playerName || prev.playerName === 'Player' || prev.playerName === 'Anonymous') {
            const updated = { ...prev, playerName: regName };
            savePlayerStats(updated);
            return updated;
          }
          return prev;
        });
      }
    });
  }, []);

  // Submit Score to Global Firebase Leaderboard
  const handleSubmitScore = async (playerName: string) => {
    const res = await submitGlobalScore({
      playerName,
      score: runSummary.score,
      mode: activeMode,
      levelId: activeLevel.id,
      timeSurvived: runSummary.timeSurvived,
      skinId: stats.currentSkinId,
    });

    const updatedStats = { ...stats, playerName };
    setStats(updatedStats);
    savePlayerStats(updatedStats);

    // Refresh live leaderboard
    const updatedBoard = await fetchGlobalLeaderboard('all');
    setLeaderboard(updatedBoard);

    return res;
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const next = !stats.soundEnabled;
    const updated = { ...stats, soundEnabled: next };
    setStats(updated);
    savePlayerStats(updated);
    soundManager.setEnabled(next);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 select-none font-sans overflow-hidden flex flex-col">
      {/* Real Game Viewports */}
        {gameState === 'menu' && (
          <MainMenu
            stats={stats}
            selectedStarterPowerUp={stats.selectedStarterPowerUp || 'none'}
            onSelectStarterPowerUp={(pwr) => {
              soundManager.playClick();
              const updatedStats = { ...stats, selectedStarterPowerUp: pwr };
              setStats(updatedStats);
              savePlayerStats(updatedStats);
            }}
            onStartGame={handleStartGameRequest}
            onOpenLeaderboard={() => {
              soundManager.playClick();
              setShowLeaderboardModal(true);
            }}
            onOpenGarage={() => {
              soundManager.playClick();
              setShowGarageModal(true);
            }}
            onOpenAchievements={() => {
              soundManager.playClick();
              setShowAchievementsModal(true);
            }}
            onOpenGyroSettings={() => {
              soundManager.playClick();
              setIsFirstTimeCalibration(false);
              setShowGyroModal(true);
            }}
            onToggleSound={handleToggleSound}
          />
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="relative w-full h-full">
            <PhysicsCanvas
              key={gameRunId}
              level={activeLevel}
              gameMode={activeMode}
              skinId={stats.currentSkinId}
              sensitivity={stats.sensitivity}
              invertX={stats.invertX}
              invertY={stats.invertY}
              tiltX={tiltX}
              tiltY={tiltY}
              isPaused={gameState === 'paused'}
              starterPowerUp={stats.selectedStarterPowerUp || 'none'}
              unlockedStarterPowerUps={unlockedStarterPowerUps}
              passiveBoosts={activePassiveBoosts}
              onGameOver={handleGameOver}
              onScoreUpdate={(s, c) => {
                setCurrentScore(s);
                setCombo(c);
              }}
              onTimeUpdate={setTimeSurvived}
              onActivePowerUpsChange={setActivePowerUps}
              onLivesChange={setLives}
            />

            <TiltHUD
              score={currentScore}
              combo={combo}
              lives={lives}
              hasWalls={activeLevel.hasWalls}
              tiltX={tiltX}
              tiltY={tiltY}
              activePowerUps={activePowerUps}
              stageTitle={activeMode === 'campaign' ? activeLevel.title : 'Endless Run'}
              secondsToClear={
                activeMode === 'campaign' ? Math.max(0, Math.ceil(activeLevel.targetTime - timeSurvived)) : undefined
              }
              onPause={() => setGameState('paused')}
              onCalibrate={calibrateZero}
            />

            {/* Virtual Touch Joystick Fallback */}
            {(stats.controlMode === 'touch' || stats.controlMode === 'hybrid') && (
              <VirtualTiltControl
                onTiltChange={(x, y) => {
                  setTiltX(x);
                  setTiltY(y);
                }}
                onDragStart={() => {
                  isJoystickActiveRef.current = true;
                }}
                onDragEnd={() => {
                  isJoystickActiveRef.current = false;
                }}
                activeControlMode={stats.controlMode}
                hasSensorPermission={hasSensorPermission}
              />
            )}
          </div>
        )}

        {/* Modals & Overlays */}
        {gameState === 'paused' && (
          <PauseModal
            soundEnabled={stats.soundEnabled}
            onToggleSound={handleToggleSound}
            onResume={() => setGameState('playing')}
            onRestart={() => startGame(activeMode, activeLevel)}
            onOpenGyroSettings={() => setShowGyroModal(true)}
            onHome={() => {
              soundManager.stopRollSound();
              setGameState('menu');
            }}
          />
        )}

        {gameState === 'game_over' && (
          <GameOverModal
            score={runSummary.score}
            timeSurvived={runSummary.timeSurvived}
            obstaclesDodged={runSummary.obstaclesDodged}
            powerupsCollected={runSummary.powerupsCollected}
            level={activeLevel}
            gameMode={activeMode}
            defaultPlayerName={stats.playerName}
            onSubmitScore={handleSubmitScore}
            onRestart={() => startGame(activeMode, activeLevel)}
            onNextLevel={
              activeLevel.id < CAMPAIGN_LEVELS.length
                ? () => startGame('campaign', CAMPAIGN_LEVELS[activeLevel.id])
                : undefined
            }
            onHome={() => setGameState('menu')}
          />
        )}

        {showGyroModal && (
          <GyroPermissionModal
            sensitivity={stats.sensitivity}
            invertX={stats.invertX}
            invertY={stats.invertY}
            controlMode={stats.controlMode}
            hasSensorPermission={hasSensorPermission}
            tiltX={tiltX}
            tiltY={tiltY}
            isFirstTime={isFirstTimeCalibration}
            onUpdateSettings={(newSettings) => {
              const updated = { ...stats, ...newSettings };
              setStats(updated);
              savePlayerStats(updated);
            }}
            onRequestSensorPermission={requestSensorPermission}
            onCalibrateZero={calibrateZero}
            onClose={() => {
              setShowGyroModal(false);
              setIsFirstTimeCalibration(false);
              pendingGameLaunch.current = null;
            }}
            onContinueGame={() => {
              setShowGyroModal(false);
              setIsFirstTimeCalibration(false);
              if (pendingGameLaunch.current) {
                const target = pendingGameLaunch.current;
                pendingGameLaunch.current = null;
                startGame(target.mode, target.level);
              }
            }}
          />
        )}

        {showLeaderboardModal && (
          <LeaderboardModal
            entries={leaderboard}
            currentPlayerName={stats.playerName}
            onClear={() => {
              clearLeaderboard();
              setLeaderboard(getLeaderboard());
            }}
            onClose={() => setShowLeaderboardModal(false)}
          />
        )}

        {showGarageModal && (
          <GarageModal
            currentSkinId={stats.currentSkinId}
            unlockedSkins={stats.unlockedSkins}
            onSelectSkin={(skinId) => {
              const updated = { ...stats, currentSkinId: skinId };
              setStats(updated);
              savePlayerStats(updated);
            }}
            onClose={() => setShowGarageModal(false)}
          />
        )}

        {showAchievementsModal && (
          <AchievementsModal
            achievements={achievements}
            onClose={() => setShowAchievementsModal(false)}
          />
        )}
    </div>
  );
}
