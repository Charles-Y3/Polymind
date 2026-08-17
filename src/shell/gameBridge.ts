// Games are lazy-mounted per route and never rendered alongside the Hub, so
// there is no live instance to talk to when the player changes a shared
// setting — instead we patch each game's own persisted storage so the game
// picks up the shared preference the next time it (re)mounts. Every game's
// own loader merges partial objects over its defaults, so a partial patch
// here is always safe.

export type {SharedLanguage} from './language';
import type {SharedLanguage} from './language';

function patchJsonField(key: string, patch: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(key);
    const obj = raw ? JSON.parse(raw) : {};
    localStorage.setItem(key, JSON.stringify({...obj, ...patch}));
  } catch {
    // best-effort — a game that can't read its own patched settings just
    // falls back to its own defaults, which is a safe failure mode.
  }
}

export function applyLanguageToAllGames(lang: SharedLanguage): void {
  patchJsonField('tilt_balance_stats_v1', {language: lang}); // reflexes
  patchJsonField('wyc_settings_v1', {language: lang}); // recall
  patchJsonField('perception_shift_settings_v1', {language: lang}); // awareness
  try {
    localStorage.setItem('machine_mind_language_v1', lang); // logic (raw string, not JSON)
  } catch {
    // ignore
  }
}

// Identity (name + avatar) is edited only in the shell — logic has no
// identity concept, and recall's playerCountry is left alone (out of scope).
export function applyIdentityToAllGames(name: string, avatar: string): void {
  patchJsonField('tilt_balance_stats_v1', {playerName: name}); // reflexes
  patchJsonField('wyc_player_stats_v1', {playerName: name, playerAvatar: avatar}); // recall
  patchJsonField('perception_shift_profile_v1', {username: name, avatar}); // awareness
}
