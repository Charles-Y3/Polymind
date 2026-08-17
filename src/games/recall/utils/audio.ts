import { BgmMode } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBgmMode: BgmMode = 'off';
  private bgmLoopTimer: number | null = null;
  private bgmMasterGain: GainNode | null = null;
  private activeBgNodes: (AudioNode | number)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  public initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public async unlockAudio() {
    const ctx = this.initCtx();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignore
      }
    }

    // If BGM is active but no nodes are producing audio, start playing!
    if (!this.isMuted && this.currentBgmMode !== 'off' && !this.bgmMasterGain && ctx && ctx.state === 'running') {
      this.startBgm(this.currentBgmMode);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBgm();
    } else if (this.currentBgmMode !== 'off') {
      this.startBgm(this.currentBgmMode);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getBgmMode(): BgmMode {
    return this.currentBgmMode;
  }

  public async setBgmMode(mode: BgmMode) {
    this.currentBgmMode = mode;
    if (mode === 'off' || this.isMuted) {
      this.stopBgm();
    } else {
      await this.unlockAudio();
      this.startBgm(mode);
    }
  }

  public async cycleBgmMode(): Promise<BgmMode> {
    let next: BgmMode = 'off';
    if (this.currentBgmMode === 'off') next = 'calm';
    else if (this.currentBgmMode === 'calm') next = 'arcade';
    else next = 'off';

    await this.setBgmMode(next);
    return next;
  }

  // --- BACKGROUND MUSIC ENGINE (EXTENDED WEB AUDIO API SYNTHESIS) ---
  public async startBgm(mode: BgmMode) {
    this.stopBgm();
    if (mode === 'off' || this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    if (mode === 'calm') {
      this.runCalmBgmLoop();
    } else if (mode === 'arcade') {
      this.runArcadeBgmLoop();
    }
  }

  public stopBgm() {
    if (this.bgmLoopTimer !== null) {
      window.clearTimeout(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
    // Clean up active nodes
    this.activeBgNodes.forEach((node) => {
      if (typeof node === 'object' && node !== null) {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          if ('disconnect' in node && typeof node.disconnect === 'function') {
            node.disconnect();
          }
        } catch {
          // Ignore
        }
      }
    });
    this.activeBgNodes = [];

    if (this.bgmMasterGain && this.ctx) {
      try {
        this.bgmMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmMasterGain.disconnect();
      } catch {
        // Ignore
      }
      this.bgmMasterGain = null;
    }
  }

  // =========================================================================
  // 1. EXTENDED CALM BGM (☕ Ambient Lo-Fi & Ethereal Chillwave - ~45s Loop)
  // 12-bar rich harmonic progression with evolving chords & top chimes
  // =========================================================================
  private runCalmBgmLoop() {
    if (!this.ctx || this.currentBgmMode !== 'calm' || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const chordDuration = 3.8; // seconds per chord (12 chords = 45.6s total loop)

      const progression = [
        // --- Phrase 1: Warm Foundation ---
        {
          chord: [155.56, 196.0, 233.08, 293.66, 349.23], // Ebmaj9
          chimes: [{ freq: 392.0, delay: 1.2 }, { freq: 587.33, delay: 2.4 }],
        },
        {
          chord: [130.81, 196.0, 233.08, 311.13, 392.0], // Cm9
          chimes: [{ freq: 523.25, delay: 1.0 }, { freq: 466.16, delay: 2.2 }],
        },
        {
          chord: [103.83, 155.56, 261.63, 293.66, 392.0], // Abmaj7#11
          chimes: [{ freq: 466.16, delay: 1.4 }, { freq: 587.33, delay: 2.6 }],
        },
        {
          chord: [116.54, 174.61, 233.08, 311.13, 349.23], // Bb7sus4 -> Bb9
          chimes: [{ freq: 349.23, delay: 1.1 }, { freq: 466.16, delay: 2.5 }],
        },

        // --- Phrase 2: Soulful Motion & Modulation ---
        {
          chord: [87.31, 174.61, 207.65, 261.63, 311.13], // Fm9
          chimes: [{ freq: 415.3, delay: 0.9 }, { freq: 523.25, delay: 2.1 }],
        },
        {
          chord: [98.0, 146.83, 196.0, 233.08, 293.66], // Gm7
          chimes: [{ freq: 392.0, delay: 1.2 }, { freq: 466.16, delay: 2.3 }],
        },
        {
          chord: [103.83, 155.56, 207.65, 261.63, 392.0], // Abmaj9
          chimes: [{ freq: 523.25, delay: 1.0 }, { freq: 587.33, delay: 2.2 }],
        },
        {
          chord: [69.3, 138.59, 207.65, 277.18, 329.63], // Dbmaj7#11 (Dreamy Lydian chord)
          chimes: [{ freq: 466.16, delay: 1.2 }, { freq: 523.25, delay: 2.5 }],
        },

        // --- Phrase 3: Ethereal Climax & Resolution ---
        {
          chord: [130.81, 196.0, 261.63, 311.13, 349.23], // Cm11
          chimes: [{ freq: 622.25, delay: 1.1 }, { freq: 587.33, delay: 2.4 }],
        },
        {
          chord: [146.83, 174.61, 233.08, 293.66, 349.23], // Bb/D
          chimes: [{ freq: 466.16, delay: 1.0 }, { freq: 392.0, delay: 2.2 }],
        },
        {
          chord: [103.83, 155.56, 207.65, 261.63, 311.13], // Ab6/9
          chimes: [{ freq: 392.0, delay: 1.3 }, { freq: 523.25, delay: 2.5 }],
        },
        {
          chord: [116.54, 174.61, 207.65, 261.63, 349.23], // Bbsus13 (Smooth turnaround)
          chimes: [{ freq: 587.33, delay: 1.0 }, { freq: 466.16, delay: 2.3 }],
        },
      ];

      // Master BGM Gain node
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(this.ctx.destination);
      this.bgmMasterGain = masterGain;

      progression.forEach((bar, barIdx) => {
        const barStartTime = now + barIdx * chordDuration;

        // Warm Low-pass Filter with gentle breathing resonance
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850 + (barIdx % 4) * 80, barStartTime);
        filter.Q.setValueAtTime(1.1, barStartTime);
        filter.connect(masterGain);
        this.activeBgNodes.push(filter);

        // Chord Layers
        bar.chord.forEach((freq, noteIdx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = noteIdx === 0 ? 'sine' : noteIdx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, barStartTime);

          // Subtle analog drift
          osc.frequency.linearRampToValueAtTime(freq * 1.002, barStartTime + chordDuration * 0.5);
          osc.frequency.linearRampToValueAtTime(freq, barStartTime + chordDuration);

          // Smooth envelope
          const targetVol = noteIdx === 0 ? 0.24 : 0.13;
          gain.gain.setValueAtTime(0.0001, barStartTime);
          gain.gain.linearRampToValueAtTime(targetVol, barStartTime + 0.6);
          gain.gain.setValueAtTime(targetVol, barStartTime + chordDuration - 0.5);
          gain.gain.linearRampToValueAtTime(0.0001, barStartTime + chordDuration + 0.1);

          osc.connect(gain);
          gain.connect(filter);

          osc.start(barStartTime);
          osc.stop(barStartTime + chordDuration + 0.1);

          this.activeBgNodes.push(osc);
          this.activeBgNodes.push(gain);
        });

        // Delicate Ambient Bell Chimes
        bar.chimes.forEach((chime) => {
          if (!this.ctx) return;
          const chimeTime = barStartTime + chime.delay;
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(chime.freq, chimeTime);

          chimeGain.gain.setValueAtTime(0.0001, chimeTime);
          chimeGain.gain.linearRampToValueAtTime(0.07, chimeTime + 0.05);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.2);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(masterGain);

          chimeOsc.start(chimeTime);
          chimeOsc.stop(chimeTime + 1.2);

          this.activeBgNodes.push(chimeOsc);
          this.activeBgNodes.push(chimeGain);
        });
      });

      const totalLoopTimeMs = progression.length * chordDuration * 1000;
      this.bgmLoopTimer = window.setTimeout(() => {
        if (this.currentBgmMode === 'calm' && !this.isMuted) {
          this.runCalmBgmLoop();
        }
      }, totalLoopTimeMs - 200);
    } catch {
      // Audio fallback
    }
  }

  // =========================================================================
  // 2. EXTENDED ARCADE BGM (⚡ 16-Bar Synthwave Cyber Anthem - 128 BPM, ~30s Loop)
  // Full 16-bar structured arcade track with evolving bass, leads & breakdowns
  // =========================================================================
  private runArcadeBgmLoop() {
    if (!this.ctx || this.currentBgmMode !== 'arcade' || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const sixteenth = 60 / (128 * 4); // ~0.1171875s per 16th note (128 BPM)

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.connect(this.ctx.destination);
      this.bgmMasterGain = masterGain;

      // Resonant Lowpass Filter for that crisp synthwave bite
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1750, now);
      filter.Q.setValueAtTime(2.4, now);
      filter.connect(masterGain);
      this.activeBgNodes.push(filter);

      const bars = [
        // --- Movement 1: Main Driving Theme (Am -> F -> C -> G) ---
        {
          bass: 110.0, // A2
          arp: [220, 261.63, 329.63, 440, 523.25, 440, 329.63, 261.63],
        },
        {
          bass: 87.31, // F2
          arp: [174.61, 220, 261.63, 349.23, 440, 349.23, 261.63, 220],
        },
        {
          bass: 130.81, // C3
          arp: [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63],
        },
        {
          bass: 98.0, // G2
          arp: [196.0, 246.94, 293.66, 392.0, 493.88, 392.0, 293.66, 246.94],
        },

        // --- Movement 2: Neon Ascent Variation (Am -> Em -> Fmaj7 -> G6) ---
        {
          bass: 110.0, // A2
          arp: [220, 329.63, 440, 523.25, 659.25, 523.25, 440, 329.63],
        },
        {
          bass: 82.41, // E2
          arp: [164.81, 196.0, 246.94, 329.63, 392.0, 329.63, 246.94, 196.0],
        },
        {
          bass: 87.31, // F2
          arp: [174.61, 220, 261.63, 329.63, 440, 329.63, 261.63, 220],
        },
        {
          bass: 98.0, // G2
          arp: [196.0, 246.94, 293.66, 329.63, 392.0, 329.63, 293.66, 246.94],
        },

        // --- Movement 3: High Tension Breakdown (Dm -> Am -> Bb -> E7alt) ---
        {
          bass: 73.42, // D2
          arp: [146.83, 220, 261.63, 293.66, 349.23, 293.66, 261.63, 220],
        },
        {
          bass: 110.0, // A2
          arp: [220, 261.63, 329.63, 392.0, 440, 392.0, 329.63, 261.63],
        },
        {
          bass: 116.54, // Bb2
          arp: [233.08, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66],
        },
        {
          bass: 82.41, // E2
          arp: [164.81, 207.65, 246.94, 293.66, 349.23, 293.66, 246.94, 207.65],
        },

        // --- Movement 4: Climax & Hyperspeed Turnaround (F -> G -> Am -> Em/G) ---
        {
          bass: 87.31, // F2
          arp: [174.61, 261.63, 349.23, 440, 523.25, 440, 349.23, 261.63],
        },
        {
          bass: 98.0, // G2
          arp: [196.0, 293.66, 392.0, 493.88, 587.33, 493.88, 392.0, 293.66],
        },
        {
          bass: 110.0, // A2
          arp: [220, 329.63, 440, 523.25, 659.25, 523.25, 440, 329.63],
        },
        {
          bass: 98.0, // G2
          arp: [196.0, 246.94, 293.66, 392.0, 493.88, 392.0, 293.66, 246.94],
        },
      ];

      let stepOffset = 0;

      bars.forEach((bar, barIdx) => {
        const barStartTime = now + stepOffset * sixteenth;

        // Dynamic Synth Bassline with 8th-note pulsing groove
        if (this.ctx) {
          [0, 4].forEach((subPulse) => {
            if (!this.ctx) return;
            const pulseTime = barStartTime + subPulse * sixteenth;
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();

            bassOsc.type = 'sawtooth';
            bassOsc.frequency.setValueAtTime(bar.bass, pulseTime);

            const pulseDuration = 3.6 * sixteenth;
            bassGain.gain.setValueAtTime(0.0001, pulseTime);
            bassGain.gain.linearRampToValueAtTime(0.24, pulseTime + 0.02);
            bassGain.gain.exponentialRampToValueAtTime(0.04, pulseTime + pulseDuration * 0.7);
            bassGain.gain.linearRampToValueAtTime(0.0001, pulseTime + pulseDuration);

            bassOsc.connect(bassGain);
            bassGain.connect(filter);

            bassOsc.start(pulseTime);
            bassOsc.stop(pulseTime + pulseDuration);

            this.activeBgNodes.push(bassOsc);
            this.activeBgNodes.push(bassGain);
          });
        }

        // 16th-note Arpeggio Melodic Cascade
        bar.arp.forEach((freq, arpIdx) => {
          if (!this.ctx) return;
          const noteTime = barStartTime + arpIdx * sixteenth;

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = arpIdx % 2 === 0 ? 'triangle' : 'square';
          osc.frequency.setValueAtTime(freq, noteTime);

          const isAccent = arpIdx === 0 || arpIdx === 4;
          const noteVol = isAccent ? 0.15 : 0.09;

          gain.gain.setValueAtTime(0.0001, noteTime);
          gain.gain.linearRampToValueAtTime(noteVol, noteTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + sixteenth * 0.88);

          osc.connect(gain);
          gain.connect(filter);

          osc.start(noteTime);
          osc.stop(noteTime + sixteenth * 0.88);

          this.activeBgNodes.push(osc);
          this.activeBgNodes.push(gain);
        });

        stepOffset += 8;
      });

      const totalLoopTimeMs = stepOffset * sixteenth * 1000;
      this.bgmLoopTimer = window.setTimeout(() => {
        if (this.currentBgmMode === 'arcade' && !this.isMuted) {
          this.runArcadeBgmLoop();
        }
      }, totalLoopTimeMs - 150);
    } catch {
      // Audio fallback
    }
  }

  // --- SOUND EFFECTS ---
  public playTap() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio E5 -> G#5 -> B5 -> E6
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch {
      // Audio fallback
    }
  }

  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Audio fallback
    }
  }

  public playStreakFanfare() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.22, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch {
      // Audio fallback
    }
  }

  public playLevelUp() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [
        [440, 554.37, 659.25], // A major
        [554.37, 659.25, 830.61], // C#m
        [659.25, 830.61, 987.77, 1318.51], // E major
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + step * 0.15);

          gain.gain.setValueAtTime(0.18, now + step * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.15 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + step * 0.15);
          osc.stop(now + step * 0.15 + 0.45);
        });
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soundManager = new SoundManager();
