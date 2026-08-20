export type GameMode = 'campaign' | 'endless' | 'zen';

export type PlatformShape = 'rectangle' | 'circle' | 'hexagon' | 'floating_deck' | 'cross';

export type PlatformTheme = 'wooden' | 'cyber' | 'volcano' | 'space' | 'laboratory' | 'neon';

export type PowerUpType = 
  | 'shield' 
  | 'anchor' 
  | 'slow_mo' 
  | 'blast' 
  | 'magnet' 
  | 'shrink' 
  | 'score_multiplier' 
  | 'safety_net';

export type ObstacleType = 
  | 'comet' 
  | 'shockwave' 
  | 'laser_beam' 
  | 'seeker' 
  | 'anvil' 
  | 'bumper' 
  | 'piston';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  mass: number;
  baseMass: number;
  rotation: number;
  vRot: number;
  isAnchored: boolean;
  hasShield: boolean;
  shieldHp: number;
  isMagnetized: boolean;
  hasSafetyNet: boolean;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  // Laser beam properties
  angle?: number;
  length?: number;
  angularVelocity?: number;
  width?: number;
  // Shockwave/Anvil properties
  targetX?: number;
  targetY?: number;
  timer?: number;
  maxTimer?: number;
  active?: boolean;
  impactRadius?: number;
  // Seeker properties
  speed?: number;
  // General life
  hp?: number;
  maxHp?: number;
  warningTime?: number;
}

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  duration: number; // Duration of effect in ms
  timer: number; // Despawn timer on ground in seconds
  spawnTime: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  duration: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  theme: PlatformTheme;
  shape: PlatformShape;
  platformWidth: number;
  platformHeight: number;
  hasWalls: boolean;
  targetTime: number; // Seconds to survive to clear the stage (earns 1 star)
  starScores: [number, number]; // score thresholds for [2 stars, 3 stars] once cleared
  allowedObstacles: ObstacleType[];
  spawnInterval: number; // Interval between obstacle waves in ms
  powerUpInterval: number;
  unlockedByDefault?: boolean;
  description: string;
}

export interface BallSkin {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  glowColor: string;
  trailType: 'sparkle' | 'neon' | 'fire' | 'rainbow' | 'smoke' | 'none';
  unlockCriteria: string;
  isUnlocked: boolean;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  levelId?: number;
  timeSurvived: number; // seconds
  date: string;
  skinId: string;
  ipHash?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  totalTimeSurvived: number;
  highestScore: number;
  totalObstaclesDodged: number;
  totalPowerUpsCollected: number;
  starsEarned: Record<number, number>; // levelId -> stars (1-3)
  unlockedSkins: string[];
  currentSkinId: string;
  playerName: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  sensitivity: number; // 0.5 to 2.0
  invertX: boolean;
  invertY: boolean;
  controlMode: 'sensor' | 'touch' | 'hybrid';
  hasCalibrated?: boolean;
  selectedStarterPowerUp?: PowerUpType | 'none' | 'random';
  language?: 'en' | 'zh-CN' | 'zh-TW';
}

export type PassiveBoostType = 
  | 'powerup_duration' 
  | 'tilt_control' 
  | 'extra_shield_hp' 
  | 'combo_rate' 
  | 'score_bonus' 
  | 'recovery_force';

export interface PassiveBoost {
  type: PassiveBoostType;
  title: string;
  description: string;
  value: number;
}

export interface ActivePassiveBoosts {
  powerUpDurationMult: number; // e.g. 1.15
  tiltControlMult: number;     // e.g. 1.15
  extraShieldHp: number;       // e.g. +1
  comboRateMult: number;       // e.g. 1.25
  scoreBonusMult: number;      // e.g. 1.15
  recoveryForceMult: number;   // e.g. 1.20
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardSkinId?: string;
  passiveBoost: PassiveBoost;
}
