import type {GameId} from '../shell/games';

const STORAGE_KEY = 'polymind_profile_v1';

export interface GameContribution {
  norm: number; // 0-100
  nativeBest?: number;
  updatedAt: string;
}

export interface PolymindProfile {
  name: string;
  avatar: string;
  createdAt: string;
  perGame: Partial<Record<GameId, GameContribution>>;
  language: string;
}

const AVATARS = ['🦊', '🐙', '🦉', '🐳', '🦁', '🐼', '🦄', '🐢', '🦅', '🐬', '🦋', '🐲'];
const ADJECTIVES = ['Swift', 'Sharp', 'Bright', 'Quick', 'Keen', 'Bold', 'Cosmic', 'Nimble'];
const NOUNS = ['Fox', 'Owl', 'Wave', 'Spark', 'Comet', 'Falcon', 'Nova', 'Lynx'];

function randomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${adj}${noun}${num}`;
}

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

function defaultProfile(): PolymindProfile {
  return {
    name: randomName(),
    avatar: randomAvatar(),
    createdAt: new Date().toISOString(),
    perGame: {},
    language: 'en',
  };
}

export function loadProfile(): PolymindProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PolymindProfile;
      if (parsed && typeof parsed.name === 'string') return parsed;
    }
  } catch {
    // fall through to default
  }
  const fresh = defaultProfile();
  saveProfile(fresh);
  return fresh;
}

export function saveProfile(profile: PolymindProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function updateProfile(patch: Partial<PolymindProfile>): PolymindProfile {
  const current = loadProfile();
  const next = {...current, ...patch};
  saveProfile(next);
  return next;
}

export function setGameContribution(gameId: GameId, contribution: GameContribution): PolymindProfile {
  const current = loadProfile();
  const next: PolymindProfile = {
    ...current,
    perGame: {...current.perGame, [gameId]: contribution},
  };
  saveProfile(next);
  return next;
}

export function totalScore(profile: PolymindProfile): number {
  return Object.values(profile.perGame).reduce((sum, g) => sum + (g?.norm ?? 0), 0);
}

export {AVATARS};
