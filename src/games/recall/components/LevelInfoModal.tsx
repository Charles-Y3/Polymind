import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, X, ChevronRight, Star } from 'lucide-react';
import { Language, PlayerStats } from '../types';
import { getLevelInfo, LEVEL_THRESHOLDS } from '../utils/storage';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/audio';

interface LevelInfoModalProps {
  stats: PlayerStats;
  language: Language;
  onClose: () => void;
}

export const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ stats, language, onClose }) => {
  const currentLevelInfo = getLevelInfo(stats.xp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{t(language, 'levelInfoTitle')}</span>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-slate-200">
          {/* Current Level Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/30 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-black text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              {currentLevelInfo.emoji}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                  Level {currentLevelInfo.level}
                </span>
                <span className="text-xs text-slate-400 font-mono">{stats.xp} {t(language, 'totalXpLabel')}</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {language === 'zh-CN'
                  ? currentLevelInfo.titleZhSimp
                  : language === 'zh-TW'
                  ? currentLevelInfo.titleZhTrad
                  : currentLevelInfo.title}
              </h3>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{t(language, 'howXpWorks')}</span>
            </div>
            <p>{t(language, 'levelInfoDesc')}</p>
            <div className="p-2 bg-slate-900/80 rounded-lg font-mono text-[11px] text-amber-300/90 border border-slate-800">
              {t(language, 'maxLevelInfo')}
            </div>
          </div>

          {/* Level Roadmap */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t(language, 'levelRoadmap')}
            </h4>

            <div className="space-y-2">
              {LEVEL_THRESHOLDS.map((lvl) => {
                const isCurrent = lvl.level === currentLevelInfo.level;
                const isReached = stats.xp >= lvl.xp;
                const levelTitleStr =
                  language === 'zh-CN'
                    ? lvl.titleZhSimp
                    : language === 'zh-TW'
                    ? lvl.titleZhTrad
                    : lvl.title;

                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold ring-1 ring-amber-500/30'
                        : isReached
                        ? 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{lvl.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={isCurrent ? 'text-amber-400' : ''}>
                            Lv.{lvl.level} · {levelTitleStr}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                              {t(language, 'currentLevelBadge')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {lvl.xp} XP
                        </span>
                      </div>
                    </div>

                    {isReached ? (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer close */}
        <div className="pt-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-all border border-slate-700"
          >
            {t(language, 'close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
