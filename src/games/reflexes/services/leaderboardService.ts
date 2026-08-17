import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeaderboardEntry, GameMode } from '../types';
import { getLeaderboard as getLocalLeaderboard, addLeaderboardEntry as addLocalEntry } from '../utils/storage';

const COLLECTION_NAME = 'leaderboard';
const COLLECTION_IP_PLAYERS = 'ip_players';

// Cached client IP information
let cachedIpHash: string | null = null;
let cachedRegisteredName: string | null = null;

export function deduplicateLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const nameMap = new Map<string, LeaderboardEntry>();
  const ipMap = new Map<string, LeaderboardEntry>();

  // Sort entries descending by score first
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  const result: LeaderboardEntry[] = [];

  for (const entry of sorted) {
    const nameKey = entry.playerName ? entry.playerName.trim().toLowerCase() : '';
    if (!nameKey) continue;

    // Deduplicate by player name
    if (nameMap.has(nameKey)) continue;

    // Deduplicate by IP hash if available
    if (entry.ipHash && ipMap.has(entry.ipHash)) continue;

    nameMap.set(nameKey, entry);
    if (entry.ipHash) {
      ipMap.set(entry.ipHash, entry);
    }
    result.push(entry);
  }

  return result;
}

export async function fetchClientIpInfo(): Promise<{ ip: string; ipHash: string }> {
  if (cachedIpHash) {
    return { ip: 'current', ipHash: cachedIpHash };
  }

  try {
    const res = await fetch('/api/ip');
    if (res.ok) {
      const data = await res.json();
      if (data.ipHash) {
        cachedIpHash = data.ipHash;
        return { ip: data.ip || 'current', ipHash: data.ipHash };
      }
    }
  } catch {
    // API failed, fallback to public IP or local token
  }

  try {
    // Fallback: fetch public IP and generate local hash
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      const ip = data.ip || '127.0.0.1';
      // Simple client-side hash
      let hash = 0;
      for (let i = 0; i < ip.length; i++) {
        hash = (hash << 5) - hash + ip.charCodeAt(i);
        hash |= 0;
      }
      const hashStr = Math.abs(hash).toString(16).padStart(12, '0');
      cachedIpHash = `ip_${hashStr}`;
      return { ip, ipHash: cachedIpHash };
    }
  } catch {
    // Device fallback
  }

  // Persistent device ID fallback
  let deviceId = localStorage.getItem('gtd_device_ip_id');
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).substring(2, 14)}`;
    localStorage.setItem('gtd_device_ip_id', deviceId);
  }
  cachedIpHash = deviceId;
  return { ip: 'device', ipHash: deviceId };
}

export async function getRegisteredNameForCurrentIp(): Promise<string | null> {
  if (cachedRegisteredName) {
    return cachedRegisteredName;
  }

  try {
    const res = await fetch('/api/leaderboard/ip-status');
    if (res.ok) {
      const data = await res.json();
      if (data.registeredName) {
        cachedRegisteredName = data.registeredName;
        return data.registeredName;
      }
    }
  } catch {
    // Fallback to Firestore
  }

  try {
    const { ipHash } = await fetchClientIpInfo();
    const docRef = doc(db, COLLECTION_IP_PLAYERS, ipHash);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const name = snap.data().playerName || null;
      cachedRegisteredName = name;
      return name;
    }

    // Check leaderboard docs
    const q = query(collection(db, COLLECTION_NAME), where('ipHash', '==', ipHash), limit(1));
    const lSnap = await getDocs(q);
    if (!lSnap.empty) {
      const name = lSnap.docs[0].data().playerName || null;
      cachedRegisteredName = name;
      return name;
    }
  } catch {
    // Ignore fallback errors
  }

  return null;
}

export async function fetchGlobalLeaderboard(modeFilter?: GameMode | 'all'): Promise<LeaderboardEntry[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    let q;

    if (modeFilter && modeFilter !== 'all') {
      q = query(colRef, where('mode', '==', modeFilter), orderBy('score', 'desc'), limit(100));
    } else {
      q = query(colRef, orderBy('score', 'desc'), limit(100));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const local = getLocalLeaderboard();
      const filtered = modeFilter && modeFilter !== 'all'
        ? local.filter((e) => e.mode === modeFilter)
        : local;
      return deduplicateLeaderboardEntries(filtered);
    }

    const rawEntries: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>;
      return {
        id: docSnap.id,
        playerName: data.playerName || 'Anonymous',
        score: Number(data.score) || 0,
        mode: (data.mode as GameMode) || 'endless',
        levelId: data.levelId ? Number(data.levelId) : undefined,
        timeSurvived: Number(data.timeSurvived) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        skinId: data.skinId || 'chrome',
        ipHash: data.ipHash || undefined,
      };
    });

    return deduplicateLeaderboardEntries(rawEntries);
  } catch (err) {
    console.warn('Firestore fetch leaderboard failed, using local storage cache:', err);
    const local = getLocalLeaderboard();
    const filtered = modeFilter && modeFilter !== 'all'
      ? local.filter((e) => e.mode === modeFilter)
      : local;
    return deduplicateLeaderboardEntries(filtered);
  }
}

export interface SubmissionError extends Error {
  code?: string;
  registeredName?: string;
}

export async function submitGlobalScore(entry: Omit<LeaderboardEntry, 'id' | 'date'>): Promise<{ rank: number; entry: LeaderboardEntry }> {
  const dateStr = new Date().toISOString().split('T')[0];
  const createdAtStr = new Date().toISOString();
  const normalizedName = entry.playerName ? entry.playerName.trim().toLowerCase() : '';

  // 1. First try submitting via server backend API (which authoritatively validates client IP)
  try {
    const res = await fetch('/api/leaderboard/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403 || data.error === 'IP_NAME_MISMATCH') {
        const error: SubmissionError = new Error(
          data.message || `This IP address is already linked to player "${data.registeredName}". Only one username per IP is allowed on the global leaderboard.`
        );
        error.code = 'IP_NAME_MISMATCH';
        error.registeredName = data.registeredName;
        throw error;
      }
      throw new Error(data.message || 'Server rejected score submission');
    }

    if (data.success && data.entry) {
      cachedRegisteredName = entry.playerName.trim();
      addLocalEntry(entry);
      return { rank: data.rank || 1, entry: data.entry };
    }
  } catch (err: any) {
    // If it's the explicit IP mismatch error, rethrow immediately!
    if (err.code === 'IP_NAME_MISMATCH') {
      throw err;
    }
    console.warn('Backend API submission failed or offline, falling back to direct Firestore verification:', err);
  }

  // 2. Direct Firestore fallback with IP-to-Username locking
  const localRes = addLocalEntry(entry);

  try {
    const { ipHash } = await fetchClientIpInfo();

    // Check IP registration in ip_players collection
    const ipDocRef = doc(db, COLLECTION_IP_PLAYERS, ipHash);
    const ipSnap = await getDoc(ipDocRef);

    let registeredName: string | null = null;
    if (ipSnap.exists()) {
      registeredName = ipSnap.data().playerName;
    } else {
      const qIp = query(collection(db, COLLECTION_NAME), where('ipHash', '==', ipHash), limit(1));
      const snapIp = await getDocs(qIp);
      if (!snapIp.empty) {
        registeredName = snapIp.docs[0].data().playerName;
      }
    }

    // Enforce single player name per IP
    if (registeredName && registeredName.trim().toLowerCase() !== normalizedName) {
      const error: SubmissionError = new Error(
        `This IP address is already registered to player "${registeredName}". You can only post under "${registeredName}" on the global leaderboard.`
      );
      error.code = 'IP_NAME_MISMATCH';
      error.registeredName = registeredName;
      throw error;
    }

    // Register / update IP binding in Firestore
    await setDoc(
      ipDocRef,
      {
        ipHash,
        playerName: entry.playerName.trim(),
        playerNameLower: normalizedName,
        updatedAt: createdAtStr,
        ...(ipSnap.exists() ? {} : { createdAt: createdAtStr }),
      },
      { merge: true }
    );
    cachedRegisteredName = entry.playerName.trim();

    // Save score in leaderboard collection
    const colRef = collection(db, COLLECTION_NAME);
    let docRefId = '';
    let isUpdate = false;
    let shouldSave = true;

    try {
      const existingQuery = query(
        colRef,
        where('playerNameLower', '==', normalizedName),
        where('mode', '==', entry.mode)
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        const existingDoc = existingSnap.docs[0];
        const existingData = existingDoc.data();
        const existingScore = Number(existingData.score) || 0;

        if (entry.score > existingScore) {
          docRefId = existingDoc.id;
          isUpdate = true;
        } else {
          shouldSave = false;
          docRefId = existingDoc.id;
        }
      }
    } catch {
      // Query fallback
    }

    const docData = {
      playerName: entry.playerName.trim(),
      playerNameLower: normalizedName,
      ipHash,
      score: entry.score,
      mode: entry.mode,
      levelId: entry.levelId || null,
      timeSurvived: entry.timeSurvived,
      skinId: entry.skinId,
      date: dateStr,
      createdAt: createdAtStr,
    };

    if (shouldSave) {
      if (isUpdate && docRefId) {
        await setDoc(doc(db, COLLECTION_NAME, docRefId), docData, { merge: true });
      } else {
        const newDoc = await addDoc(colRef, docData);
        docRefId = newDoc.id;
      }
    }

    // Fetch deduplicated list to get accurate rank
    const globalEntries = await fetchGlobalLeaderboard(entry.mode);
    const userIndex = globalEntries.findIndex(
      (e) => e.playerName.trim().toLowerCase() === normalizedName
    );
    const rank = userIndex !== -1 ? userIndex + 1 : localRes.rank;

    const finalEntry: LeaderboardEntry = {
      id: docRefId || `lb_${Date.now()}`,
      ...entry,
      ipHash,
      date: dateStr,
    };

    return { rank, entry: finalEntry };
  } catch (err: any) {
    if (err.code === 'IP_NAME_MISMATCH') {
      throw err;
    }

    console.warn('Firestore score submission failed, saved locally:', err);
    const localEntry: LeaderboardEntry = {
      id: `local_${Date.now()}`,
      ...entry,
      date: dateStr,
    };
    return { rank: localRes.rank, entry: localEntry };
  }
}

export async function shareScoreCard(
  playerName: string,
  score: number,
  rank: number,
  mode: string,
  timeSurvived: number
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const appUrl = window.location.href;
  const shareText = `🏆 I scored ${score.toLocaleString()} pts (Rank #${rank} Global) in Gravity Tilt Deck! Mode: ${mode.toUpperCase()}, Survived: ${timeSurvived}s. Can you beat me? 📱 Play now: ${appUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Gravity Tilt Deck High Score',
        text: shareText,
        url: appUrl,
      });
      return { success: true, method: 'native' };
    } catch {
      // User cancelled share dialog or unsupported fallback
    }
  }

  // Fallback to Clipboard API
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'clipboard' };
  }
}
