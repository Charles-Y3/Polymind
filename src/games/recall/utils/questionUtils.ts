import { Question } from '../types';

/**
 * Randomizes option order for a list of questions so that the correct answer
 * is not always option A or the top option.
 */
export function shuffleQuestionOptions(questions: Question[]): Question[] {
  return questions.map((q) => {
    // 50% probability to swap optionA and optionB
    const shouldSwap = Math.random() < 0.5;
    if (!shouldSwap) {
      return { ...q };
    }

    const newOptionA = { ...q.optionB, id: 'A' };
    const newOptionB = { ...q.optionA, id: 'B' };
    const newCorrectOptionId: 'A' | 'B' = q.correctOptionId === 'A' ? 'B' : 'A';

    return {
      ...q,
      optionA: newOptionA,
      optionB: newOptionB,
      correctOptionId: newCorrectOptionId,
    };
  });
}
