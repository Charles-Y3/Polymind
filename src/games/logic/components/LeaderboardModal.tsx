import React from 'react';
import { useI18n } from '../i18n/context';
import { sound } from '../utils/audio';
import { generateLeaderboard } from '../utils/storage';
import { X, Trophy } from 'lucide-react';

interface LeaderboardModalProps {
  totalScore: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ totalScore, onClose }) => {
  const { t } = useI18n();
  const entries = generateLeaderboard(t('leaderboard.you'), totalScore);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-violet-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[85vh] flex flex-col">
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-violet-200">
              {t('leaderboard.title')}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {t('leaderboard.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          {entries.map((entry) => {
            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  entry.isPlayer
                    ? 'bg-violet-950/60 border border-violet-500/50 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500/40'
                    : 'bg-slate-950/60 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                    {medal || `#${entry.rank}`}
                  </span>
                  <span className="text-lg select-none">{entry.icon}</span>
                  <span className={`text-sm font-bold truncate ${entry.isPlayer ? 'text-violet-300' : 'text-slate-200'}`}>
                    {entry.name}
                  </span>
                </div>
                <span className={`font-mono font-bold text-sm ${entry.isPlayer ? 'text-violet-400' : 'text-slate-300'}`}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
