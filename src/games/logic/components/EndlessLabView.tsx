import React, { useState } from 'react';
import { Puzzle, SolutionAttempt } from '../types';
import { generateProceduralPuzzle } from '../data/generator';
import { MachineVisual } from './MachineVisual';
import { ExampleDisplay } from './ExampleDisplay';
import { QuestionCard } from './QuestionCard';
import { ModeChoose } from './ModeChoose';
import { ModeEnter } from './ModeEnter';
import { ModeBuild } from './ModeBuild';
import { ModeDiscover } from './ModeDiscover';
import { FeedbackModal } from './FeedbackModal';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Infinity, Flame, Trophy } from 'lucide-react';

interface EndlessLabViewProps {
  onEarnScore: (score: number) => void;
  highScore: number;
}

export const EndlessLabView: React.FC<EndlessLabViewProps> = ({
  onEarnScore,
  highScore,
}) => {
  const { t, getLocalizedPuzzle } = useI18n();
  const [streak, setStreak] = useState(0);
  const [tier, setTier] = useState(1);
  const [rawPuzzle, setRawPuzzle] = useState<Puzzle>(() => generateProceduralPuzzle(1));
  const currentPuzzle = getLocalizedPuzzle(rawPuzzle);
  const [activeAttempt, setActiveAttempt] = useState<SolutionAttempt | null>(null);

  const handleNextMachine = () => {
    setActiveAttempt(null);
    const newTier = Math.min(8, Math.floor(streak / 2) + 1);
    setTier(newTier);
    setRawPuzzle(generateProceduralPuzzle(newTier));
  };

  const handleProcessAnswer = (answerVal: any) => {
    const expected = currentPuzzle.question.expectedOutput;
    const isCorrect = String(answerVal) === String(expected);

    const scoreEarned = isCorrect ? tier * 50 : 0;

    const attemptResult: SolutionAttempt = {
      puzzleId: currentPuzzle.id,
      userAnswer: answerVal,
      hintsUsed: 0,
      attemptsCount: 1,
      isCorrect,
      scoreEarned,
    };

    setActiveAttempt(attemptResult);

    if (isCorrect) {
      sound.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      onEarnScore(scoreEarned);
    } else {
      sound.playError();
      setStreak(0); // One mistake breaks streak!
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Endless Lab Header */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Infinity className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-emerald-200">
              {t('endless.title', { tier })}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              {t('endless.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono text-xs font-bold">
            <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>{t('endless.streak', { count: streak })}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs font-bold">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>{t('endless.highScore', { score: highScore })}</span>
          </div>
        </div>
      </div>

      {/* Machine Visual */}
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

      {/* Examples */}
      <ExampleDisplay examples={currentPuzzle.examples} />

      {/* Interaction Mode Switcher */}
      {currentPuzzle.mode === 'choose' && (
        <ModeChoose
          key={currentPuzzle.id}
          questionInput={currentPuzzle.question.input}
          choices={currentPuzzle.question.choices || []}
          onSubmitAnswer={handleProcessAnswer}
          disabled={!!activeAttempt}
        />
      )}

      {currentPuzzle.mode === 'enter' && (
        <ModeEnter
          key={currentPuzzle.id}
          questionInput={currentPuzzle.question.input}
          onSubmitAnswer={handleProcessAnswer}
          disabled={!!activeAttempt}
        />
      )}

      {currentPuzzle.mode === 'build' && (
        <ModeBuild
          key={currentPuzzle.id}
          availableTokens={currentPuzzle.availableRuleTokens || []}
          onSubmitRule={(tokens) => handleProcessAnswer(tokens.join(''))}
          disabled={!!activeAttempt}
        />
      )}

      {currentPuzzle.mode === 'discover' && (
        <ModeDiscover
          key={currentPuzzle.id}
          questionInput={currentPuzzle.question.input}
          expectedOutput={currentPuzzle.question.expectedOutput}
          onSubmitAnswer={handleProcessAnswer}
          disabled={!!activeAttempt}
        />
      )}

      {/* Feedback Modal */}
      {activeAttempt && (
        <FeedbackModal
          puzzle={currentPuzzle}
          attempt={activeAttempt}
          onNextPuzzle={handleNextMachine}
          onRetry={handleNextMachine}
        />
      )}
    </div>
  );
};
