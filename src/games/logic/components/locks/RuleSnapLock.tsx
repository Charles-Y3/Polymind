import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n/context';
import { RuleSnapPuzzle } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

export function RuleSnapLock({ puzzle, disabled, onSubmit }: { puzzle: RuleSnapPuzzle; disabled: boolean; onSubmit: (answers: boolean[]) => void }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<'examples' | 'cards' | 'done'>('examples');
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [cardTimeLeft, setCardTimeLeft] = useState(puzzle.secondsPerCard);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const finishWith = (finalAnswers: boolean[]) => {
    setPhase('done');
    onSubmit(finalAnswers);
  };

  const decide = (accepted: boolean) => {
    if (phase !== 'cards' || disabled) return;
    sound.playClick();
    const card = puzzle.cards[cardIndex];
    const nextAnswers = [...answers, accepted];
    const isCorrect = accepted === card.isValid;
    const nextWrong = wrongCount + (isCorrect ? 0 : 1);
    setAnswers(nextAnswers);
    setCorrectCount(correctCount + (isCorrect ? 1 : 0));
    setWrongCount(nextWrong);
    setFlash(isCorrect ? 'correct' : 'wrong');
    window.setTimeout(() => setFlash(null), 350);

    if (nextWrong >= 3) {
      const padded = [...nextAnswers, ...puzzle.cards.slice(nextAnswers.length).map((c) => !c.isValid)];
      finishWith(padded);
      return;
    }
    if (cardIndex + 1 >= puzzle.cards.length) {
      finishWith(nextAnswers);
      return;
    }
    setCardIndex(cardIndex + 1);
    setCardTimeLeft(puzzle.secondsPerCard);
  };

  useEffect(() => {
    if (phase !== 'cards' || disabled) return;
    if (cardTimeLeft <= 0) {
      decide(!puzzle.cards[cardIndex].isValid);
      return;
    }
    const id = window.setTimeout(() => setCardTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardTimeLeft, phase, cardIndex, disabled]);

  if (phase === 'examples') {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-sm text-slate-400 text-center">{t('rulesnap.instructions')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {puzzle.examples.map((ex, i) => (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-center">
              <div className="text-lg font-bold text-slate-100">{ex.input}</div>
              <div className="text-violet-400 text-sm">↓</div>
              <div className="text-lg font-bold text-violet-300">{ex.output}</div>
            </div>
          ))}
        </div>
        <PrimaryButton accent={ACCENT} onClick={() => setPhase('cards')}>
          {t('menu.play')}
        </PrimaryButton>
      </div>
    );
  }

  const card = puzzle.cards[cardIndex];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{t('rulesnap.progress', { correct: correctCount, total: puzzle.requiredCorrect })}</span>
        <span className="text-red-400">{t('rulesnap.wrongStrikes', { n: wrongCount })}</span>
      </div>
      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={cardIndex}
            initial={{ opacity: 0, x: 24, rotate: 4 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: 0,
              scale: flash ? 1.04 : 1,
              borderColor: flash === 'correct' ? 'rgba(52,211,153,0.8)' : flash === 'wrong' ? 'rgba(248,113,113,0.8)' : 'rgba(139,92,246,0.4)',
            }}
            exit={{ opacity: 0, x: -24, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl bg-slate-900 border-2 px-8 py-6 text-center"
          >
            <div className="text-2xl font-bold text-slate-100">{card.input}</div>
            <div className="text-violet-400">↓</div>
            <div className="text-2xl font-bold text-violet-300">{card.output}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-violet-500 transition-all"
          style={{ width: `${(cardTimeLeft / puzzle.secondsPerCard) * 100}%` }}
        />
      </div>
      <div className="flex gap-3">
        <button onClick={() => decide(false)} disabled={disabled} className="px-6 py-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold">
          {t('rulesnap.reject')}
        </button>
        <button onClick={() => decide(true)} disabled={disabled} className="px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
          {t('rulesnap.accept')}
        </button>
      </div>
    </div>
  );
}
