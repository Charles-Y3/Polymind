import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {ChevronLeft, Trophy} from 'lucide-react';
import {fetchPolymindLeaderboard, type PolymindTotalEntry} from '../leaderboard/leaderboardService';
import {GAMES} from './games';
import type {PolymindProfile} from '../profile/profileStore';
import type {SharedLanguage} from './language';
import {t} from './i18n';

export default function LeaderboardPage({profile}: {profile: PolymindProfile}) {
  const [entries, setEntries] = useState<PolymindTotalEntry[] | null>(null);
  const lang = profile.language as SharedLanguage;

  useEffect(() => {
    fetchPolymindLeaderboard().then(setEntries);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
        <ChevronLeft size={14} /> {t(lang, 'backToHub')}
      </Link>
      <h1 className="text-2xl font-extrabold mt-3 mb-1 flex items-center gap-2">
        <Trophy className="text-amber-400" size={22} /> {t(lang, 'combinedLeaderboard')}
      </h1>
      <p className="text-sm text-slate-500 mb-6">{t(lang, 'leaderboardSubtitle')}</p>

      {entries === null && <div className="text-sm text-slate-500 animate-pulse">{t(lang, 'loading')}</div>}

      {entries !== null && entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
          {t(lang, 'noScoresYet')}
        </div>
      )}

      {entries !== null && entries.length > 0 && (
        <ol className="space-y-2">
          {entries.map((e, i) => (
            <li
              key={e.name}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3"
            >
              <div className="w-6 text-center text-sm font-bold text-slate-500">{i + 1}</div>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">
                {e.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 truncate">{e.name}</div>
                <div className="flex gap-2 mt-0.5">
                  {GAMES.map((g) => (
                    <span key={g.id} className={`text-[10px] font-semibold ${g.accent.text}`}>
                      {g.emoji} {(e as any)[g.id] ?? 0}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xl font-black text-slate-100">{e.total}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
