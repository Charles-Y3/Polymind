import { GameMode, LevelConfig } from '../types';

// Campaign stars: clearing the stage (surviving to targetTime) earns the
// baseline 1 star. Score beyond that - mostly from grabbing the score
// multiplier powerup and staying alive with it active - pushes it to 2 or 3.
// Falling before targetTime never earns stars, no matter the score, since
// the stage wasn't actually cleared.
export function calculateStars(
  score: number,
  timeSurvived: number,
  level: LevelConfig,
  gameMode: GameMode
): number {
  if (gameMode !== 'campaign') return 0;
  if (timeSurvived < level.targetTime) return 0;
  if (score >= level.starScores[1]) return 3;
  if (score >= level.starScores[0]) return 2;
  return 1;
}
