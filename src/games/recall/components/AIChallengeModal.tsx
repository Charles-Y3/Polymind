import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bot, ArrowRight, X, AlertCircle, Key, Settings as SettingsIcon } from 'lucide-react';
import { AgeTier, Language, Question } from '../types';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface AIChallengeModalProps {
  language: Language;
  ageTier: AgeTier;
  customApiKey?: string;
  onOpenSettings?: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
  onClose: () => void;
}

const PRESET_TOPICS = [
  { topic: 'Dinosaurs vs Modern Mammals', label: '🦖 Dinos vs Mammals', labelZhSimp: '🦖 恐龙 vs 现代哺乳动物', labelZhTrad: '🦖 恐龍 vs 現代哺乳動物' },
  { topic: 'Deep Ocean Wonders vs Outer Space', label: '🌊 Ocean vs Space', labelZhSimp: '🌊 深海 vs 外太空', labelZhTrad: '🌊 深海 vs 外太空' },
  { topic: 'Ancient Wonders vs Modern Skyscrapers', label: '🏛 Landmarks & Towers', labelZhSimp: '🏛 奇观与摩天大楼', labelZhTrad: '🏛 奇觀與摩天大樓' },
  { topic: 'Speed Records in Nature & Tech', label: '⚡ Ultra Speeds', labelZhSimp: '⚡ 自然与科技极速', labelZhTrad: '⚡ 自然與科技極速' },
  { topic: 'Extreme Temperatures in Cosmos & Earth', label: '🔥 Extreme Heat', labelZhSimp: '🔥 极限温度大比拼', labelZhTrad: '🔥 極限溫度大比拼' },
];

export const AIChallengeModal: React.FC<AIChallengeModalProps> = ({
  language,
  ageTier,
  customApiKey,
  onOpenSettings,
  onQuestionsGenerated,
  onClose,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasApiKey = Boolean(customApiKey && customApiKey.trim().length > 0);

  const handleGenerate = async (topicToUse?: string) => {
    if (!hasApiKey) {
      soundManager.playWrong();
      setErrorMsg(t(language, 'apiKeyRequiredForAI'));
      if (onOpenSettings) {
        onOpenSettings();
      }
      return;
    }

    const finalTopic = topicToUse || topicInput;
    soundManager.playTap();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-gemini-api-key': customApiKey!.trim(),
      };

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: 'mixed',
          count: 10,
          difficulty: ageTier === 'kids' ? 2 : ageTier === 'teen' ? 3 : 4,
          ageTier,
          topic: finalTopic || undefined,
          customApiKey: customApiKey!.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        onQuestionsGenerated(data.questions);
      } else {
        setErrorMsg(data.error || 'Failed to generate AI questions. Please verify your API key in Settings.');
      }
    } catch {
      setErrorMsg('Network error connecting to Gemini AI generator.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">
                {t(language, 'aiChallenge')}
              </h2>
              <span className="text-xs text-indigo-300 font-mono">
                {t(language, 'aiPoweredByModel')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing API Key State: Single clean message and one button */}
        {!hasApiKey ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-4 text-center my-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/40 shadow-inner">
              <Key className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 px-2">
              <p className="font-semibold text-sm text-amber-100 leading-relaxed">
                {t(language, 'apiKeyRequiredForAI')}
              </p>
              <p className="text-xs text-amber-300/80">
                {t(language, 'apiKeyStoredLocallyNotice')}
              </p>
            </div>
            {onOpenSettings && (
              <button
                onClick={() => {
                  soundManager.playTap();
                  onOpenSettings();
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{t(language, 'configureKeyInSettings')}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* API Key Status Ribbon when key is active */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs bg-slate-950/80 border-emerald-500/30 text-emerald-300">
              <div className="flex items-center gap-2 font-medium">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t(language, 'customApiKeyActiveBadge')}
                </span>
              </div>
              {onOpenSettings && (
                <button
                  onClick={() => {
                    soundManager.playTap();
                    onOpenSettings();
                  }}
                  className="text-xs font-extrabold text-indigo-300 hover:text-white flex items-center gap-1 hover:underline bg-indigo-900/40 hover:bg-indigo-800/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Configure Key</span>
                </button>
              )}
            </div>

            {/* Input Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-indigo-200">
                {t(language, 'customTopicPrompt')}
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={
                  language === 'zh-CN'
                    ? '例如：“食物卡路里”、“超跑 vs 战斗机”'
                    : language === 'zh-TW'
                    ? '例如：“食物卡路里”、“超跑 vs 戰鬥機”'
                    : 'e.g., "Food Calories", "Supercars vs Fighter Jets"'
                }
                className="w-full bg-slate-800/90 border border-indigo-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-medium"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t(language, 'popularTopics')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((p) => {
                  const pLabel =
                    language === 'zh-CN'
                      ? p.labelZhSimp
                      : language === 'zh-TW'
                      ? p.labelZhTrad
                      : p.label;

                  return (
                    <button
                      key={p.topic}
                      onClick={() => {
                        setTopicInput(p.topic);
                        handleGenerate(p.topic);
                      }}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500/40 text-[11px] font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {pLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onOpenSettings();
                    }}
                    className="text-left text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium pl-6"
                  >
                    {t(language, 'usePersonalKeyPrompt')}
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{t(language, 'generatingQuestions')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t(language, 'generateWithAI')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

