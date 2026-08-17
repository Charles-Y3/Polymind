import React, { useState } from 'react';
import { Puzzle, SolutionAttempt } from '../types';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { ShieldCheck, AlertCircle, ArrowRight, Bot, RefreshCw } from 'lucide-react';

interface FeedbackModalProps {
  puzzle: Puzzle;
  attempt: SolutionAttempt;
  onNextPuzzle: () => void;
  onRetry: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  puzzle,
  attempt,
  onNextPuzzle,
  onRetry,
}) => {
  const { t, language } = useI18n();
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const endpoint = attempt.isCorrect ? '/api/ai/explain' : '/api/ai/analyze-mistake';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzle: {
            worldTitle: puzzle.worldTitle,
            examples: puzzle.examples,
            expectedRuleDescription: puzzle.expectedRule.description,
          },
          userSubmittedAnswer: attempt.userAnswer || attempt.builtTokens || attempt.selectedHypothesis,
          language,
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || data.feedback || t('feedback.defaultAi'));
    } catch (err) {
      console.error('AI Explanation Error:', err);
      setAiExplanation(t('feedback.defaultAi'));
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border-2 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 ${
        attempt.isCorrect ? 'bg-slate-900 border-emerald-500/80 shadow-emerald-500/20' : 'bg-slate-900 border-rose-500/80 shadow-rose-500/20'
      }`}>
        {/* Header Icon & Status */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg my-1">
            {attempt.isCorrect ? (
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl border border-emerald-400/40 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400 animate-bounce" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl border border-rose-400/40 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-rose-400" />
              </div>
            )}
          </div>

          <h2 className={`text-2xl font-black font-mono tracking-tight ${
            attempt.isCorrect ? 'text-emerald-300' : 'text-rose-300'
          }`}>
            {attempt.isCorrect ? t('feedback.cracked') : t('feedback.rejected')}
          </h2>

          <p className="text-xs font-mono text-slate-300">
            {attempt.isCorrect
              ? t('feedback.successSub', { title: puzzle.title })
              : t('feedback.failSub')}
          </p>
        </div>

        {/* RULE & SCORE BREAKDOWN */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5">
            <span>{t('feedback.ruleFormula')}</span>
            <strong className="text-cyan-300">{puzzle.expectedRule.description}</strong>
          </div>

          {attempt.isCorrect && (
            <div className="flex justify-between items-center text-slate-400">
              <span>{t('feedback.scoreEarned')}</span>
              <strong className="text-emerald-400 text-sm">+{attempt.scoreEarned} PTS</strong>
            </div>
          )}

          <div className="text-slate-300 text-xs pt-1 italic font-sans">
            "{puzzle.explanation}"
          </div>
        </div>

        {/* AI EXPLANATION WIDGET */}
        {aiExplanation ? (
          <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-300 font-mono font-bold">
              <Bot className="w-4 h-4" />
              <span>{t('feedback.aiTutor')}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{aiExplanation}</p>
          </div>
        ) : (
          <button
            onClick={fetchAiExplanation}
            disabled={loadingAi}
            className="w-full py-2 px-3 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Bot className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? t('feedback.consultingAi') : t('feedback.askAi')}</span>
          </button>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 pt-2">
          {!attempt.isCorrect ? (
            <button
              onClick={() => { sound.playClick(); onRetry(); }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('feedback.retry')}</span>
            </button>
          ) : (
            <button
              onClick={() => { sound.playClick(); onNextPuzzle(); }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{t('feedback.nextMachine')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
