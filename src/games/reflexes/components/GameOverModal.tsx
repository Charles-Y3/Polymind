import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, LevelConfig } from '../types';
import { Trophy, Star, RotateCcw, ArrowRight, Home, Share2, Check, RefreshCw, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { shareScoreCard, getRegisteredNameForCurrentIp } from '../services/leaderboardService';
import { calculateStars } from '../utils/stars';

interface GameOverModalProps {
  score: number;
  timeSurvived: number;
  obstaclesDodged: number;
  powerupsCollected: number;
  level: LevelConfig;
  gameMode: GameMode;
  defaultPlayerName: string;
  onSubmitScore: (playerName: string) => Promise<{ rank: number; entry: any }>;
  onRestart: () => void;
  onNextLevel?: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  timeSurvived,
  obstaclesDodged,
  powerupsCollected,
  level,
  gameMode,
  defaultPlayerName,
  onSubmitScore,
  onRestart,
  onNextLevel,
  onHome,
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [registeredIpName, setRegisteredIpName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ipMismatchName, setIpMismatchName] = useState<string | null>(null);

  // Check if current IP already has a registered username
  useEffect(() => {
    getRegisteredNameForCurrentIp().then((regName) => {
      if (regName) {
        setRegisteredIpName(regName);
        if (!playerName || playerName === 'Player' || playerName === 'Anonymous') {
          setPlayerName(regName);
        }
      }
    });
  }, []);

  // Calculate Stars for Campaign Mode
  const stars = calculateStars(score, timeSurvived, level, gameMode);

  useEffect(() => {
    // Confetti burst if high score or 2+ stars
    if (score > 1000 || stars >= 2) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  }, [score, stars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || submitting) return;

    setErrorMessage(null);
    setIpMismatchName(null);
    setSubmitting(true);

    try {
      const res = await onSubmitScore(playerName.trim());
      setSubmittedRank(res.rank || 1);
    } catch (err: any) {
      console.warn('Score submission error in modal:', err);
      if (err.code === 'IP_NAME_MISMATCH' || err.registeredName) {
        setIpMismatchName(err.registeredName || registeredIpName);
        setErrorMessage(
          err.message ||
            `This IP address is already registered to player "${err.registeredName}". Only 1 username is permitted per IP.`
        );
      } else {
        setErrorMessage(err.message || 'Failed to submit score to leaderboard. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseRegisteredName = (name: string) => {
    setPlayerName(name);
    setErrorMessage(null);
    setIpMismatchName(null);
  };

  const handleShare = async () => {
    if (!submittedRank) return;
    const res = await shareScoreCard(playerName, score, submittedRank, gameMode, timeSurvived);
    if (res.success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-white text-center">
        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {gameMode === 'campaign' ? 'Stage Finished' : 'Endless Run Ended'}
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-0.5">
            {stars > 0 ? 'VICTORY!' : 'OUT OF BALANCE!'}
          </h2>
        </div>

        {/* Campaign Star Rating */}
        {gameMode === 'campaign' && (
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-9 h-9 transition-transform duration-500 ${
                  s <= stars
                    ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_12px_#f59e0b]'
                    : 'text-slate-700 fill-slate-800 scale-90'
                }`}
              />
            ))}
          </div>
        )}

        {/* Final Score */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Score</span>
          <div className="text-4xl font-black font-mono text-cyan-400 tracking-tight mt-0.5">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Performance Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Time</span>
            <span className="font-mono font-bold text-xs text-white">{timeSurvived}s</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Dodged</span>
            <span className="font-mono font-bold text-xs text-amber-400">{obstaclesDodged}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">PowerUps</span>
            <span className="font-mono font-bold text-xs text-cyan-400">{powerupsCollected}</span>
          </div>
        </div>

        {/* IP Name Mismatch Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-left flex flex-col gap-2 animate-fade-in">
            <div className="flex items-start gap-2 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {ipMismatchName && (
              <button
                type="button"
                onClick={() => handleUseRegisteredName(ipMismatchName)}
                className="self-start px-3 py-1.5 rounded-lg bg-rose-800/80 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />
                <span>Use Registered Name: "{ipMismatchName}"</span>
              </button>
            )}
          </div>
        )}

        {/* Submit to Global Firestore Leaderboard */}
        {submittedRank === null ? (
          <div className="flex flex-col gap-1.5 text-left">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs font-semibold text-white">
                Posting as <span className="text-cyan-300">{playerName}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                {submitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-cyan-200" />
                )}
                <span>{submitting ? 'Posting...' : 'Post Global'}</span>
              </button>
            </form>
            {registeredIpName && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>
                  IP Locked Username: <strong className="text-cyan-300 font-mono">{registeredIpName}</strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/60 py-2.5 px-3 rounded-xl border border-amber-600/70 shadow-lg animate-bounce-short">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>🎉 Ranked #{submittedRank} on Global Leaderboard!</span>
            </div>

            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {copiedShare ? <Check className="w-4 h-4 text-slate-950" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShare ? 'Copied Share Link to Clipboard!' : 'Boast Score & Rank with Friends!'}</span>
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          {onNextLevel && stars > 0 && (
            <button
              onClick={onNextLevel}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
