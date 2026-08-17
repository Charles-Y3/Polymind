import {Suspense} from 'react';
import {Link} from 'react-router-dom';
import {ChevronLeft} from 'lucide-react';
import type {GameManifestEntry} from './games';
import type {PolymindProfile} from '../profile/profileStore';
import type {SharedLanguage} from './language';
import {t, getGameText} from './i18n';

function GameLoadingFallback({game, lang}: {game: GameManifestEntry; lang: SharedLanguage}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="animate-pulse text-sm tracking-wide uppercase flex items-center gap-2">
        <span>{game.emoji}</span> {t(lang, 'loadingGame', {name: getGameText(lang, game.id, 'name')})}
      </div>
    </div>
  );
}

export default function GameRoute({game, profile}: {game: GameManifestEntry; profile: PolymindProfile}) {
  const {Component} = game;
  const lang = profile.language as SharedLanguage;
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="shrink-0 h-10 flex items-center gap-2 px-2 border-b border-slate-800/80 bg-slate-950 relative z-50">
        <Link
          to="/"
          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-900 transition-colors"
          aria-label={t(lang, 'backToHub')}
        >
          <ChevronLeft size={14} /> {t(lang, 'backToHub')}
        </Link>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>{game.emoji}</span>
          <span className={game.accent.text}>{getGameText(lang, game.id, 'faculty')}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto relative">
        <Suspense fallback={<GameLoadingFallback game={game} lang={lang} />}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
