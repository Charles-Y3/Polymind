import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../../leaderboard/firebaseClient';
import { PlayerProfile, SkillType } from '../types';

const COLLECTION_NAME = 'awareness_leaderboard';

export interface AwarenessLeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  total: number;
  observation: number;
  memory: number;
  focus: number;
  discrimination: number;
  awareness: number;
  updatedAt: string;
}

export type AwarenessSortField = 'total' | SkillType;

// Best-effort — this game's own leaderboard sits alongside (not instead of) the
// combined Polymind board; a failed write here never blocks gameplay.
export async function submitAwarenessScore(profile: PlayerProfile): Promise<void> {
  const trimmed = profile.username.trim();
  if (!trimmed) return;
  const nameKey = trimmed.toLowerCase();

  const entry: Omit<AwarenessLeaderboardEntry, 'id'> = {
    name: trimmed,
    avatar: profile.avatar,
    total: Math.round(profile.xp),
    observation: Math.round(profile.skillScores.observation || 0),
    memory: Math.round(profile.skillScores.memory || 0),
    focus: Math.round(profile.skillScores.focus || 0),
    discrimination: Math.round(profile.skillScores.discrimination || 0),
    awareness: Math.round(profile.skillScores.awareness || 0),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, nameKey), entry, { merge: true });
  } catch (err) {
    console.warn('Failed to submit Spot Rush leaderboard score:', err);
  }
}

export async function fetchAwarenessLeaderboard(
  sortField: AwarenessSortField = 'total',
  topN = 50
): Promise<AwarenessLeaderboardEntry[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy(sortField, 'desc'), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AwarenessLeaderboardEntry, 'id'>) }));
  } catch (err) {
    console.warn('Failed to fetch Spot Rush leaderboard:', err);
    return [];
  }
}
