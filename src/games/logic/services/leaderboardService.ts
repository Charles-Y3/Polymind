import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../../leaderboard/firebaseClient';
import { PlayerProgress } from '../types';

const COLLECTION_NAME = 'logic_leaderboard';

export interface LogicLeaderboardEntry {
  id: string;
  name: string;
  totalScore: number;
  gauntletBest: number;
  updatedAt: string;
}

export type LogicSortField = 'totalScore' | 'gauntletBest';

// Best-effort — a failed write here never blocks gameplay.
export async function submitLogicScore(progress: PlayerProgress): Promise<void> {
  const trimmed = progress.playerName.trim();
  if (!trimmed) return;
  const nameKey = trimmed.toLowerCase();

  const entry: Omit<LogicLeaderboardEntry, 'id'> = {
    name: trimmed,
    totalScore: Math.round(progress.totalScore),
    gauntletBest: Math.round(progress.gauntletBest),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, nameKey), entry, { merge: true });
  } catch (err) {
    console.warn('Failed to submit Logic Lock leaderboard score:', err);
  }
}

export async function fetchLogicLeaderboard(
  sortField: LogicSortField = 'totalScore',
  topN = 50
): Promise<LogicLeaderboardEntry[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy(sortField, 'desc'), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LogicLeaderboardEntry, 'id'>) }));
  } catch (err) {
    console.warn('Failed to fetch Logic Lock leaderboard:', err);
    return [];
  }
}
