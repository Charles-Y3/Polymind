import React, { useState } from 'react';
import { WorldId, Puzzle, SolutionAttempt, PlayerProgress } from '../types';
import { WORLDS_DATA, getWorldInfo } from '../data/worlds';
import { getPuzzlesByWorld } from '../data/puzzles';
import { MachineVisual } from './MachineVisual';
import { ExampleDisplay } from './ExampleDisplay';
import { QuestionCard } from './QuestionCard';
import { ModeChoose } from './ModeChoose';
import { ModeEnter } from './ModeEnter';
import { ModeBuild } from './ModeBuild';
import { ModeDiscover } from './ModeDiscover';
import { ImpossibleMachineTester } from './ImpossibleMachineTester';
import { HintDialog } from './HintDialog';
import { FeedbackModal } from './FeedbackModal';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Lock, Compass, Lightbulb, ArrowLeft } from 'lucide-react';

interface JourneyViewProps {
  progress: PlayerProgress;
  onCompletePuzzle: (
    puzzleId: string,
    worldId: WorldId,
    scoreEarned: number,
    hintsUsed: number
  ) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  progress,
  onCompletePuzzle,
}) => {
  const { t, getLocalizedWorld, getLocalizedPuzzle } = useI18n();
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId | null>(null);
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [showHintDialog, setShowHintDialog] = useState<boolean>(false);
  const [activeAttempt, setActiveAttempt] = useState<SolutionAttempt | null>(null);

  // Get active world's raw puzzles and localize them
  const rawWorldPuzzles = selectedWorldId ? getPuzzlesByWorld(selectedWorldId) : [];
  const activeWorldPuzzles = rawWorldPuzzles.map((p) => getLocalizedPuzzle(p));
  const currentPuzzle: Puzzle | undefined = activeWorldPuzzles[activePuzzleIndex];

  const handleSelectWorld = (worldId: WorldId) => {
    if (!progress.unlockedWorlds.includes(worldId)) return;
    sound.playClick();
    setSelectedWorldId(worldId);
    setActivePuzzleIndex(0);
    setHintsUsedCount(0);
    setActiveAttempt(null);
  };

  const handleNextPuzzleInWorld = () => {
    setActiveAttempt(null);
    setHintsUsedCount(0);
    if (activePuzzleIndex < activeWorldPuzzles.length - 1) {
      setActivePuzzleIndex((idx) => idx + 1);
    } else {
      // Completed world! Return to world select map
      setSelectedWorldId(null);
    }
  };

  const handleProcessAnswerSubmit = (answerVal: any) => {
    if (!currentPuzzle) return;

    let isCorrect = false;

    if (currentPuzzle.worldId === 8 && currentPuzzle.ambiguityChallenge) {
      const { correctHypothesis, correctExperimentId } = currentPuzzle.ambiguityChallenge;
      if (typeof answerVal === 'object') {
        isCorrect = answerVal.hypothesisChoice === correctHypothesis && answerVal.testedExperimentId === correctExperimentId;
      }
    } else if (currentPuzzle.mode === 'build') {
      const expected = currentPuzzle.expectedRule.tokens || [];
      isCorrect = String(answerVal) === expected.join('') || String(answerVal) === currentPuzzle.expectedRule.description;
    } else {
      const expected = currentPuzzle.question.expectedOutput;
      isCorrect = String(answerVal) === String(expected);
    }

    const baseScore = 100;
    const hintDeduction = hintsUsedCount === 1 ? 10 : hintsUsedCount === 2 ? 30 : hintsUsedCount === 3 ? 60 : 0;
    const scoreEarned = isCorrect ? Math.max(20, baseScore - hintDeduction) : 0;

    const attemptResult: SolutionAttempt = {
      puzzleId: currentPuzzle.id,
      userAnswer: typeof answerVal === 'object' ? JSON.stringify(answerVal) : answerVal,
      hintsUsed: hintsUsedCount,
      attemptsCount: 1,
      isCorrect,
      scoreEarned,
    };

    setActiveAttempt(attemptResult);

    if (isCorrect) {
      sound.playSuccess();
      onCompletePuzzle(currentPuzzle.id, currentPuzzle.worldId, scoreEarned, hintsUsedCount);
    } else {
      sound.playError();
    }
  };

  // WORLD SELECTION MAP VIEW
  if (!selectedWorldId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        {/* Journey Context Bar — brand hero already lives at the App level */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold px-2.5 py-0.5 bg-cyan-950/80 rounded-full border border-cyan-500/30 shrink-0">
              {t('journey.badge')}
            </span>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('journey.description')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <Compass className="w-4 h-4 text-cyan-400" />
            <div className="text-xs font-mono text-slate-300">
              <span>{t('journey.unlocked')} </span>
              <strong className="text-cyan-300">{progress.unlockedWorlds.length} / 8</strong>
            </div>
          </div>
        </div>

        {/* WORLDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORLDS_DATA.map((rawW) => {
            const w = getLocalizedWorld(rawW);
            const isUnlocked = progress.unlockedWorlds.includes(w.id);
            const worldPuzzles = getPuzzlesByWorld(w.id);
            const completedInWorld = worldPuzzles.filter((p) => progress.completedPuzzleIds.includes(p.id)).length;

            return (
              <div
                key={w.id}
                onClick={() => handleSelectWorld(w.id)}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between min-h-[220px] transition-all relative overflow-hidden group ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/60 cursor-pointer shadow-xl hover:scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{w.icon}</span>
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 uppercase">
                      {w.primaryMode} {t('journey.modeSuffix')}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('journey.locked')}</span>
                    </div>
                  )}
                </div>

                {/* World Title */}
                <div className="my-2 space-y-1">
                  <h3 className="text-base font-bold font-mono text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {w.description}
                  </p>
                </div>

                {/* Bottom Completion Stats */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{t('journey.progress')}</span>
                  <strong className={completedInWorld > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                    {completedInWorld} / {worldPuzzles.length || 3} {t('journey.solved')}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE WORLD PUZZLE SOLVER VIEW
  const rawWorldInfo = getWorldInfo(selectedWorldId);
  const worldInfo = getLocalizedWorld(rawWorldInfo);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Active World Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <button
          onClick={() => { sound.playClick(); setSelectedWorldId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey.worldMap')}</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
            {worldInfo.title}
          </span>
          <h3 className="text-slate-100 font-bold font-mono text-sm">
            {t('journey.levelOf', { current: activePuzzleIndex + 1, total: activeWorldPuzzles.length })} {currentPuzzle?.title}
          </h3>
        </div>

        {/* Hint Trigger */}
        <button
          onClick={() => { sound.playClick(); setShowHintDialog(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all shadow-sm"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>{t('journey.hintBtn', { used: hintsUsedCount })}</span>
        </button>
      </div>

      {currentPuzzle && (
        <>
          {/* Main Machine Visual */}
          <MachineVisual
            currentInput={currentPuzzle.question.input}
            currentOutput={activeAttempt?.isCorrect ? currentPuzzle.question.expectedOutput : undefined}
            machineTitle={currentPuzzle.title}
            statusState={activeAttempt?.isCorrect ? 'success' : activeAttempt ? 'error' : 'idle'}
            ruleDescription={activeAttempt?.isCorrect ? currentPuzzle.expectedRule.description : undefined}
          />

          {/* Prominent Target Question Banner */}
          <QuestionCard
            questionInput={currentPuzzle.question.input}
            mode={currentPuzzle.mode}
            worldId={currentPuzzle.worldId}
            title={currentPuzzle.title}
            isSolved={activeAttempt?.isCorrect}
            revealedOutput={activeAttempt?.isCorrect ? currentPuzzle.question.expectedOutput : undefined}
          />

          {/* Observed Evidence Examples */}
          <ExampleDisplay examples={currentPuzzle.examples} />

          {/* INTERACTION MODE CONTROLLERS */}

          {/* World 8 Impossible Machine Ambiguity Workbench */}
          {currentPuzzle.worldId === 8 && currentPuzzle.ambiguityChallenge && (
            <ImpossibleMachineTester
              hypothesisA={currentPuzzle.ambiguityChallenge.hypothesisA}
              hypothesisB={currentPuzzle.ambiguityChallenge.hypothesisB}
              experiments={currentPuzzle.ambiguityChallenge.experiments}
              correctHypothesis={currentPuzzle.ambiguityChallenge.correctHypothesis}
              correctExperimentId={currentPuzzle.ambiguityChallenge.correctExperimentId}
              onSubmitDiscovery={(hypChoice, expId) =>
                handleProcessAnswerSubmit({ hypothesisChoice: hypChoice, testedExperimentId: expId })
              }
            />
          )}

          {/* Mode 1: Choose */}
          {currentPuzzle.mode === 'choose' && currentPuzzle.worldId !== 8 && (
            <ModeChoose
              key={currentPuzzle.id}
              questionInput={currentPuzzle.question.input}
              choices={currentPuzzle.question.choices || []}
              onSubmitAnswer={handleProcessAnswerSubmit}
              disabled={!!activeAttempt}
            />
          )}

          {/* Mode 2: Enter */}
          {currentPuzzle.mode === 'enter' && currentPuzzle.worldId !== 8 && (
            <ModeEnter
              key={currentPuzzle.id}
              questionInput={currentPuzzle.question.input}
              onSubmitAnswer={handleProcessAnswerSubmit}
              disabled={!!activeAttempt}
            />
          )}

          {/* Mode 3: Build */}
          {currentPuzzle.mode === 'build' && currentPuzzle.worldId !== 8 && (
            <ModeBuild
              key={currentPuzzle.id}
              availableTokens={currentPuzzle.availableRuleTokens || []}
              onSubmitRule={(tokens) => handleProcessAnswerSubmit(tokens.join(''))}
              disabled={!!activeAttempt}
            />
          )}

          {/* Mode 4: Discover */}
          {currentPuzzle.mode === 'discover' && currentPuzzle.worldId !== 8 && (
            <ModeDiscover
              key={currentPuzzle.id}
              questionInput={currentPuzzle.question.input}
              expectedOutput={currentPuzzle.question.expectedOutput}
              onSubmitAnswer={handleProcessAnswerSubmit}
              disabled={!!activeAttempt}
            />
          )}
        </>
      )}

      {/* Hint Dialog Modal */}
      {showHintDialog && currentPuzzle && (
        <HintDialog
          hints={currentPuzzle.hints}
          hintsUsedCount={hintsUsedCount}
          onUnlockNextHint={() => setHintsUsedCount((c) => Math.min(3, c + 1))}
          onClose={() => setShowHintDialog(false)}
        />
      )}

      {/* Post Answer Feedback Modal */}
      {activeAttempt && currentPuzzle && (
        <FeedbackModal
          puzzle={currentPuzzle}
          attempt={activeAttempt}
          onNextPuzzle={handleNextPuzzleInWorld}
          onRetry={() => setActiveAttempt(null)}
        />
      )}
    </div>
  );
};
