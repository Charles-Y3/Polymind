import React, { useEffect, useRef, useState } from 'react';
import { Challenge, ChallengeResult, GameMode, Language } from '../types';
import { soundManager } from '../utils/audio';
import { skillLabels, translations } from '../utils/i18n';
import { FocusStage } from './stages/FocusStage';
import { NoticeStage } from './stages/NoticeStage';
import { PerceiveStage } from './stages/PerceiveStage';
import { RememberStage } from './stages/RememberStage';
import { ShiftStage } from './stages/ShiftStage';
import { ResultModal } from './ResultModal';

interface ChallengeViewProps {
  challenges: Challenge[];
  modeTitle: string;
  onFinishSession: (results: ChallengeResult[]) => void;
  onQuit: () => void;
  language: Language;
  highContrast: boolean;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  challenges,
  modeTitle,
  onFinishSession,
  onQuit,
  language,
  highContrast,
}) => {
  const t = translations[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<ChallengeResult[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Current challenge state
  const currentChallenge = challenges[currentIndex];
  const [timeLeft, setTimeLeft] = useState(currentChallenge?.timeLimit || 10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ChallengeResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset for new challenge
  useEffect(() => {
    if (!currentChallenge) return;

    setTimeLeft(currentChallenge.timeLimit);
    setIsAnswered(false);
    setSelectedId(null);
    setLastResult(null);
    setShowResultModal(false);
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 3.5 && prev > 0.5) {
          soundManager.playTick();
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentChallenge]);

  const handleTimeExpired = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    soundManager.playWrong();
    processAnswerResult(false, currentChallenge.timeLimit, null);
  };

  const processAnswerResult = (isCorrect: boolean, timeSpent: number, choiceId: string | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedId(choiceId);
    setIsAnswered(true);

    let nextStreak = 0;
    let multiplier = 1;
    let earnedScore = 0;

    if (isCorrect) {
      nextStreak = currentStreak + 1;
      // Streak multiplier: 1x, 1.2x, 1.4x, up to 2.5x
      multiplier = Math.min(2.5, 1 + (nextStreak - 1) * 0.2);
      
      // Scoring formula: Base 100 * diffMultiplier + SpeedBonus * streakMultiplier
      const basePoints = 100;
      const diffMultiplier = 1 + (currentChallenge.difficulty - 1) * 0.15;
      const remainingRatio = Math.max(0, (currentChallenge.timeLimit - timeSpent) / currentChallenge.timeLimit);
      const speedBonus = Math.round(remainingRatio * 60);

      earnedScore = Math.round((basePoints * diffMultiplier + speedBonus) * multiplier);
      soundManager.playCorrect(nextStreak);
    } else {
      soundManager.playWrong();
      nextStreak = 0;
      multiplier = 1;
      earnedScore = 0;
    }

    setCurrentStreak(nextStreak);
    setTotalScore((prev) => prev + earnedScore);

    const result: ChallengeResult = {
      challengeId: currentChallenge.id,
      mode: currentChallenge.mode,
      skill: currentChallenge.skill,
      difficulty: currentChallenge.difficulty,
      isCorrect,
      timeSpent: Math.min(currentChallenge.timeLimit, Math.max(0.1, timeSpent)),
      score: earnedScore,
      streak: nextStreak,
      multiplier,
    };

    setLastResult(result);
    setSessionResults((prev) => [...prev, result]);

    // Delay showing the result card slightly so the player sees the visual confirmation ring
    setTimeout(() => {
      setShowResultModal(true);
    }, 650);
  };

  const handleUserSelect = (isCorrect: boolean, itemId: string) => {
    if (isAnswered) return;
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    processAnswerResult(isCorrect, timeSpent, itemId);
  };

  const handleNextChallenge = () => {
    setShowResultModal(false);
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session finished
      onFinishSession(sessionResults);
    }
  };

  if (!currentChallenge) return null;

  const timeProgress = (timeLeft / currentChallenge.timeLimit) * 100;
  const isUrgent = timeLeft < 3;
  const skill = skillLabels[currentChallenge.skill];

  return (
    <div
      id="challenge-view-container"
      className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Top Navigation & Status Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Mode & Stage Indicator */}
          <div className="flex items-center gap-2">
            <button
              id="quit-challenge-btn"
              onClick={onQuit}
              aria-label="Exit to menu"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-xs font-mono font-bold"
            >
              ✕ {t.backToMenu}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold text-slate-300">
              <span>{skill.icon}</span>
              <span className="text-cyan-400 uppercase tracking-wider">{modeTitle}</span>
              <span className="text-slate-600">|</span>
              <span>
                {currentIndex + 1}/{challenges.length}
              </span>
            </div>
          </div>

          {/* Score & Streak Pill */}
          <div className="flex items-center gap-2">
            {currentStreak >= 2 && (
              <div
                id="streak-multiplier-badge"
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1 animate-pulse"
              >
                <span>🔥</span>
                <span>STREAK ×{currentStreak}</span>
              </div>
            )}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono font-black text-sm text-cyan-300">
              {totalScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tension Time Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'
            }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </header>

      {/* Main Challenge Stage Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-4xl mx-auto">
        {/* Instruction Prompt Header */}
        <div className="text-center mb-3">
          <p className="text-sm sm:text-base font-semibold text-slate-200 drop-shadow-sm">
            {currentChallenge.prompt[language] || currentChallenge.prompt.en}
          </p>
        </div>

        {/* Dynamic Stage Renderers */}
        <div className="w-full flex items-center justify-center">
          {currentChallenge.mode === 'notice' && (
            <NoticeStage
              challenge={currentChallenge}
              disabled={isAnswered}
              selectedItemId={selectedId}
              highContrast={highContrast}
              onSelect={(item) => handleUserSelect(item.isOdd, item.id)}
            />
          )}

          {currentChallenge.mode === 'remember' && (
            <RememberStage
              challenge={currentChallenge}
              disabled={isAnswered}
              selectedOptionId={selectedId}
              language={language}
              onSelectOption={(opt) => handleUserSelect(opt.isCorrect, opt.id)}
            />
          )}

          {currentChallenge.mode === 'focus' && (
            <FocusStage
              challenge={currentChallenge}
              disabled={isAnswered}
              selectedItemId={selectedId}
              language={language}
              onSelectItem={(item) => handleUserSelect(item.isTarget, item.id)}
            />
          )}

          {currentChallenge.mode === 'shift' && (
            <ShiftStage
              challenge={currentChallenge}
              disabled={isAnswered}
              selectedItemId={selectedId}
              language={language}
              onSelectHotspot={(itemId, isTarget) => handleUserSelect(isTarget, itemId)}
            />
          )}

          {currentChallenge.mode === 'perceive' && (
            <PerceiveStage
              challenge={currentChallenge}
              disabled={isAnswered}
              selectedItemId={selectedId}
              language={language}
              onSelectAnomaly={(itemId, isAnomaly) => handleUserSelect(isAnomaly, itemId)}
            />
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl mx-auto p-4 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>
          {t.difficulty}: {currentChallenge.difficulty}/10
        </div>
        <div>
          {skill.name[language]} ({skill.icon})
        </div>
      </footer>

      {/* Round Result Modal */}
      {showResultModal && lastResult && (
        <ResultModal
          result={lastResult}
          challenge={currentChallenge}
          language={language}
          isLastChallenge={currentIndex + 1 >= challenges.length}
          onNext={handleNextChallenge}
        />
      )}
    </div>
  );
};
