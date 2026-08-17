import confetti from 'canvas-confetti';
import React, { useEffect, useState } from 'react';
import { ChallengeResult, Language, PlayMode, PlayerProfile, SkillType } from '../types';
import { soundManager } from '../utils/audio';
import { masteryRanks, skillLabels, translations } from '../utils/i18n';
import { calculateMasteryLevel, getPercentile } from '../utils/storage';

interface SessionSummaryProps {
  results: ChallengeResult[];
  playMode: PlayMode;
  profile: PlayerProfile;
  language: Language;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onBackToMenu: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  results,
  playMode,
  profile,
  language,
  onPlayAgain,
  onOpenLeaderboard,
  onBackToMenu,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const avgTime =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length).toFixed(2)
      : '0.00';

  const isPerfect = results.length >= 5 && accuracy === 100;
  const mastery = calculateMasteryLevel(profile.xp);
  const percentile = getPercentile(totalScore);
  const estimatedRank = Math.max(1, Math.floor((percentile / 100) * 2400) + Math.floor(Math.random() * 12));

  // Trigger celebration on load
  useEffect(() => {
    soundManager.playLevelUp();
    if (isPerfect || accuracy >= 80) {
      try {
        confetti({
          particleCount: isPerfect ? 100 : 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isPerfect, accuracy]);

  // Dynamic diagnostic text based on strongest and weakest skills
  const skillsList: SkillType[] = ['observation', 'memory', 'focus', 'discrimination', 'awareness'];
  const skillScores = profile.skillScores;
  const sortedSkills = [...skillsList].sort((a, b) => (skillScores[b] || 50) - (skillScores[a] || 50));
  const bestSkill = sortedSkills[0];
  const worstSkill = sortedSkills[sortedSkills.length - 1];

  const getDiagnosticQuote = () => {
    const bestName = skillLabels[bestSkill].name[language];
    const worstName = skillLabels[worstSkill].name[language];

    if (language === 'en') {
      return `You demonstrate exceptional visual sharpness in ${bestName}, rapidly filtering interference. Continue refining your ${worstName} to achieve complete perceptual mastery.`;
    } else if (language === 'zh-CN') {
      return `你在【${bestName}】维度展现出敏锐的洞察力，能极速过滤干扰。进一步锻炼【${worstName}】将助你达成全维感知大师。`;
    } else {
      return `你在【${bestName}】維度展現出敏銳的洞察力，能極速過濾干擾。進一步鍛煉【${worstName}】將助你達成全維感知大師。`;
    }
  };

  const handleShare = () => {
    let shareText = '';
    if (language === 'en') {
      shareText = `👁️ Spot Rush: I scored ${totalScore.toLocaleString()} pts (${accuracy}% Accuracy) in the Human Abilities Perception Test! Top ${percentile}% Rank #${estimatedRank}.`;
    } else if (language === 'zh-CN') {
      shareText = `👁️ 全知之瞳：我在人类能力感知测评中斩获 ${totalScore.toLocaleString()} 分（准确率 ${accuracy}%）！超越全服 ${percentile}% 玩家，全球估测排名 #${estimatedRank}。`;
    } else {
      shareText = `👁️ 全知之瞳：我在人類能力感知測評中斬獲 ${totalScore.toLocaleString()} 分（準確率 ${accuracy}%）！超越全服 ${percentile}% 玩家，全球估測排名 #${estimatedRank}。`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="session-summary-view"
      className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Prestige Perfect Perception Banner if 100% accuracy */}
        {isPerfect && (
          <div className="w-full mb-4 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
            <span>✨</span>
            <span>{t.perfectDetection}</span>
            <span>✨</span>
          </div>
        )}

        <h2 className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold mb-1">
          {t.testComplete}
        </h2>
        <div className="text-4xl sm:text-5xl font-black font-mono text-slate-100 tracking-tight my-2">
          {totalScore.toLocaleString()}
        </div>

        {/* Global Rank & Percentile Pill */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
            {t.globalRank} #{estimatedRank}
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
            {t.topPercentile} {percentile}%
          </span>
        </div>

        {/* Key Metrics: Accuracy & Speed */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400">
              {t.accuracy}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {accuracy}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5">
              {t.correctCountSummary.replace('{correct}', String(correctCount)).replace('{total}', String(results.length))}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400">
              {t.speed}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-0.5">
              {avgTime}s
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5">
              {t.avgPerChallenge}
            </span>
          </div>
        </div>

        {/* Five Perception Skills Breakdown */}
        <div className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-4 mb-6 text-left">
          <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 mb-3 flex items-center justify-between">
            <span>{t.perceptionProfile}</span>
            <span className="text-cyan-400 font-mono text-[11px]">
              {mastery.rank.title[language]} · Lv.{mastery.level}
            </span>
          </h3>

          <div className="space-y-2.5">
            {skillsList.map((skillKey) => {
              const info = skillLabels[skillKey];
              const score = skillScores[skillKey] || 50;

              return (
                <div key={skillKey} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>{info.icon}</span>
                      <span>{info.name[language]}</span>
                    </span>
                    <span className="font-mono font-bold text-cyan-300">{score}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Assessment Text */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed mb-6 italic text-left">
          &ldquo;{getDiagnosticQuote()}&rdquo;
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            id="summary-play-again-btn"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-98 cursor-pointer"
          >
            {t.playAgain}
          </button>

          <button
            id="summary-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all active:scale-98 cursor-pointer"
          >
            {t.leaderboard}
          </button>
        </div>

        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <button
            id="summary-back-menu-btn"
            onClick={onBackToMenu}
            className="text-slate-400 hover:text-slate-200 transition-colors font-mono cursor-pointer"
          >
            ← {t.backToMenu}
          </button>

          <button
            id="summary-share-btn"
            onClick={handleShare}
            className="text-cyan-400 hover:text-cyan-300 font-mono font-bold transition-colors cursor-pointer"
          >
            {copied ? `✓ ${t.copiedLink}` : `🔗 ${t.shareScore}`}
          </button>
        </div>
      </div>
    </div>
  );
};
