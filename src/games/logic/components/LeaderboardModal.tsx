import { useEffect, useState } from 'react';
import { RefreshCw, Trophy, X } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { PlayerProgress } from '../types';
import { fetchLogicLeaderboard, LogicLeaderboardEntry, LogicSortField, submitLogicScore } from '../services/leaderboardService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
  onRenamePlayer: (name: string) => void;
}

export function LeaderboardModal({ isOpen, onClose, progress, onRenamePlayer }: LeaderboardModalProps) {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<LogicSortField>('totalScore');
  const [entries, setEntries] = useState<LogicLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(progress.playerName);

  const load = async () => {
    setLoading(true);
    const data = await fetchLogicLeaderboard(sortField);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Best-effort sync of the player's own latest score, then refresh the board.
    submitLogicScore(progress).finally(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sortField]);

  if (!isOpen) return null;

  const myNameKey = progress.playerName.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> {t('leaderboard.title')}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSortField('totalScore')}
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              sortField === 'totalScore' ? 'bg-violet-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t('leaderboard.tab.total')}
          </button>
          <button
            onClick={() => setSortField('gauntletBest')}
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              sortField === 'gauntletBest' ? 'bg-violet-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t('leaderboard.tab.gauntlet')}
          </button>
        </div>

        {editingName ? (
          <div className="flex items-center gap-2 shrink-0">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={24}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              placeholder={t('leaderboard.namePrompt')}
            />
            <button
              onClick={() => {
                const trimmed = nameDraft.trim();
                if (trimmed) onRenamePlayer(trimmed);
                setEditingName(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-violet-500 text-slate-950 text-xs font-bold"
            >
              {t('leaderboard.save')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setNameDraft(progress.playerName);
              setEditingName(true);
            }}
            className="self-start text-xs text-slate-500 hover:text-violet-300 shrink-0"
          >
            {progress.playerName} · {t('leaderboard.editName')}
          </button>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5">
          {loading && <p className="text-xs text-slate-500 text-center py-4">{t('leaderboard.loading')}</p>}
          {!loading && entries.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">{t('leaderboard.empty')}</p>
          )}
          {!loading &&
            entries.map((entry, idx) => {
              const isMe = entry.id === myNameKey;
              const value = sortField === 'totalScore' ? entry.totalScore : entry.gauntletBest;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
                    isMe ? 'bg-violet-950/50 border-violet-500/60' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center text-xs font-bold text-slate-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className={isMe ? 'text-violet-200 font-bold' : 'text-slate-200'}>{entry.name}</span>
                    {isMe && (
                      <span className="text-[9px] font-black uppercase tracking-wide bg-violet-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                        {t('leaderboard.you')}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-300">{value.toLocaleString()}</span>
                </div>
              );
            })}
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> {t('leaderboard.refresh')}
        </button>
      </div>
    </div>
  );
}
