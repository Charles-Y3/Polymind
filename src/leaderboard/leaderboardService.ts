import {collection, doc, getDocs, limit, orderBy, query, setDoc} from 'firebase/firestore';
import {db} from './firebaseClient';
import {totalScore, type PolymindProfile} from '../profile/profileStore';

const COLLECTION_TOTALS = 'polymind_totals';

export interface PolymindTotalEntry {
  name: string;
  avatar: string;
  reflexes: number;
  recall: number;
  logic: number;
  awareness: number;
  total: number;
  updatedAt: string;
}

export async function submitPolymindTotal(profile: PolymindProfile): Promise<void> {
  const trimmed = profile.name.trim();
  if (!trimmed) return;
  const nameKey = trimmed.toLowerCase();
  const total = totalScore(profile);

  const entry: PolymindTotalEntry = {
    name: trimmed,
    avatar: profile.avatar,
    reflexes: Math.round(profile.perGame.reflexes?.norm ?? 0),
    recall: Math.round(profile.perGame.recall?.norm ?? 0),
    logic: Math.round(profile.perGame.logic?.norm ?? 0),
    awareness: Math.round(profile.perGame.awareness?.norm ?? 0),
    total: Math.round(total),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTION_TOTALS, nameKey), entry, {merge: true});
  } catch (err) {
    // Best-effort — the local radar/profile already reflects progress even if the
    // combined board write fails (offline, rules not deployed yet, etc).
    console.warn('Failed to sync combined Polymind score:', err);
  }
}

export async function fetchPolymindLeaderboard(topN = 50): Promise<PolymindTotalEntry[]> {
  try {
    const q = query(collection(db, COLLECTION_TOTALS), orderBy('total', 'desc'), limit(topN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PolymindTotalEntry);
  } catch (err) {
    console.warn('Failed to fetch combined Polymind leaderboard:', err);
    return [];
  }
}
