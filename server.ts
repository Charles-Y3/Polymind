import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {createServer as createViteServer} from 'vite';
import {initializeApp, getApps} from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {GoogleGenAI, Type} from '@google/genai';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// ---------------------------------------------------------------------------
// Firebase / Firestore — shared across all games (reflexes' original backend)
// ---------------------------------------------------------------------------
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId || '(default)');

const COLLECTION_LEADERBOARD = 'leaderboard';
const COLLECTION_IP_PLAYERS = 'ip_players';

function getClientIpAndHash(req: express.Request): {clientIp: string; ipHash: string} {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = '';
  if (typeof forwarded === 'string') {
    rawIp = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';
  }
  rawIp = rawIp.replace(/^::ffff:/, '');
  if (rawIp === '::1') rawIp = '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(rawIp.toLowerCase()).digest('hex').slice(0, 24);
  return {clientIp: rawIp, ipHash};
}

// ---------------------------------------------------------------------------
// Recall (choice-clash) file-based leaderboard
// ---------------------------------------------------------------------------
interface RecallLeaderboardEntry {
  id: string;
  ip: string;
  name: string;
  avatar: string;
  country: string;
  streak: number;
  xp: number;
  score: number;
  totalQuestions?: number;
  gameMode?: string;
  date: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const RECALL_LEADERBOARD_FILE = path.join(DATA_DIR, 'recall-leaderboard.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {recursive: true});
}

function loadRecallLeaderboard(): RecallLeaderboardEntry[] {
  try {
    if (fs.existsSync(RECALL_LEADERBOARD_FILE)) {
      return JSON.parse(fs.readFileSync(RECALL_LEADERBOARD_FILE, 'utf8')) || [];
    }
  } catch (err) {
    console.error('Error reading recall leaderboard file:', err);
  }
  return [];
}

function saveRecallLeaderboard(records: RecallLeaderboardEntry[]): void {
  try {
    fs.writeFileSync(RECALL_LEADERBOARD_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing recall leaderboard file:', err);
  }
}

function sanitizeRecallRecords(records: RecallLeaderboardEntry[]) {
  return records.map((r) => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    country: r.country,
    streak: r.streak,
    xp: r.xp,
    score: r.score,
    totalQuestions: r.totalQuestions,
    gameMode: r.gameMode,
    date: r.date,
  }));
}

// ---------------------------------------------------------------------------
// Gemini AI — server-key proxy (logic) + client-key proxy (recall)
// ---------------------------------------------------------------------------
const AI_MODEL = 'gemini-3.7-flash';

let serverAi: GoogleGenAI | null = null;
function getServerGeminiClient(): GoogleGenAI | null {
  if (!serverAi && process.env.GEMINI_API_KEY) {
    serverAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {headers: {'User-Agent': 'polymind-build'}},
    });
  }
  return serverAi;
}

function validatePersonalKey(
  req: express.Request
): {authorized: boolean; apiKey: string | null; error?: string; status?: number} {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
    return {authorized: true, apiKey: headerKey.trim()};
  }
  const bodyKey = req.body?.customApiKey;
  if (typeof bodyKey === 'string' && bodyKey.trim().length > 0) {
    return {authorized: true, apiKey: bodyKey.trim()};
  }
  return {
    authorized: false,
    apiKey: null,
    status: 401,
    error: 'Personal Gemini API Key is required. Please enter your API key in Settings to generate AI questions.',
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', true);
  app.use(express.json());

  // -- Health -----------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({status: 'ok'});
  });

  // -- Shared identity (IP hash) -----------------------------------------
  app.get('/api/ip', (req, res) => {
    const {clientIp, ipHash} = getClientIpAndHash(req);
    res.json({ip: clientIp, ipHash});
  });

  // -- Firestore leaderboard (reflexes today; game-aware going forward) --
  app.get('/api/leaderboard/ip-status', async (req, res) => {
    try {
      const {ipHash} = getClientIpAndHash(req);
      const ipDocRef = doc(db, COLLECTION_IP_PLAYERS, ipHash);
      const ipSnap = await getDoc(ipDocRef);
      if (ipSnap.exists()) {
        const data = ipSnap.data();
        return res.json({registeredName: data.playerName || null, ipHash});
      }
      const q = query(collection(db, COLLECTION_LEADERBOARD), where('ipHash', '==', ipHash), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return res.json({registeredName: data.playerName || null, ipHash});
      }
      return res.json({registeredName: null, ipHash});
    } catch (err: any) {
      console.warn('Error checking IP status:', err);
      return res.json({registeredName: null, error: err.message});
    }
  });

  app.post('/api/leaderboard/submit', async (req, res) => {
    try {
      const {clientIp, ipHash} = getClientIpAndHash(req);
      const {playerName, score, mode, game, levelId, timeSurvived, skinId} = req.body;

      if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
        return res.status(400).json({error: 'INVALID_NAME', message: 'Player name is required.'});
      }

      const trimmedName = playerName.trim();
      const normalizedName = trimmedName.toLowerCase();
      const numScore = Number(score) || 0;
      const gameMode = mode || 'endless';
      const gameId = game || 'reflexes';
      const dateStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      const ipDocRef = doc(db, COLLECTION_IP_PLAYERS, ipHash);
      const ipSnap = await getDoc(ipDocRef);

      let registeredName: string | null = null;
      if (ipSnap.exists()) {
        registeredName = ipSnap.data().playerName;
      } else {
        const qIp = query(collection(db, COLLECTION_LEADERBOARD), where('ipHash', '==', ipHash), limit(1));
        const snapIp = await getDocs(qIp);
        if (!snapIp.empty) {
          registeredName = snapIp.docs[0].data().playerName;
        }
      }

      if (registeredName && registeredName.trim().toLowerCase() !== normalizedName) {
        return res.status(403).json({
          error: 'IP_NAME_MISMATCH',
          registeredName,
          message: `This IP address is already registered to player "${registeredName}". You can only post under "${registeredName}" on the global leaderboard.`,
        });
      }

      await setDoc(
        ipDocRef,
        {
          ipHash,
          playerName: trimmedName,
          playerNameLower: normalizedName,
          updatedAt: nowIso,
          ...(ipSnap.exists() ? {} : {createdAt: nowIso}),
        },
        {merge: true}
      );

      const colRef = collection(db, COLLECTION_LEADERBOARD);
      let docRefId = '';
      let isUpdate = false;
      let shouldSave = true;

      const existingQuery = query(
        colRef,
        where('playerNameLower', '==', normalizedName),
        where('mode', '==', gameMode),
        where('game', '==', gameId)
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        const existingDoc = existingSnap.docs[0];
        const existingScore = Number(existingDoc.data().score) || 0;
        if (numScore > existingScore) {
          docRefId = existingDoc.id;
          isUpdate = true;
        } else {
          shouldSave = false;
          docRefId = existingDoc.id;
        }
      }

      const docData = {
        playerName: trimmedName,
        playerNameLower: normalizedName,
        ipHash,
        score: numScore,
        mode: gameMode,
        game: gameId,
        levelId: levelId || null,
        timeSurvived: Number(timeSurvived) || 0,
        skinId: skinId || 'chrome',
        date: dateStr,
        createdAt: nowIso,
      };

      if (shouldSave) {
        if (isUpdate && docRefId) {
          await setDoc(doc(db, COLLECTION_LEADERBOARD, docRefId), docData, {merge: true});
        } else {
          const newDoc = await addDoc(colRef, docData);
          docRefId = newDoc.id;
        }
      }

      const allModeQuery = query(
        colRef,
        where('mode', '==', gameMode),
        where('game', '==', gameId),
        orderBy('score', 'desc'),
        limit(100)
      );
      const modeSnap = await getDocs(allModeQuery);

      const rankMap = new Map<string, number>();
      const ipSeen = new Set<string>();
      let rank = 1;
      let userRank = 1;

      for (const d of modeSnap.docs) {
        const dData = d.data();
        const pKey = (dData.playerNameLower || dData.playerName || '').toLowerCase();
        const dIp = dData.ipHash || '';
        if (!pKey) continue;
        if (dIp && ipSeen.has(dIp) && !rankMap.has(pKey)) continue;
        if (!rankMap.has(pKey)) {
          rankMap.set(pKey, rank);
          if (dIp) ipSeen.add(dIp);
          if (pKey === normalizedName) userRank = rank;
          rank++;
        }
      }

      return res.json({
        success: true,
        rank: userRank,
        entry: {
          id: docRefId || `lb_${Date.now()}`,
          playerName: trimmedName,
          score: numScore,
          mode: gameMode,
          game: gameId,
          levelId,
          timeSurvived: Number(timeSurvived) || 0,
          skinId: skinId || 'chrome',
          date: dateStr,
        },
      });
    } catch (err: any) {
      console.error('Leaderboard submission error:', err);
      return res.status(500).json({error: 'SERVER_ERROR', message: err.message || 'Failed to submit score.'});
    }
  });

  // -- Recall (choice-clash) file-based leaderboard ----------------------
  app.get('/api/leaderboard', (_req, res) => {
    try {
      const records = loadRecallLeaderboard();
      res.json({records: sanitizeRecallRecords(records)});
    } catch (err) {
      console.error('Error fetching recall leaderboard:', err);
      res.status(500).json({error: 'Failed to load leaderboard'});
    }
  });

  app.post('/api/leaderboard', (req, res) => {
    try {
      const {clientIp} = getClientIpAndHash(req);
      const {name, avatar = '🧠', country = '🌐', streak = 0, xp = 0, score = 0, totalQuestions, gameMode, date} =
        req.body || {};

      const cleanName = typeof name === 'string' && name.trim() ? name.trim() : 'Challenger';
      const normalizedName = cleanName.toLowerCase();
      const existingRecords = loadRecallLeaderboard();

      const matchedIndices: number[] = [];
      existingRecords.forEach((rec, idx) => {
        const isSameIp = rec.ip === clientIp;
        const isSameName = rec.name.trim().toLowerCase() === normalizedName;
        if (isSameIp || isSameName) matchedIndices.push(idx);
      });

      let bestStreak = Number(streak) || 0;
      let bestXp = Number(xp) || 0;
      let bestScore = Number(score) || 0;
      let bestTotalQuestions = Number(totalQuestions) || 0;
      let finalId = `user_${Date.now()}`;
      const finalDate = date || new Date().toISOString();

      matchedIndices.forEach((idx) => {
        const matched = existingRecords[idx];
        if (matched.streak > bestStreak) bestStreak = matched.streak;
        if (matched.xp > bestXp) bestXp = matched.xp;
        if (matched.score > bestScore) bestScore = matched.score;
        if ((matched.totalQuestions || 0) > bestTotalQuestions) bestTotalQuestions = matched.totalQuestions || 0;
        finalId = matched.id || finalId;
      });

      const remainingRecords = existingRecords.filter((_, idx) => !matchedIndices.includes(idx));

      const updatedEntry: RecallLeaderboardEntry = {
        id: finalId,
        ip: clientIp,
        name: cleanName,
        avatar,
        country,
        streak: bestStreak,
        xp: bestXp,
        score: bestScore,
        totalQuestions: bestTotalQuestions,
        gameMode: gameMode || 'endless',
        date: finalDate,
        updatedAt: new Date().toISOString(),
      };

      const newRecords = [updatedEntry, ...remainingRecords];
      saveRecallLeaderboard(newRecords);

      return res.json({
        success: true,
        record: sanitizeRecallRecords([updatedEntry])[0],
        records: sanitizeRecallRecords(newRecords),
      });
    } catch (err) {
      console.error('Error saving recall leaderboard record:', err);
      res.status(500).json({error: 'Failed to update leaderboard record'});
    }
  });

  // -- Logic (machine-mind) AI proxy — server-side key --------------------
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const {puzzle, userSubmittedAnswer, language = 'en'} = req.body;
      const client = getServerGeminiClient();

      let langInstruction = 'Respond in English.';
      if (language === 'zh-CN') langInstruction = '请用简体中文回答。';
      else if (language === 'zh-TW') langInstruction = '請用繁體中文（台灣/香港用語）回答。';

      if (!client) {
        const defaultExplanations: Record<string, string> = {
          en: 'The lock follows a consistent rule from input to output. Study how each example transforms, step by step — the same logic unlocks the rest.',
          'zh-CN': '这把锁的规则从输入到输出始终一致。仔细研究每个范例的转换过程——同样的逻辑能帮你破解剩下的部分。',
          'zh-TW': '這把鎖的規則從輸入到輸出始終一致。仔細研究每個範例的轉換過程——同樣的邏輯能幫你破解剩下的部分。',
        };
        return res.json({success: true, explanation: defaultExplanations[language] || defaultExplanations.en});
      }

      const prompt = `You are "The Architect", a former vault engineer turned mentor in the heist game "Logic Lock" (part of Polymind).
Explain the logic rule for this lock clearly and concisely (2-3 sentences max).
${langInstruction}

Lock Info:
Type: ${puzzle?.worldTitle || 'Lock'}
Examples: ${JSON.stringify(puzzle?.examples || [])}
Rule / Formula: ${puzzle?.expectedRuleDescription || 'Hidden Rule'}
Player Answer/Attempt: ${JSON.stringify(userSubmittedAnswer || 'Correct')}

Provide an encouraging, clear "Aha!" breakdown explaining WHY the rule works. Speak like a sharp, dryly witty ex-safecracker mentoring the player.`;

      const response = await client.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {temperature: 0.7},
      });

      res.json({
        success: true,
        explanation:
          response.text ||
          (language === 'zh-CN'
            ? '每一道转换都遵循严谨的逻辑规律。继续探索！'
            : language === 'zh-TW'
              ? '每一道轉換都遵循嚴謹的邏輯規律。繼續探索！'
              : 'Every transformation follows a consistent logical law. Keep testing!'),
      });
    } catch (error: any) {
      console.error('AI Explain Error:', error);
      res.json({
        success: true,
        explanation: 'The machine operates on a consistent rule across all examples. Examine the difference between inputs and outputs!',
      });
    }
  });

  app.post('/api/ai/analyze-mistake', async (req, res) => {
    try {
      const client = getServerGeminiClient();
      const {puzzle, userSubmittedAnswer, language = 'en'} = req.body;

      let langInstruction = 'Respond in English.';
      if (language === 'zh-CN') langInstruction = '请用简体中文回答。';
      else if (language === 'zh-TW') langInstruction = '请用繁体中文回答。';

      if (!client) {
        const defaultMistakes: Record<string, string> = {
          en: "That combination didn't fit. Compare how the rule behaves on the first example versus the second — the mismatch is there.",
          'zh-CN': '这个组合不吻合。请对比该规则在第一个范例与第二个范例中的表现——差异就在其中。',
          'zh-TW': '這個組合不吻合。請對比該規則在第一個範例與第二個範例中的表現——差異就在其中。',
        };
        return res.json({success: true, feedback: defaultMistakes[language] || defaultMistakes.en});
      }

      const prompt = `The player made an incorrect guess while cracking a lock in Logic Lock.
${langInstruction}
Puzzle Examples: ${JSON.stringify(puzzle?.examples)}
Expected Rule: ${puzzle?.expectedRuleDescription}
Player's Attempt: ${JSON.stringify(userSubmittedAnswer)}

Identify specifically where their hypothesis fails on one of the examples. Give a subtle nudge (1-2 sentences) without directly spoiling the full solution.`;

      const response = await client.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {temperature: 0.6},
      });

      res.json({
        success: true,
        feedback: response.text || 'Your attempt fits some examples, but check if it works for all input-output pairs!',
      });
    } catch (error: any) {
      console.error('AI Mistake Diagnosis Error:', error);
      res.json({
        success: true,
        feedback: 'Your rule works for some cases, but fails on others. Check all examples carefully!',
      });
    }
  });

  // -- Recall (choice-clash) AI proxy — client-supplied key ---------------
  app.post('/api/test-key', async (req, res) => {
    try {
      const access = validatePersonalKey(req);
      if (!access.authorized || !access.apiKey) {
        return res.status(access.status || 400).json({valid: false, error: access.error});
      }
      const ai = new GoogleGenAI({apiKey: access.apiKey, httpOptions: {headers: {'User-Agent': 'polymind-build'}}});
      const response = await ai.models.generateContent({model: AI_MODEL, contents: 'Test ping. Reply with only the word "READY".'});
      if (response.text) {
        return res.json({valid: true, message: 'Connection verified and working perfectly!'});
      }
      return res.status(400).json({valid: false, error: 'Unable to verify connection. Please check your credentials.'});
    } catch (err: unknown) {
      console.error('API verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials or quota exceeded';
      return res.status(400).json({valid: false, error: errorMessage});
    }
  });

  app.post('/api/generate-questions', async (req, res) => {
    try {
      const access = validatePersonalKey(req);
      if (!access.authorized || !access.apiKey) {
        return res.status(access.status || 401).json({error: access.error});
      }

      const {category = 'mixed', count = 10, difficulty = 3, ageTier = 'teen', topic} = req.body;
      const ai = new GoogleGenAI({apiKey: access.apiKey, httpOptions: {headers: {'User-Agent': 'polymind-build'}}});

      const prompt = `You are a fact-checking quiz creator for a casual comparison game named "Choice Clash".
Generate exactly ${count} fascinating, diverse, 100% accurate factual comparison questions.
${topic ? `Focus on the specific subtopic: "${topic}".` : ''}
Category: ${category}
Target Audience: ${ageTier} (kids=fun/visual 8-12, teen=science/history 13-17, adult=hard/deceptive 18+)
Target Difficulty Level (1=easy, 2=interesting, 3=tricky, 4=expert, 5=deceptive/counter-intuitive): ${difficulty}

Each question compares two items (Option A and Option B) on a single quantitative or temporal dimension (e.g. size, weight, height, speed, age, distance, temperature, population, quantity, time, historical timeline).

Ensure:
1. Generate all ${count} complete questions without truncation.
2. Exact accuracy with precise values.
3. Short, fascinating explanation.
4. Engaging "funFact".
5. Multi-language support with translations for English, Simplified Chinese (ZhSimp), and Traditional Chinese (ZhTrad).

Output JSON matching this exact structure for each question.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {type: Type.STRING},
                category: {type: Type.STRING},
                difficulty: {type: Type.NUMBER},
                questionType: {type: Type.STRING},
                questionText: {type: Type.STRING},
                questionTextZhSimp: {type: Type.STRING},
                questionTextZhTrad: {type: Type.STRING},
                optionA: {
                  type: Type.OBJECT,
                  properties: {
                    id: {type: Type.STRING},
                    name: {type: Type.STRING},
                    nameZhSimp: {type: Type.STRING},
                    nameZhTrad: {type: Type.STRING},
                    emoji: {type: Type.STRING},
                    valueDisplay: {type: Type.STRING},
                    numericValue: {type: Type.NUMBER},
                    unit: {type: Type.STRING},
                  },
                  required: ['id', 'name', 'emoji', 'valueDisplay', 'numericValue', 'unit'],
                },
                optionB: {
                  type: Type.OBJECT,
                  properties: {
                    id: {type: Type.STRING},
                    name: {type: Type.STRING},
                    nameZhSimp: {type: Type.STRING},
                    nameZhTrad: {type: Type.STRING},
                    emoji: {type: Type.STRING},
                    valueDisplay: {type: Type.STRING},
                    numericValue: {type: Type.NUMBER},
                    unit: {type: Type.STRING},
                  },
                  required: ['id', 'name', 'emoji', 'valueDisplay', 'numericValue', 'unit'],
                },
                correctOptionId: {type: Type.STRING},
                explanation: {type: Type.STRING},
                explanationZhSimp: {type: Type.STRING},
                explanationZhTrad: {type: Type.STRING},
                funFact: {type: Type.STRING},
                funFactZhSimp: {type: Type.STRING},
                funFactZhTrad: {type: Type.STRING},
                isDeceptive: {type: Type.BOOLEAN},
              },
              required: ['id', 'category', 'difficulty', 'questionType', 'questionText', 'optionA', 'optionB', 'correctOptionId', 'explanation', 'funFact'],
            },
          },
        },
      });

      const questions = JSON.parse(response.text || '[]');
      res.json({questions});
    } catch (err: unknown) {
      console.error('Error generating questions with Gemini:', err);
      res.status(500).json({error: err instanceof Error ? err.message : 'Failed to generate questions'});
    }
  });

  app.post('/api/deep-dive', async (req, res) => {
    try {
      const access = validatePersonalKey(req);
      if (!access.authorized || !access.apiKey) {
        return res.status(access.status || 401).json({error: access.error});
      }
      const {itemA, itemB, questionText, explanation} = req.body;
      const ai = new GoogleGenAI({apiKey: access.apiKey, httpOptions: {headers: {'User-Agent': 'polymind-build'}}});

      const prompt = `Give a short, fascinating, 3-paragraph educational deep dive into the comparison between "${itemA}" and "${itemB}" regarding "${questionText}".
Context: ${explanation}.
Format with clean bullet points and bold key numbers. Keep it crisp, entertaining, and educational.`;

      const response = await ai.models.generateContent({model: AI_MODEL, contents: prompt});
      res.json({deepDiveText: response.text});
    } catch (err: unknown) {
      console.error('Error fetching deep dive from Gemini:', err);
      res.status(500).json({error: err instanceof Error ? err.message : 'Failed to fetch deep dive'});
    }
  });

  // -- Vite middleware (dev) / static (prod) ------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({server: {middlewareMode: true}, appType: 'spa'});
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Polymind server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
