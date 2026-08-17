import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Flame, Heart, Sparkles, HelpCircle } from 'lucide-react';
import { AgeTier, GameMode, Language, Question } from '../types';
import { getLocalizedExplanation, getLocalizedFunFact, getLocalizedOptionName, getLocalizedQuestionText, t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  gameMode: GameMode;
  livesRemaining: number;
  currentStreak: number;
  language: Language;
  ageTier?: AgeTier;
  onAnswer: (isCorrect: boolean) => void;
  onNextQuestion: () => void;
  onOpenFactModal: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  gameMode,
  livesRemaining,
  currentStreak,
  language,
  ageTier,
  onAnswer,
  onNextQuestion,
  onOpenFactModal,
}) => {
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setSelected(null);
    setIsSubmitted(false);
  }, [question.id, currentIndex]);

  const questionTitle = getLocalizedQuestionText(question, language);
  const optionAName = getLocalizedOptionName(question.optionA, language);
  const optionBName = getLocalizedOptionName(question.optionB, language);
  const explanation = getLocalizedExplanation(question, language);
  const funFact = getLocalizedFunFact(question, language);

  const handleSelect = (optionId: 'A' | 'B') => {
    if (isSubmitted) return;

    setSelected(optionId);
    setIsSubmitted(true);

    const isCorrect = optionId === question.correctOptionId;

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    onAnswer(isCorrect);
  };

  const getDifficultyLabel = (diff: number) => {
    switch (diff) {
      case 1:
        return { label: t(language, 'level1Easy'), color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 2:
        return { label: t(language, 'level2Interesting'), color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' };
      case 3:
        return { label: t(language, 'level3Tricky'), color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
      case 4:
        return { label: t(language, 'level4Expert'), color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' };
      case 5:
        return { label: t(language, 'level5Deceptive'), color: 'border-rose-500/40 text-rose-300 bg-rose-500/20 font-bold animate-pulse' };
      default:
        return { label: 'Normal', color: 'border-slate-700 text-slate-400 bg-slate-800' };
    }
  };

  const diffInfo = getDifficultyLabel(question.difficulty);

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fade-in">
      {/* Question Header Status */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          {gameMode !== 'endless' && (
            <span className="font-mono bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
              Q {currentIndex + 1} / {totalQuestions}
            </span>
          )}

          {gameMode === 'endless' && (
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-rose-400">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${i < livesRemaining ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
                />
              ))}
            </div>
          )}

          {/* Difficulty pill */}
          <span className={`px-2 py-0.5 rounded-full border text-[10px] ${diffInfo.color}`}>
            {diffInfo.label}
          </span>

          {/* Age Tier pill */}
          {ageTier && (
            <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/80 text-[10px] text-slate-300 font-medium">
              {ageTier === 'kids' && `🌱 ${t(language, 'kidsTierShort')}`}
              {ageTier === 'teen' && `⚡ ${t(language, 'teenTierShort')}`}
              {ageTier === 'adult' && `🧠 ${t(language, 'adultTierShort')}`}
            </span>
          )}
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-1 font-bold text-orange-400">
          <Flame className="w-3.5 h-3.5 fill-orange-500" />
          <span>{currentStreak}</span>
        </div>
      </div>

      {/* Main Question Text Banner */}
      <div className="text-center py-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {questionTitle}
        </h2>
      </div>

      {/* Two Choice Cards Container */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Option A */}
        <OptionCard
          optionId="A"
          emoji={question.optionA.emoji}
          name={optionAName}
          valueDisplay={question.optionA.valueDisplay}
          isSelected={selected === 'A'}
          isCorrectTarget={question.correctOptionId === 'A'}
          isSubmitted={isSubmitted}
          onClick={() => handleSelect('A')}
        />

        {/* OR Divider */}
        <div className="flex items-center justify-center -my-1">
          <div className="bg-slate-800 border border-slate-700 text-amber-400 text-[11px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
            {t(language, 'or')}
          </div>
        </div>

        {/* Option B */}
        <OptionCard
          optionId="B"
          emoji={question.optionB.emoji}
          name={optionBName}
          valueDisplay={question.optionB.valueDisplay}
          isSelected={selected === 'B'}
          isCorrectTarget={question.correctOptionId === 'B'}
          isSubmitted={isSubmitted}
          onClick={() => handleSelect('B')}
        />
      </div>

      {/* Answer Reveal Banner & Explanation */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-2"
          >
            {/* Outcome Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                selected === question.correctOptionId
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 font-black text-lg">
                {selected === question.correctOptionId ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>{t(language, 'correctBanner')}</span>
                    <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-mono">
                      +{question.difficulty * 10} XP
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-rose-400" />
                    <span>{t(language, 'wrongBanner')}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                {explanation}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={onOpenFactModal}
                className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-amber-300 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t(language, 'viewFact')}</span>
              </button>
              <button
                onClick={onNextQuestion}
                className="flex-1 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{t(language, 'nextQuestion')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface OptionCardProps {
  optionId: 'A' | 'B';
  emoji: string;
  name: string;
  valueDisplay: string;
  isSelected: boolean;
  isCorrectTarget: boolean;
  isSubmitted: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  emoji,
  name,
  valueDisplay,
  isSelected,
  isCorrectTarget,
  isSubmitted,
  onClick,
}) => {
  let cardStyle = 'bg-slate-800/90 border-slate-700 hover:border-amber-400/50 text-slate-100 hover:bg-slate-800';

  if (isSubmitted) {
    if (isCorrectTarget) {
      cardStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10';
    } else if (isSelected) {
      cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 opacity-80';
    } else {
      cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50';
    }
  }

  return (
    <motion.button
      whileHover={!isSubmitted ? { scale: 1.015 } : {}}
      whileTap={!isSubmitted ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isSubmitted}
      className={`relative w-full p-5 rounded-2xl border text-left transition-all duration-200 shadow-md ${cardStyle} cursor-pointer disabled:cursor-default flex items-center justify-between gap-4`}
    >
      <div className="flex items-center gap-4">
        {/* Emoji Badge */}
        <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-3xl shadow-inner shrink-0">
          {emoji}
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold leading-tight">
            {name}
          </div>
          {/* Revealed Numeric Value */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1 font-mono text-xs font-semibold"
              >
                <span className={isCorrectTarget ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {valueDisplay}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSubmitted && isCorrectTarget && (
        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}
      {isSubmitted && isSelected && !isCorrectTarget && (
        <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
          <X className="w-4 h-4 stroke-[3]" />
        </div>
      )}
    </motion.button>
  );
};
