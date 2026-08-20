import React, { useEffect, useRef } from 'react';
import { 
  Ball, 
  Obstacle, 
  PowerUpItem, 
  Particle, 
  FloatingText, 
  LevelConfig, 
  GameMode, 
  ActivePowerUp, 
  PowerUpType, 
  Vector2D,
  ActivePassiveBoosts
} from '../types';
import { soundManager } from '../utils/sound';
import { BALL_SKINS } from '../data/skins';

interface PhysicsCanvasProps {
  level: LevelConfig;
  gameMode: GameMode;
  skinId: string;
  sensitivity: number;
  invertX: boolean;
  invertY: boolean;
  tiltX: number; // -1 to +1 normalized or angle
  tiltY: number; // -1 to +1 normalized or angle
  isPaused: boolean;
  starterPowerUp?: PowerUpType | 'none' | 'random';
  unlockedStarterPowerUps?: PowerUpType[];
  passiveBoosts?: ActivePassiveBoosts;
  onGameOver: (score: number, timeSurvived: number, obstaclesDodged: number, powerupsCollected: number) => void;
  onScoreUpdate: (score: number, combo: number) => void;
  onActivePowerUpsChange: (active: ActivePowerUp[]) => void;
  onLivesChange: (lives: number) => void;
}

export const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({
  level,
  gameMode,
  skinId,
  sensitivity,
  invertX,
  invertY,
  tiltX,
  tiltY,
  isPaused,
  starterPowerUp = 'none',
  unlockedStarterPowerUps = [],
  passiveBoosts,
  onGameOver,
  onScoreUpdate,
  onActivePowerUpsChange,
  onLivesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state refs for performance without re-render lag
  const ballRef = useRef<Ball>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 18,
    baseRadius: 18,
    mass: 1.0,
    baseMass: 1.0,
    rotation: 0,
    vRot: 0,
    isAnchored: false,
    hasShield: false,
    shieldHp: 0,
    isMagnetized: false,
    hasSafetyNet: false,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeTimeRef = useRef<number>(0);
  const screenShakeIntensityRef = useRef<number>(0);

  const gameStatsRef = useRef({
    score: 0,
    timeSurvived: 0,
    obstaclesDodged: 0,
    powerupsCollected: 0,
    lives: 3,
    combo: 1,
    comboTimer: 0,
    isFalling: false,
    fallProgress: 0,
    lastObstacleSpawn: Date.now(),
    lastPowerUpSpawn: Date.now(),
    gameStartTime: Date.now(),
  });

  const skin = BALL_SKINS.find((s) => s.id === skinId) || BALL_SKINS[0];

  // Latest control values, read inside the animation loop via ref so the loop
  // itself never has to restart on every tilt sample (deviceorientation fires ~60Hz)
  const controlRef = useRef({ tiltX, tiltY, sensitivity, invertX, invertY });
  controlRef.current = { tiltX, tiltY, sensitivity, invertX, invertY };

  // Get current platform bounds based on actual canvas / phone screen dimensions
  const getPlatformBounds = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { pW: 190, pH: 340, cssW: 380, cssH: 680 };
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(rect.width || 380, 320);
    const cssH = Math.max(rect.height || 680, 500);

    if (level.shape === 'circle') {
      const r = Math.min(cssW, cssH) * 0.44;
      return { pW: r, pH: r, cssW, cssH };
    } else if (level.shape === 'hexagon') {
      const r = Math.min(cssW, cssH) * 0.44;
      return { pW: r, pH: r, cssW, cssH };
    } else if (level.shape === 'cross') {
      return { pW: cssW * 0.44, pH: cssH * 0.44, cssW, cssH };
    }

    // Full screen rectangle platform deck
    return { pW: (cssW / 2) - 10, pH: (cssH / 2) - 10, cssW, cssH };
  };

  // Initialize stage state
  useEffect(() => {
    ballRef.current = {
      x: 0, // centered relative to screen origin
      y: 0,
      vx: 0,
      vy: 0,
      radius: 18,
      baseRadius: 18,
      mass: 1.0,
      baseMass: 1.0,
      rotation: 0,
      vRot: 0,
      isAnchored: false,
      hasShield: false,
      shieldHp: 0,
      isMagnetized: false,
      hasSafetyNet: false,
    };

    obstaclesRef.current = [];
    powerUpsRef.current = [];
    activePowerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    gameStatsRef.current = {
      score: 0,
      timeSurvived: 0,
      obstaclesDodged: 0,
      powerupsCollected: 0,
      lives: 1, // Open phone screen deck: drop off edge = fall!
      combo: 1,
      comboTimer: 0,
      isFalling: false,
      fallProgress: 0,
      hasTriggeredGameOver: false,
      lastObstacleSpawn: Date.now(),
      lastPowerUpSpawn: Date.now(),
      gameStartTime: Date.now(),
    };

    onLivesChange(gameStatsRef.current.lives);
    onScoreUpdate(0, 1);
    onActivePowerUpsChange([]);

    // Trigger starter loadout powerup if chosen
    if (starterPowerUp && starterPowerUp !== 'none') {
      let chosenPowerUp: PowerUpType | null = null;
      if (starterPowerUp === 'random') {
        const pool = unlockedStarterPowerUps.length > 0
          ? unlockedStarterPowerUps
          : (['shield', 'anchor', 'magnet', 'slow_mo', 'score_multiplier', 'safety_net'] as PowerUpType[]);
        chosenPowerUp = pool[Math.floor(Math.random() * pool.length)];
      } else {
        chosenPowerUp = starterPowerUp as PowerUpType;
      }

      if (chosenPowerUp) {
        const pwr = chosenPowerUp;
        const timer = setTimeout(() => {
          applyPowerUp(pwr);
          addFloatingText(0, -35, `LOADOUT: ${pwr.replace('_', ' ').toUpperCase()}`, '#38bdf8');
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [level, gameMode, starterPowerUp, unlockedStarterPowerUps]);

  // Main 60 FPS Game Engine Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // cap frame delta
      lastTime = currentTime;

      if (!isPaused && !gameStatsRef.current.isFalling) {
        updatePhysics(dt);
      }

      if (gameStatsRef.current.isFalling) {
        updateFalling(dt);
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, level, skin]);

  // Helper: Add particle explosion
  const addExplosion = (x: number, y: number, color: string, count: number = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }
  };

  // Helper: Floating Text notification
  const addFloatingText = (x: number, y: number, text: string, color: string = '#facc15') => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -1.5,
    });
  };

  // Helper: Camera Screen Shake
  const triggerScreenShake = (duration: number = 0.3, intensity: number = 10) => {
    screenShakeTimeRef.current = duration;
    screenShakeIntensityRef.current = intensity;
  };

  // Helper: Spawn Obstacle Wave
  const spawnObstacle = () => {
    const allowed = level.allowedObstacles;
    if (allowed.length === 0) return;

    const type = allowed[Math.floor(Math.random() * allowed.length)];
    const { pW, pH } = getPlatformBounds();

    const id = `obs_${Date.now()}_${Math.random()}`;

    if (type === 'comet') {
      // Spawn comet from random edge angle aiming across platform
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = Math.max(pW, pH) + 80;
      const x = Math.cos(angle) * spawnDist;
      const y = Math.sin(angle) * spawnDist;

      // Target near center or current ball position
      const targetX = (Math.random() - 0.5) * pW * 0.8;
      const targetY = (Math.random() - 0.5) * pH * 0.8;

      const dirX = targetX - x;
      const dirY = targetY - y;
      const dist = Math.hypot(dirX, dirY) || 1;
      const speed = 120 + Math.random() * 100 + (gameStatsRef.current.timeSurvived * 2);

      obstaclesRef.current.push({
        id,
        type: 'comet',
        x,
        y,
        vx: (dirX / dist) * speed,
        vy: (dirY / dist) * speed,
        radius: 14 + Math.random() * 8,
        mass: 1.8,
        color: '#ef4444',
      });
    } else if (type === 'shockwave') {
      const targetX = (Math.random() - 0.5) * pW * 0.7;
      const targetY = (Math.random() - 0.5) * pH * 0.7;

      obstaclesRef.current.push({
        id,
        type: 'shockwave',
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        radius: 10,
        mass: 3.0,
        color: '#f97316',
        timer: 0,
        maxTimer: 1.2, // 1.2s warning before shockwave expands
        active: false,
        impactRadius: 100,
      });
      soundManager.playWarning();
    } else if (type === 'laser_beam') {
      const angle = Math.random() * Math.PI;
      obstaclesRef.current.push({
        id,
        type: 'laser_beam',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        mass: 0,
        color: '#ec4899',
        angle,
        length: Math.max(pW, pH) * 2.5,
        angularVelocity: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.2),
        width: 12,
        timer: 0,
        maxTimer: 4.5,
        active: false, // 1.0s warning telegraph before beam becomes active
      });
      soundManager.playWarning();
    } else if (type === 'seeker') {
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * (pW + 40);
      const y = Math.sin(angle) * (pH + 40);

      obstaclesRef.current.push({
        id,
        type: 'seeker',
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 12,
        mass: 1.2,
        color: '#a855f7',
        speed: 80 + Math.random() * 40,
        timer: 0,
        maxTimer: 8.0, // seeker despawns after 8s
      });
    } else if (type === 'anvil') {
      const ball = ballRef.current;
      obstaclesRef.current.push({
        id,
        type: 'anvil',
        x: ball.x + (Math.random() - 0.5) * 60,
        y: ball.y + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        radius: 26,
        mass: 5.0,
        color: '#64748b',
        targetX: ball.x,
        targetY: ball.y,
        timer: 0,
        maxTimer: 1.5,
        active: false,
      });
      soundManager.playWarning();
    } else if (type === 'bumper' || type === 'piston') {
      const x = (Math.random() - 0.5) * pW * 0.8;
      const y = (Math.random() - 0.5) * pH * 0.8;
      obstaclesRef.current.push({
        id,
        type,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 16,
        mass: 4.0,
        color: type === 'bumper' ? '#eab308' : '#38bdf8',
        timer: 0,
        maxTimer: 10.0,
      });
    }
  };

  // Helper: Spawn PowerUp Item
  const spawnPowerUp = () => {
    const types: PowerUpType[] = ['shield', 'anchor', 'slow_mo', 'blast', 'magnet', 'shrink', 'score_multiplier', 'safety_net'];
    const type = types[Math.floor(Math.random() * types.length)];

    const { pW, pH } = getPlatformBounds();

    powerUpsRef.current.push({
      id: `pwr_${Date.now()}_${Math.random()}`,
      type,
      x: (Math.random() - 0.5) * pW * 0.75,
      y: (Math.random() - 0.5) * pH * 0.75,
      radius: 15,
      duration: 8000,
      timer: 8.0, // 8 seconds before ground item despawns
      spawnTime: Date.now(),
    });
  };

  // Trigger Powerup Effect on Collect
  const applyPowerUp = (type: PowerUpType) => {
    const ball = ballRef.current;
    soundManager.playPowerUp();
    gameStatsRef.current.powerupsCollected += 1;

    const existingIdx = activePowerUpsRef.current.findIndex((p) => p.type === type);
    const durationMult = passiveBoosts?.powerUpDurationMult || 1.0;
    const baseDuration = type === 'shield' ? 12000 : 8000;
    const duration = Math.round(baseDuration * durationMult);
    const endTime = Date.now() + duration;

    if (existingIdx >= 0) {
      activePowerUpsRef.current[existingIdx].endTime = endTime;
    } else {
      activePowerUpsRef.current.push({ type, endTime, duration });
    }

    onActivePowerUpsChange([...activePowerUpsRef.current]);

    if (type === 'shield') {
      ball.hasShield = true;
      const extraShield = passiveBoosts?.extraShieldHp || 0;
      ball.shieldHp = 2 + extraShield;
      addFloatingText(ball.x, ball.y - 20, `SHIELD +${ball.shieldHp}`, '#38bdf8');
    } else if (type === 'anchor') {
      ball.isAnchored = true;
      ball.mass = ball.baseMass * 3.5;
      addFloatingText(ball.x, ball.y - 20, 'HEAVY ANCHOR', '#eab308');
    } else if (type === 'shrink') {
      ball.radius = ball.baseRadius * 0.65;
      addFloatingText(ball.x, ball.y - 20, 'MICRO BALL', '#ec4899');
    } else if (type === 'blast') {
      // Repulsor EMP Blast: clears all nearby comets/seekers and pushes them away
      soundManager.playShockwave();
      addExplosion(ball.x, ball.y, '#38bdf8', 30);
      addFloatingText(ball.x, ball.y - 20, 'EMP BLAST!', '#38bdf8');

      obstaclesRef.current.forEach((obs) => {
        const dx = obs.x - ball.x;
        const dy = obs.y - ball.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 220) {
          obs.vx = (dx / dist) * 400;
          obs.vy = (dy / dist) * 400;
        }
      });
    } else if (type === 'magnet') {
      ball.isMagnetized = true;
      addFloatingText(ball.x, ball.y - 20, 'MAGNET CORE', '#a855f7');
    } else if (type === 'safety_net') {
      ball.hasSafetyNet = true;
      addFloatingText(ball.x, ball.y - 20, 'SAFETY NET ACTIVE!', '#22c55e');
    } else if (type === 'slow_mo') {
      addFloatingText(ball.x, ball.y - 20, 'SLOW-MO TIME', '#06b6d4');
    } else if (type === 'score_multiplier') {
      addFloatingText(ball.x, ball.y - 20, '2X SCORE BOOST', '#f59e0b');
    }
  };

  // Main physics update
  const updatePhysics = (dt: number) => {
    const ball = ballRef.current;
    const stats = gameStatsRef.current;
    const now = Date.now();

    // 1. Time Survived & Score tracking
    // Accumulated from the capped per-frame dt, not (now - gameStartTime):
    // a backgrounded tab/locked screen stops rAF but Date.now() keeps ticking,
    // so a wall-clock diff would instantly satisfy the stage-clear check the
    // moment the tab regains focus, firing a false victory mid-run.
    stats.timeSurvived += dt;

    // Check Campaign Target Time Completion
    if (
      gameMode === 'campaign' &&
      level.targetTime &&
      stats.timeSurvived >= level.targetTime &&
      !(stats as any).hasTriggeredGameOver
    ) {
      (stats as any).hasTriggeredGameOver = true;
      soundManager.stopRollSound();
      addFloatingText(0, -40, 'STAGE CLEAR! VICTORY!', '#38bdf8');
      setTimeout(() => {
        onGameOver(
          Math.floor(stats.score),
          Math.floor(stats.timeSurvived),
          stats.obstaclesDodged,
          stats.powerupsCollected
        );
      }, 400);
      return;
    }

    // Active powerups expiration check
    const hasSlowMo = activePowerUpsRef.current.some((p) => p.type === 'slow_mo');
    const hasMultiplier = activePowerUpsRef.current.some((p) => p.type === 'score_multiplier');

    // Filter expired active powerups
    const updatedActive = activePowerUpsRef.current.filter((p) => p.endTime > now);
    if (updatedActive.length !== activePowerUpsRef.current.length) {
      activePowerUpsRef.current = updatedActive;
      onActivePowerUpsChange([...updatedActive]);

      // Revert attributes if powerups expired
      if (!updatedActive.some((p) => p.type === 'anchor')) {
        ball.isAnchored = false;
        ball.mass = ball.baseMass;
      }
      if (!updatedActive.some((p) => p.type === 'shrink')) {
        ball.radius = ball.baseRadius;
      }
      if (!updatedActive.some((p) => p.type === 'magnet')) {
        ball.isMagnetized = false;
      }
      if (!updatedActive.some((p) => p.type === 'safety_net')) {
        ball.hasSafetyNet = false;
      }
      if (!updatedActive.some((p) => p.type === 'shield')) {
        ball.hasShield = false;
      }
    }

    // Score increment
    const scoreBoost = passiveBoosts?.scoreBonusMult || 1.0;
    const basePointsPerSec = 50 * (hasMultiplier ? 2 : 1) * stats.combo * scoreBoost;
    stats.score += basePointsPerSec * dt;
    if (stats.comboTimer > 0) {
      stats.comboTimer -= dt;
      if (stats.comboTimer <= 0) stats.combo = 1;
    }
    onScoreUpdate(Math.floor(stats.score), stats.combo);

    // 2. Spawn Obstacle Waves
    const timeFactor = Math.min(stats.timeSurvived / 60, 2.0); // accelerates over time
    const adjustedInterval = level.spawnInterval / (1 + timeFactor * 0.6);
    if (now - stats.lastObstacleSpawn > adjustedInterval) {
      spawnObstacle();
      stats.lastObstacleSpawn = now;
    }

    // 3. Spawn Powerups
    if (now - stats.lastPowerUpSpawn > level.powerUpInterval) {
      spawnPowerUp();
      stats.lastPowerUpSpawn = now;
    }

    // 4. Ball Physics Calculation based on Tilt
    const control = controlRef.current;
    const effectiveSensitivity = control.sensitivity * 0.95;
    const effX = control.invertX ? -control.tiltX : control.tiltX;
    const effY = control.invertY ? -control.tiltY : control.tiltY;

    // Tilt gravity acceleration
    const gravityForce = 520;
    const accelX = effX * effectiveSensitivity * gravityForce;
    const accelY = effY * effectiveSensitivity * gravityForce;

    // Mass dampening
    const invMass = 1 / ball.mass;
    ball.vx += accelX * invMass * dt;
    ball.vy += accelY * invMass * dt;

    // Friction & Air Resistance (Stabilizer Boost)
    // Tuned to reverse direction quickly on tilt reversal (matches the calibration test pad's feel)
    const stabilityBoost = passiveBoosts?.tiltControlMult || 1.0;
    const baseFriction = ball.isAnchored ? 0.94 : 0.945;
    const friction = Math.max(0.88, baseFriction - (stabilityBoost - 1.0) * 0.04);
    ball.vx *= Math.pow(friction, dt * 60);
    ball.vy *= Math.pow(friction, dt * 60);

    // Update Position
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Sanitize position & cap max speed to prevent NaN or clipping through stage
    if (isNaN(ball.x) || isNaN(ball.y)) { ball.x = 0; ball.y = 0; }
    if (isNaN(ball.vx) || isNaN(ball.vy)) { ball.vx = 0; ball.vy = 0; }
    const currentSpeed = Math.hypot(ball.vx, ball.vy);
    const maxSpeed = 520;
    if (currentSpeed > maxSpeed) {
      ball.vx = (ball.vx / currentSpeed) * maxSpeed;
      ball.vy = (ball.vy / currentSpeed) * maxSpeed;
    }

    // Rotation & Sound
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.rotation += (ball.vx + ball.vy) * 0.02;
    soundManager.updateRollSound(speed);

    // Trail particles
    if (speed > 30 && Math.random() < 0.6) {
      particlesRef.current.push({
        x: ball.x + (Math.random() - 0.5) * 8,
        y: ball.y + (Math.random() - 0.5) * 8,
        vx: -ball.vx * 0.1,
        vy: -ball.vy * 0.1,
        radius: skin.trailType === 'sparkle' ? 2 + Math.random() * 3 : 4,
        color: skin.accentColor,
        alpha: 0.8,
        life: 0,
        maxLife: 0.3,
      });
    }

    // 5. Platform Boundaries & Edge Fall / Wall Bounce Check
    const { pW, pH } = getPlatformBounds();

    // Edge Anti-Gravity Thruster Recovery Passive Boost
    if (passiveBoosts?.recoveryForceMult && passiveBoosts.recoveryForceMult > 1.0) {
      const distFromCenter = Math.hypot(ball.x, ball.y) || 1;
      const edgeThreshold = Math.min(pW, pH) * 0.82;
      if (distFromCenter > edgeThreshold) {
        const thrust = (passiveBoosts.recoveryForceMult - 1.0) * 350 * dt;
        ball.vx -= (ball.x / distFromCenter) * thrust;
        ball.vy -= (ball.y / distFromCenter) * thrust;
      }
    }

    const isInsidePlatform = (x: number, y: number, margin: number = 0) => {
      if (level.shape === 'rectangle') {
        return Math.abs(x) <= pW + margin && Math.abs(y) <= pH + margin;
      } else if (level.shape === 'circle') {
        return Math.hypot(x, y) <= pW + margin;
      } else if (level.shape === 'hexagon') {
        const radius = pW + margin;
        const q2x = Math.abs(x) / radius;
        const q2y = Math.abs(y) / radius;
        return q2y <= 0.866 && q2x * 0.866 + q2y * 0.5 <= 0.866;
      } else if (level.shape === 'cross') {
        const armW = pW * 0.45;
        const armH = pH * 0.45;
        return (Math.abs(x) <= armW && Math.abs(y) <= pH + margin) || (Math.abs(x) <= pW + margin && Math.abs(y) <= armH);
      }
      return Math.abs(x) <= pW + margin && Math.abs(y) <= pH + margin;
    };

    if (level.hasWalls) {
      // Enclosed stage with physical walls: Bounce ball off edges!
      const limitX = pW - ball.radius;
      const limitY = pH - ball.radius;

      if (Math.abs(ball.x) > limitX) {
        ball.x = Math.sign(ball.x) * limitX;
        ball.vx = -ball.vx * 0.65;
        soundManager.playBounce(1.0);
      }
      if (Math.abs(ball.y) > limitY) {
        ball.y = Math.sign(ball.y) * limitY;
        ball.vy = -ball.vy * 0.65;
        soundManager.playBounce(1.0);
      }
    } else {
      // Open deck without walls: Fall off edge check
      // Require ball center to actually pass 8px beyond platform boundary before falling
      const isPastEdge = !isInsidePlatform(ball.x, ball.y, 8);
      const isSpawnGrace = stats.timeSurvived < 1.2;

      if (isPastEdge && !isSpawnGrace) {
        if (ball.hasSafetyNet) {
          const distFromCenter = Math.hypot(ball.x, ball.y) || 1;
          ball.vx = (-ball.x / distFromCenter) * 280;
          ball.vy = (-ball.y / distFromCenter) * 280;
          soundManager.playBounce(1.5);
          addFloatingText(ball.x, ball.y, 'NET SAVED!', '#22c55e');
          addExplosion(ball.x, ball.y, '#22c55e', 12);
        } else {
          stats.isFalling = true;
          stats.fallProgress = 0;
          soundManager.playGameOver();
          soundManager.triggerHaptic(100);
        }
      } else if (isSpawnGrace && isPastEdge) {
        // Gently pull back during spawn grace period
        ball.x *= 0.85;
        ball.y *= 0.85;
        ball.vx *= 0.5;
        ball.vy *= 0.5;
      }
    }

    // 6. Update PowerUp items & Magnet pull
    powerUpsRef.current.forEach((pwr) => {
      pwr.timer -= dt;

      if (ball.isMagnetized) {
        const dx = ball.x - pwr.x;
        const dy = ball.y - pwr.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 180) {
          pwr.x += (dx / dist) * 200 * dt;
          pwr.y += (dy / dist) * 200 * dt;
        }
      }

      // Check pickup
      const dist = Math.hypot(ball.x - pwr.x, ball.y - pwr.y);
      if (dist < ball.radius + pwr.radius) {
        applyPowerUp(pwr.type);
        pwr.timer = -1; // marked for removal
      }
    });

    // Clean expired ground powerups
    powerUpsRef.current = powerUpsRef.current.filter((p) => p.timer > 0);

    // 7. Update Obstacles & Collision Logic
    const timeScale = hasSlowMo ? 0.4 : 1.0;

    obstaclesRef.current.forEach((obs) => {
      if (obs.type === 'comet') {
        obs.x += obs.vx * timeScale * dt;
        obs.y += obs.vy * timeScale * dt;

        // Collision with Ball
        const dx = ball.x - obs.x;
        const dy = ball.y - obs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < ball.radius + obs.radius) {
          // Transfer kinetic impulse (knockback force pushing ball away)
          const nx = dist > 0 ? dx / dist : 1;
          const ny = dist > 0 ? dy / dist : 0;
          const knockbackForce = ball.isAnchored ? 100 : 220;

          ball.vx += nx * knockbackForce + obs.vx * 0.3;
          ball.vy += ny * knockbackForce + obs.vy * 0.3;

          addFloatingText(ball.x, ball.y - 15, 'FIREBALL IMPACT!', '#ef4444');
          triggerScreenShake(0.35, 14);
          handleHit(obs);
          obs.hp = 0; // destroyed on hit
        }
      } else if (obs.type === 'shockwave') {
        if (!obs.active) {
          obs.timer = (obs.timer || 0) + dt;
          if (obs.timer >= (obs.maxTimer || 1.0)) {
            obs.active = true;
            obs.timer = 0;
            soundManager.playShockwave();
          }
        } else {
          obs.radius += 180 * dt; // expanding shockwave
          const dist = Math.hypot(ball.x - obs.x, ball.y - obs.y);
          if (Math.abs(dist - obs.radius) < 20) {
            // Push ball outward
            const angle = Math.atan2(ball.y - obs.y, ball.x - obs.x);
            const force = ball.isAnchored ? 100 : 220;
            ball.vx += Math.cos(angle) * force;
            ball.vy += Math.sin(angle) * force;
            addFloatingText(ball.x, ball.y - 15, 'SHOCKWAVE!', '#f97316');
            triggerScreenShake(0.35, 12);
            handleHit(obs, false);
          }
          if (obs.radius > (obs.impactRadius || 120)) {
            obs.hp = 0; // expired
          }
        }
      } else if (obs.type === 'laser_beam') {
        obs.timer = (obs.timer || 0) + dt;

        if (!obs.active) {
          // Warning telegraph phase (1.0 sec)
          if (obs.timer >= 1.0) {
            obs.active = true;
            soundManager.playShockwave();
          }
        } else {
          // Active rotating beam
          obs.angle = (obs.angle || 0) + (obs.angularVelocity || 0.3) * timeScale * dt;

          const cosA = Math.cos(obs.angle);
          const sinA = Math.sin(obs.angle);
          const distToLine = Math.abs(-sinA * ball.x + cosA * ball.y);

          if (distToLine < ball.radius + (obs.width || 12) / 2) {
            const pushForce = ball.isAnchored ? 80 : 180;
            ball.vx += -sinA * pushForce;
            ball.vy += cosA * pushForce;
            addFloatingText(ball.x, ball.y - 15, 'LASER ZAP!', '#f43f5e');
            triggerScreenShake(0.25, 10);
            handleHit(obs);
          }
        }

        if (obs.timer >= (obs.maxTimer || 4.5)) {
          obs.hp = 0;
        }
      } else if (obs.type === 'seeker') {
        const dx = ball.x - obs.x;
        const dy = ball.y - obs.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = (obs.speed || 80) * timeScale;

        obs.x += (dx / dist) * speed * dt;
        obs.y += (dy / dist) * speed * dt;

        if (dist < ball.radius + obs.radius) {
          const nx = dist > 0 ? dx / dist : 1;
          const ny = dist > 0 ? dy / dist : 0;
          const knockbackForce = ball.isAnchored ? 100 : 200;

          ball.vx += nx * knockbackForce;
          ball.vy += ny * knockbackForce;

          addFloatingText(ball.x, ball.y - 15, 'DRONE BLAST!', '#a855f7');
          triggerScreenShake(0.3, 10);
          handleHit(obs);
          obs.hp = 0;
        }

        obs.timer = (obs.timer || 0) + dt;
        if (obs.timer >= (obs.maxTimer || 8.0)) obs.hp = 0;
      } else if (obs.type === 'anvil') {
        if (!obs.active) {
          obs.timer = (obs.timer || 0) + dt;
          if (obs.timer >= (obs.maxTimer || 1.5)) {
            obs.active = true;
            obs.x = obs.targetX || 0;
            obs.y = obs.targetY || 0;
            soundManager.playHit(1.5);
            addExplosion(obs.x, obs.y, '#64748b', 24);

            // Distance to impact
            const dist = Math.hypot(ball.x - obs.x, ball.y - obs.y);
            if (dist < obs.radius + ball.radius + 30) {
              const angle = Math.atan2(ball.y - obs.y, ball.x - obs.x);
              ball.vx += Math.cos(angle) * 240;
              ball.vy += Math.sin(angle) * 240;
              addFloatingText(ball.x, ball.y - 15, 'ANVIL CRASH!', '#64748b');
              triggerScreenShake(0.4, 16);
              handleHit(obs);
            }
          }
        } else {
          obs.timer = (obs.timer || 0) + dt;
          if (obs.timer > 0.6) obs.hp = 0;
        }
      } else if (obs.type === 'bumper' || obs.type === 'piston') {
        const dist = Math.hypot(ball.x - obs.x, ball.y - obs.y);
        if (dist < ball.radius + obs.radius) {
          const angle = Math.atan2(ball.y - obs.y, ball.x - obs.x);
          ball.vx = Math.cos(angle) * 350;
          ball.vy = Math.sin(angle) * 350;
          soundManager.playBounce(1.5);
          addFloatingText(obs.x, obs.y, 'BUMP!', '#eab308');
        }
        obs.timer = (obs.timer || 0) + dt;
        if (obs.timer >= (obs.maxTimer || 10.0)) obs.hp = 0;
      }
    });

    // Remove expired obstacles
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.hp !== 0);

    // 8. Update Particles
    particlesRef.current.forEach((p) => {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life += dt;
      p.alpha = Math.max(1 - p.life / p.maxLife, 0);
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

    // 9. Update Floating Texts
    floatingTextsRef.current.forEach((ft) => {
      ft.y += ft.vy;
      ft.alpha -= dt * 1.2;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);
  };

  // Handle Obstacle Hit
  const handleHit = (obs: Obstacle, countDodge: boolean = true) => {
    const ball = ballRef.current;
    const stats = gameStatsRef.current;

    soundManager.playHit(1.2);
    soundManager.triggerHaptic(60);
    addExplosion(ball.x, ball.y, '#ef4444', 18);

    if (ball.hasShield) {
      ball.shieldHp -= 1;
      addFloatingText(ball.x, ball.y - 20, 'SHIELD ABSORBED!', '#38bdf8');
      if (ball.shieldHp <= 0) {
        ball.hasShield = false;
        activePowerUpsRef.current = activePowerUpsRef.current.filter((p) => p.type !== 'shield');
        onActivePowerUpsChange([...activePowerUpsRef.current]);
      }
      return;
    }

    if (countDodge) {
      stats.obstaclesDodged += 1;
    }

    // Direct life loss if enclosed stage or lose
    if (level.hasWalls) {
      stats.lives -= 1;
      onLivesChange(stats.lives);
      addFloatingText(ball.x, ball.y - 20, '-1 LIFE!', '#ef4444');

      if (stats.lives <= 0) {
        stats.isFalling = true;
        soundManager.playGameOver();
      }
    }
  };

  // Update fall animation when ball falls into void
  const updateFalling = (dt: number) => {
    const ball = ballRef.current;
    const stats = gameStatsRef.current;

    if ((stats as any).hasTriggeredGameOver) return;

    stats.fallProgress += dt * 1.5;
    ball.radius = Math.max(ball.baseRadius * (1 - stats.fallProgress), 0);
    ball.rotation += 0.2;

    if (stats.fallProgress >= 1.0) {
      (stats as any).hasTriggeredGameOver = true;
      soundManager.stopRollSound();
      onGameOver(
        Math.floor(stats.score),
        Math.floor(stats.timeSurvived),
        stats.obstaclesDodged,
        stats.powerupsCollected
      );
    }
  };

  // Render 2D / 3D Canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const cssW = rect.width;
    const cssH = rect.height;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Crisp scale for Retina & High-DPI screens
    ctx.scale(dpr, dpr);

    // Apply Screen Shake if active
    let shakeX = 0;
    let shakeY = 0;
    if (screenShakeTimeRef.current > 0) {
      screenShakeTimeRef.current -= 0.016;
      const intensity = screenShakeIntensityRef.current;
      shakeX = (Math.random() - 0.5) * intensity;
      shakeY = (Math.random() - 0.5) * intensity;
    }

    // Center origin (0,0) in middle of phone screen with camera shake
    ctx.translate(cssW / 2 + shakeX, cssH / 2 + shakeY);

    // Apply smooth 3D tilt transformation to the platform context!
    const renderControl = controlRef.current;
    const effectiveSens = renderControl.sensitivity * 0.4;
    const effX = renderControl.invertX ? -renderControl.tiltX : renderControl.tiltX;
    const effY = renderControl.invertY ? -renderControl.tiltY : renderControl.tiltY;

    const tiltAngleX = effY * effectiveSens * 0.22; // pitch
    const tiltAngleY = effX * effectiveSens * 0.22; // roll

    ctx.transform(
      Math.cos(tiltAngleY),
      Math.sin(tiltAngleX),
      -Math.sin(tiltAngleY),
      Math.cos(tiltAngleX),
      0,
      0
    );

    const { pW, pH } = getPlatformBounds();

    // 1. Draw Platform Surface
    drawPlatform(ctx, pW, pH, cssW, cssH);

    // 2. Draw Safety Net if active
    if (ballRef.current.hasSafetyNet) {
      drawSafetyNet(ctx, pW, pH);
    }

    // 3. Draw PowerUps
    powerUpsRef.current.forEach((pwr) => drawPowerUp(ctx, pwr));

    // 4. Draw Obstacles
    obstaclesRef.current.forEach((obs) => drawObstacle(ctx, obs));

    // 5. Draw Particles
    particlesRef.current.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 6. Draw Ball
    drawBall(ctx);

    // 7. Draw Floating Texts
    floatingTextsRef.current.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(ft.alpha, 0);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  };

  // Render Platform Shapes & Themes
  const drawPlatform = (
    ctx: CanvasRenderingContext2D,
    pW: number,
    pH: number,
    cssW: number,
    cssH: number
  ) => {
    ctx.save();

    // Theme styles
    let mainGradient: CanvasGradient;
    let borderColor = '#3b82f6';

    if (level.theme === 'wooden') {
      mainGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(pW, pH));
      mainGradient.addColorStop(0, '#78350f');
      mainGradient.addColorStop(1, '#451a03');
      borderColor = '#d97706';
    } else if (level.theme === 'cyber' || level.theme === 'neon') {
      mainGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(pW, pH));
      mainGradient.addColorStop(0, '#0f172a');
      mainGradient.addColorStop(1, '#020617');
      borderColor = level.theme === 'neon' ? '#ec4899' : '#38bdf8';
    } else if (level.theme === 'volcano') {
      mainGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(pW, pH));
      mainGradient.addColorStop(0, '#450a0a');
      mainGradient.addColorStop(1, '#180202');
      borderColor = '#f97316';
    } else {
      mainGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.max(pW, pH));
      mainGradient.addColorStop(0, '#1e1b4b');
      mainGradient.addColorStop(1, '#090514');
      borderColor = '#818cf8';
    }

    // Shadow / Platform Depth
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 18;

    // Begin Shape Path
    ctx.beginPath();

    if (level.shape === 'rectangle') {
      ctx.rect(-pW, -pH, cssW, cssH);
    } else if (level.shape === 'circle') {
      ctx.arc(0, 0, pW, 0, Math.PI * 2);
    } else if (level.shape === 'hexagon') {
      const r = pW;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (level.shape === 'cross') {
      const armW = pW * 0.45;
      const armH = pH * 0.45;
      ctx.moveTo(-armW, -pH);
      ctx.lineTo(armW, -pH);
      ctx.lineTo(armW, -armH);
      ctx.lineTo(pW, -armH);
      ctx.lineTo(pW, armH);
      ctx.lineTo(armW, armH);
      ctx.lineTo(armW, pH);
      ctx.lineTo(-armW, pH);
      ctx.lineTo(-armW, armH);
      ctx.lineTo(-pW, armH);
      ctx.lineTo(-pW, -armH);
      ctx.lineTo(-armW, -armH);
      ctx.closePath();
    }

    ctx.fillStyle = mainGradient;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Red warning edge indicator line right along screen boundaries
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Grid Lines / Tech Pattern on Platform
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    const gridSize = 40;
    for (let x = -pW; x <= pW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -pH);
      ctx.lineTo(x, pH);
      ctx.stroke();
    }
    for (let y = -pH; y <= pH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-pW, y);
      ctx.lineTo(pW, y);
      ctx.stroke();
    }

    // Platform Center Target Indicator
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.restore();
  };

  // Safety Net Barrier Rendering
  const drawSafetyNet = (ctx: CanvasRenderingContext2D, pW: number, pH: number) => {
    ctx.save();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 15;
    ctx.setLineDash([8, 6]);

    ctx.beginPath();
    if (level.shape === 'circle') ctx.arc(0, 0, pW, 0, Math.PI * 2);
    else ctx.rect(-pW + 8, -pH + 8, (pW - 8) * 2, (pH - 8) * 2);
    ctx.stroke();

    ctx.restore();
  };

  // PowerUp Item Rendering
  const drawPowerUp = (ctx: CanvasRenderingContext2D, pwr: PowerUpItem) => {
    ctx.save();
    ctx.translate(pwr.x, pwr.y);

    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
    const r = pwr.radius * pulse;

    let color = '#38bdf8';
    let label = '🛡️';

    if (pwr.type === 'anchor') {
      color = '#eab308';
      label = '⚓';
    } else if (pwr.type === 'slow_mo') {
      color = '#06b6d4';
      label = '⏱️';
    } else if (pwr.type === 'blast') {
      color = '#ef4444';
      label = '💥';
    } else if (pwr.type === 'magnet') {
      color = '#a855f7';
      label = '🧲';
    } else if (pwr.type === 'shrink') {
      color = '#ec4899';
      label = '🔍';
    } else if (pwr.type === 'score_multiplier') {
      color = '#f59e0b';
      label = '2X';
    } else if (pwr.type === 'safety_net') {
      color = '#22c55e';
      label = '🕸️';
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 1);

    ctx.restore();
  };

  // Obstacle Rendering
  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    ctx.save();

    if (obs.type === 'comet' || obs.type === 'seeker') {
      ctx.translate(obs.x, obs.y);
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = obs.color;
      ctx.fill();

      // Spike core
      ctx.beginPath();
      ctx.arc(0, 0, obs.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (obs.type === 'shockwave') {
      ctx.translate(obs.x, obs.y);
      if (!obs.active) {
        // Warning Target Ring
        const progress = (obs.timer || 0) / (obs.maxTimer || 1.0);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 40 * progress, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
        ctx.fill();
      } else {
        // Expanding Shockwave Ring
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (obs.type === 'laser_beam') {
      const len = obs.length || 300;
      const cosA = Math.cos(obs.angle || 0);
      const sinA = Math.sin(obs.angle || 0);

      if (!obs.active) {
        // Dotted blinking warning line
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(-cosA * len, -sinA * len);
        ctx.lineTo(cosA * len, sinA * len);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Active glowing laser beam
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = obs.width || 12;

        ctx.beginPath();
        ctx.moveTo(-cosA * len, -sinA * len);
        ctx.lineTo(cosA * len, sinA * len);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cosA * len, -sinA * len);
        ctx.lineTo(cosA * len, sinA * len);
        ctx.stroke();
      }
    } else if (obs.type === 'anvil') {
      if (!obs.active) {
        // Warning indicator
        ctx.translate(obs.targetX || 0, obs.targetY || 0);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius + 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ DANGER', 0, 0);
      } else {
        ctx.translate(obs.x, obs.y);
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (obs.type === 'bumper' || obs.type === 'piston') {
      ctx.translate(obs.x, obs.y);
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = obs.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  };

  // Ball Rendering
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    const ball = ballRef.current;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // Ball Glow
    ctx.shadowColor = skin.glowColor;
    ctx.shadowBlur = ball.hasShield ? 28 : 16;

    // Ball Body
    const grad = ctx.createRadialGradient(
      -ball.radius * 0.3,
      -ball.radius * 0.3,
      2,
      0,
      0,
      ball.radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, skin.color);
    grad.addColorStop(1, skin.accentColor);

    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular Highlight
    ctx.beginPath();
    ctx.arc(-ball.radius * 0.35, -ball.radius * 0.35, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    // Shield Matrix Ring
    if (ball.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(0, 0, ball.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Heavy Anchor Indicator
    if (ball.isAnchored) {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚓', 0, 0);
    }

    ctx.restore();
  };

  // Resize listener for DPI rendering
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-full max-h-full touch-none select-none"
      />
    </div>
  );
};
