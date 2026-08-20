let audioCtx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(ctx: AudioContext, freq: number, start: number, duration: number, gainVal: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

export const sound = {
  setEnabled(v: boolean) {
    enabled = v;
  },

  playClick() {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      tone(ctx, 700, ctx.currentTime, 0.03, 0.05);
    } catch {}
  },

  playCrack() {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [392, 494, 587, 784].forEach((f, i) => tone(ctx, f, now + i * 0.07, 0.35, 0.14, 'triangle'));
    } catch {}
  },

  playBust() {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  },

  playHint() {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      tone(ctx, 900, ctx.currentTime, 0.15, 0.08, 'sine');
    } catch {}
  },
};
