import { Language } from '../i18n/types';
import { LockResult } from '../types';

export async function explainLock(result: LockResult, language: Language): Promise<string> {
  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzle: { worldTitle: `lock.${result.type}.name`, examples: [], expectedRuleDescription: result.ruleDescription },
        userSubmittedAnswer: result.cracked ? 'Correct' : 'Incorrect',
        language,
      }),
    });
    const data = await res.json();
    return data.explanation || result.ruleDescription;
  } catch {
    return result.ruleDescription;
  }
}
