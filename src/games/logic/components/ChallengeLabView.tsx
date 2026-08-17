import React, { useState } from 'react';
import { InteractionMode, Puzzle, SolutionAttempt } from '../types';
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
import { Sliders, Play } from 'lucide-react';

interface ChallengeLabViewProps {
  onEarnScore: (score: number) => void;
}

export const ChallengeLabView: React.FC<ChallengeLabViewProps> = ({ onEarnScore }) => {
  const { t, getLocalizedPuzzle } = useI18n();
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [selectedMode, setSelectedMode] = useState<InteractionMode>('choose');
  const [rawPuzzle, setRawPuzzle] = useState<Puzzle | null>(null);
  const activePuzzle = rawPuzzle ? getLocalizedPuzzle(rawPuzzle) : null;
  const [activeAttempt, setActiveAttempt] = useState<SolutionAttempt | null>(null);

  const handleGenerateCustomPuzzle = () => {
    sound.playClick();
    setActiveAttempt(null);
    const puzzle = generateProceduralPuzzle(selectedDifficulty, selectedMode);
    setRawPuzzle(puzzle);
  };

  const handleProcessAnswer = (answerVal: any) => {
    if (!activePuzzle) return;
    const expected = activePuzzle.question.expectedOutput;
    const isCorrect = String(answerVal) === String(expected);

    const scoreEarned = isCorrect ? selectedDifficulty * 40 : 0;

    const attemptResult: SolutionAttempt = {
      puzzleId: activePuzzle.id,
      userAnswer: answerVal,
      hintsUsed: 0,
      attemptsCount: 1,
      isCorrect,
      scoreEarned,
    };

    setActiveAttempt(attemptResult);

    if (isCorrect) {
      sound.playSuccess();
      onEarnScore(scoreEarned);
    } else {
      sound.playError();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Custom Lab Controls */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-purple-200">
              {t('challenge.title')}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              {t('challenge.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty Tier */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1.5">
              {t('challenge.tierLabel')}
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { sound.playClick(); setSelectedDifficulty(lvl); }}
                  className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                    selectedDifficulty === lvl
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  T{lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Mode */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1.5">
              {t('challenge.modeLabel')}
            </label>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {(['choose', 'enter', 'build', 'discover'] as InteractionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { sound.playClick(); setSelectedMode(mode); }}
                  className={`py-2 rounded-lg font-bold border uppercase transition-all ${
                    selectedMode === mode
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateCustomPuzzle}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-bold font-mono text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-100" />
            <span>{t('challenge.generateBtn')}</span>
          </button>
        </div>
      </div>

      {/* Generated Puzzle Section */}
      {activePuzzle && (
        <div className="space-y-6">
          <MachineVisual
            currentInput={activePuzzle.question.input}
            currentOutput={activeAttempt?.isCorrect ? activePuzzle.question.expectedOutput : undefined}
            machineTitle={activePuzzle.title}
            statusState={activeAttempt?.isCorrect ? 'success' : activeAttempt ? 'error' : 'idle'}
            ruleDescription={activeAttempt?.isCorrect ? activePuzzle.expectedRule.description : undefined}
          />

          <QuestionCard
            questionInput={activePuzzle.question.input}
            mode={activePuzzle.mode}
            worldId={activePuzzle.worldId}
            title={activePuzzle.title}
            isSolved={activeAttempt?.isCorrect}
            revealedOutput={activeAttempt?.isCorrect ? activePuzzle.question.expectedOutput : undefined}
          />

          <ExampleDisplay examples={activePuzzle.examples} />

          {activePuzzle.mode === 'choose' && (
            <ModeChoose
              key={activePuzzle.id}
              questionInput={activePuzzle.question.input}
              choices={activePuzzle.question.choices || []}
              onSubmitAnswer={handleProcessAnswer}
              disabled={!!activeAttempt}
            />
          )}

          {activePuzzle.mode === 'enter' && (
            <ModeEnter
              key={activePuzzle.id}
              questionInput={activePuzzle.question.input}
              onSubmitAnswer={handleProcessAnswer}
              disabled={!!activeAttempt}
            />
          )}

          {activePuzzle.mode === 'build' && (
            <ModeBuild
              key={activePuzzle.id}
              availableTokens={activePuzzle.availableRuleTokens || []}
              onSubmitRule={(tokens) => handleProcessAnswer(tokens.join(''))}
              disabled={!!activeAttempt}
            />
          )}

          {activePuzzle.mode === 'discover' && (
            <ModeDiscover
              key={activePuzzle.id}
              questionInput={activePuzzle.question.input}
              expectedOutput={activePuzzle.question.expectedOutput}
              onSubmitAnswer={handleProcessAnswer}
              disabled={!!activeAttempt}
            />
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {activeAttempt && activePuzzle && (
        <FeedbackModal
          puzzle={activePuzzle}
          attempt={activeAttempt}
          onNextPuzzle={handleGenerateCustomPuzzle}
          onRetry={handleGenerateCustomPuzzle}
        />
      )}
    </div>
  );
};
