import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bookmark, Check, ArrowRight, X, Bot } from 'lucide-react';
import { DiscoveryItem, Language, Question } from '../types';
import { getLocalizedFunFact, getLocalizedOptionName, getLocalizedQuestionText, t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface FactCardModalProps {
  question: Question;
  language: Language;
  isSaved: boolean;
  customApiKey?: string;
  onToggleSave: (item: DiscoveryItem) => void;
  onNext: () => void;
  onClose: () => void;
}

export const FactCardModal: React.FC<FactCardModalProps> = ({
  question,
  language,
  isSaved,
  customApiKey,
  onToggleSave,
  onNext,
  onClose,
}) => {
  const [deepDiveText, setDeepDiveText] = useState<string | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);

  const funFact = getLocalizedFunFact(question, language);
  const optionAName = getLocalizedOptionName(question.optionA, language);
  const optionBName = getLocalizedOptionName(question.optionB, language);
  const questionText = getLocalizedQuestionText(question, language);

  const handleSave = () => {
    soundManager.playTap();
    const item: DiscoveryItem = {
      id: `disc_${question.id}`,
      questionId: question.id,
      title: `${optionAName} vs ${optionBName}`,
      emoji: question.optionA.emoji,
      comparisonText: questionText,
      explanation: question.explanation,
      funFact: question.funFact,
      category: question.category,
      savedAt: Date.now(),
      aiDeepDive: deepDiveText || undefined,
    };
    onToggleSave(item);
  };

  const handleFetchDeepDive = async () => {
    if (!customApiKey || customApiKey.trim().length === 0) {
      soundManager.playWrong();
      setDeepDiveError(t(language, 'apiKeyRequiredForAI'));
      return;
    }

    soundManager.playTap();
    setIsLoadingDeepDive(true);
    setDeepDiveError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-gemini-api-key': customApiKey.trim(),
      };

      const res = await fetch('/api/deep-dive', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemA: optionAName,
          itemB: optionBName,
          questionText,
          explanation: question.explanation,
          customApiKey: customApiKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.deepDiveText) {
        setDeepDiveText(data.deepDiveText);
      } else {
        setDeepDiveError(data.error || 'Unable to load AI deep dive. Please verify your API key in Settings.');
      }
    } catch {
      setDeepDiveError('Network error connecting to Gemini API.');
    } finally {
      setIsLoadingDeepDive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[88vh] flex flex-col space-y-4"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>{t(language, 'didYouKnow')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-slate-200 focus:outline-none">
          {/* Emojis Hero */}
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="text-4xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow">
              {question.optionA.emoji}
            </span>
            <span className="text-slate-500 font-black text-sm">{t(language, 'vsText')}</span>
            <span className="text-4xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow">
              {question.optionB.emoji}
            </span>
          </div>

          {/* Fun Fact Highlight Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-slate-100 space-y-2">
            <div className="font-bold text-sm text-amber-300">
              {optionAName} &amp; {optionBName}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
              {funFact}
            </p>
          </div>

          {/* AI Deep Dive Section */}
          {deepDiveText ? (
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-xs text-indigo-100 space-y-2.5 shadow-inner">
              <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm pb-1 border-b border-indigo-800/50">
                <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{t(language, 'deepDiveTitle')}</span>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-slate-200 space-y-2 text-xs sm:text-sm">
                {deepDiveText}
              </div>
            </div>
          ) : isLoadingDeepDive ? (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex flex-col items-center justify-center text-center gap-2.5 animate-pulse">
              <Bot className="w-7 h-7 text-indigo-400 animate-bounce" />
              <div className="font-bold text-indigo-300 text-sm">
                {t(language, 'loadingDeepDive')}
              </div>
              <div className="text-[11px] text-indigo-200/80 max-w-xs">
                {t(language, 'loadingDeepDiveDesc')}
              </div>
            </div>
          ) : (
            <button
              onClick={handleFetchDeepDive}
              className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-indigo-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>{t(language, 'aiDeepDive')}</span>
            </button>
          )}

          {deepDiveError && (
            <div className="text-[11px] text-rose-400 text-center font-mono p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
              {deepDiveError}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center gap-2 pt-2 shrink-0 border-t border-slate-800">
          <button
            onClick={handleSave}
            className={`flex-1 py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? t(language, 'saved') : t(language, 'saveDiscovery')}</span>
          </button>

          <button
            onClick={onNext}
            className="flex-1 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <span>{t(language, 'nextQuestion')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
