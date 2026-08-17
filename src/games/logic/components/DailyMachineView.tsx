import React, { useState } from 'react';
import { Puzzle, SolutionAttempt } from '../types';
import { generateDailyPuzzle } from '../data/generator';
import { MachineVisual } from './MachineVisual';
import { ExampleDisplay } from './ExampleDisplay';
import { QuestionCard } from './QuestionCard';
import { ModeBuild } from './ModeBuild';
import { FeedbackModal } from './FeedbackModal';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { Calendar, Flame, ShieldAlert } from 'lucide-react';

interface DailyMachineViewProps {
  onCompleteDaily: (scoreEarned: number) => void;
  dailyStreak: number;
}

export const DailyMachineView: React.FC<DailyMachineViewProps> = ({
  onCompleteDaily,
  dailyStreak,
}) => {
  const { t, getLocalizedPuzzle } = useI18n();
  const todayStr = new Date().toISOString().split('T')[0];
  const [rawDailyPuzzle] = useState<Puzzle>(() => generateDailyPuzzle(todayStr));
  const dailyPuzzle = getLocalizedPuzzle(rawDailyPuzzle);

  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [activeAttempt, setActiveAttempt] = useState<SolutionAttempt | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleBuildRuleSubmit = (tokens: string[]) => {
    if (isDone || attemptsLeft <= 0) return;

    // Check if tokens match expected tokens
    const expected = dailyPuzzle.expectedRule.tokens || [];
    const isCorrect = tokens.join('') === expected.join('');

    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);

    const scoreEarned = isCorrect ? Math.max(50, 100 - (3 - newAttempts) * 15) : 0;

    const attemptResult: SolutionAttempt = {
      puzzleId: dailyPuzzle.id,
      builtTokens: tokens,
      hintsUsed: 0,
      attemptsCount: 3 - newAttempts,
      isCorrect,
      scoreEarned,
    };

    setActiveAttempt(attemptResult);

    if (isCorrect) {
      sound.playSuccess();
      setIsDone(true);
      onCompleteDaily(scoreEarned);
    } else {
      sound.playError();
      if (newAttempts <= 0) {
        setIsDone(true);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Daily Header */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-amber-200">
              {t('daily.title', { date: todayStr })}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              {t('daily.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-amber-500/30 rounded-xl text-amber-400 font-mono text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{t('daily.streak', { count: dailyStreak })}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>{t('daily.attempts', { count: attemptsLeft })}</span>
          </div>
        </div>
      </div>

      {/* Main Machine Visual */}
      <MachineVisual
        currentInput={dailyPuzzle.question.input}
        currentOutput={activeAttempt?.isCorrect ? dailyPuzzle.question.expectedOutput : undefined}
        machineTitle={dailyPuzzle.title}
        statusState={activeAttempt?.isCorrect ? 'success' : isDone && !activeAttempt?.isCorrect ? 'error' : 'idle'}
        ruleDescription={isDone ? dailyPuzzle.expectedRule.description : undefined}
      />

      {/* Prominent Target Question Banner */}
      <QuestionCard
        questionInput={dailyPuzzle.question.input}
        mode={dailyPuzzle.mode}
        worldId={dailyPuzzle.worldId}
        title={dailyPuzzle.title}
        isSolved={activeAttempt?.isCorrect}
        revealedOutput={activeAttempt?.isCorrect ? dailyPuzzle.question.expectedOutput : undefined}
      />

      {/* Observed Examples */}
      <ExampleDisplay examples={dailyPuzzle.examples} />

      {/* Mode 3 Build Controls */}
      <ModeBuild
        key={dailyPuzzle.id}
        availableTokens={dailyPuzzle.availableRuleTokens || []}
        onSubmitRule={handleBuildRuleSubmit}
        disabled={isDone || attemptsLeft <= 0}
      />

      {/* Feedback Modal */}
      {activeAttempt && (
        <FeedbackModal
          puzzle={dailyPuzzle}
          attempt={attemptResultFix(activeAttempt, isDone, attemptsLeft)}
          onNextPuzzle={() => setActiveAttempt(null)}
          onRetry={() => setActiveAttempt(null)}
        />
      )}
    </div>
  );
};

function attemptResultFix(attempt: SolutionAttempt, isDone: boolean, attemptsLeft: number): SolutionAttempt {
  return attempt;
}
