import {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Trophy} from 'lucide-react';
import {GAMES} from './games';
import ProfileBar from './ProfileBar';
import RadarChart from './RadarChart';
import {totalScore, updateProfile, type PolymindProfile} from '../profile/profileStore';
import {computeAllContributions} from '../profile/normalize';
import {submitPolymindTotal} from '../leaderboard/leaderboardService';
import {t, getGameText} from './i18n';
import type {SharedLanguage} from './language';

interface HubProps {
  profile: PolymindProfile;
  onProfileChange: (profile: PolymindProfile) => void;
}

export default function Hub({profile, onProfileChange}: HubProps) {
  // Each game keeps its own local progress; on every Hub visit we re-derive
  // this player's 0-100 contribution per game so the radar/total stay live
  // without requiring edits inside each game's internals, then sync the
  // combined total to the shared Polymind leaderboard (best-effort).
  useEffect(() => {
    const perGame = computeAllContributions();
    if (Object.keys(perGame).length > 0) {
      const updated = updateProfile({perGame: {...profile.perGame, ...perGame}});
      onProfileChange(updated);
      submitPolymindTotal(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = totalScore(profile);
  const lang = profile.language as SharedLanguage;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(168,85,247,0.15),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.12),transparent_40%)]" />

      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-5 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {t(lang, 'appTitle')}
          </h1>
          <p className="text-xs text-slate-500 -mt-0.5">{t(lang, 'appTagline')}</p>
        </div>
        <ProfileBar profile={profile} onChange={onProfileChange} />
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-8 pb-16">
        <section className="grid sm:grid-cols-[1.3fr_1fr] gap-6 mb-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-center">
            <p className="text-sm text-slate-400">{t(lang, 'hubIntro')}</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="text-3xl font-black text-slate-100">{total}<span className="text-base text-slate-500 font-medium">/400</span></div>
              <Link
                to="/leaderboard"
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/50 rounded-full px-3 py-1.5 transition-colors"
              >
                <Trophy size={14} /> {t(lang, 'leaderboard')}
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-center">
            <RadarChart profile={profile} />
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          {GAMES.map((game) => {
            const contribution = profile.perGame[game.id];
            return (
              <Link
                key={game.id}
                to={game.path}
                className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-600 transition-colors`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${game.accent.from} ${game.accent.to} transition-opacity`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-3xl mb-2">{game.emoji}</div>
                    <h2 className="text-lg font-bold text-slate-50">{getGameText(lang, game.id, 'name')}</h2>
                    <p className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${game.accent.text}`}>{getGameText(lang, game.id, 'faculty')}</p>
                    <p className="text-sm text-slate-500 mt-2">{getGameText(lang, game.id, 'tagline')}</p>
                  </div>
                  <div className="text-2xl font-black text-slate-600 group-hover:text-slate-300 transition-colors">
                    {contribution ? Math.round(contribution.norm) : '—'}
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="relative rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 p-6 flex flex-col items-center justify-center text-center opacity-60">
            <div className="text-3xl mb-2">➕</div>
            <h2 className="text-sm font-bold text-slate-400">{t(lang, 'moreComingTitle')}</h2>
            <p className="text-xs text-slate-600 mt-1">{t(lang, 'moreComingDesc')}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
