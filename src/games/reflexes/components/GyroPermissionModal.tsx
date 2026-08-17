import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Sliders, RefreshCw, Check, Compass, Play, RotateCcw } from 'lucide-react';

interface GyroPermissionModalProps {
  sensitivity: number;
  invertX: boolean;
  invertY: boolean;
  controlMode: 'sensor' | 'touch' | 'hybrid';
  hasSensorPermission: boolean;
  tiltX: number; // Current live sensor tiltX (-1 to +1)
  tiltY: number; // Current live sensor tiltY (-1 to +1)
  isFirstTime?: boolean;
  onUpdateSettings: (settings: {
    sensitivity: number;
    invertX: boolean;
    invertY: boolean;
    controlMode: 'sensor' | 'touch' | 'hybrid';
    hasCalibrated: boolean;
  }) => void;
  onRequestSensorPermission: () => Promise<boolean>;
  onCalibrateZero: () => void;
  onClose: () => void;
  onContinueGame?: () => void;
}

export const GyroPermissionModal: React.FC<GyroPermissionModalProps> = ({
  sensitivity,
  invertX,
  invertY,
  controlMode,
  hasSensorPermission,
  tiltX,
  tiltY,
  isFirstTime = false,
  onUpdateSettings,
  onRequestSensorPermission,
  onCalibrateZero,
  onClose,
  onContinueGame,
}) => {
  const [localSens, setLocalSens] = useState(sensitivity);
  const [localInvX, setLocalInvX] = useState(invertX);
  const [localInvY, setLocalInvY] = useState(invertY);
  const [localMode, setLocalMode] = useState(controlMode);
  const [requesting, setRequesting] = useState(false);
  const [calibratedMsg, setCalibratedMsg] = useState(false);

  // Live Test Canvas state & ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);

  // Physics state for test ball
  const ballRef = useRef({
    x: 150,
    y: 80,
    vx: 0,
    vy: 0,
    radius: 12,
  });

  const speedReadoutRef = useRef(0);

  // Live Canvas Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const ball = ballRef.current;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Determine current effective tilt input
          let inputX = isTouchingRef.current ? touchTiltRef.current.x : tiltX;
          let inputY = isTouchingRef.current ? touchTiltRef.current.y : tiltY;

          if (localInvX) inputX *= -1;
          if (localInvY) inputY *= -1;

          // Calculate acceleration based on sensitivity slider
          const accel = localSens * 500;
          const ax = inputX * accel;
          const ay = inputY * accel;

          // Update physics
          ball.vx = (ball.vx + ax * dt) * 0.95;
          ball.vy = (ball.vy + ay * dt) * 0.95;

          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          // Bounce off inner test walls
          const r = ball.radius;
          const pad = 6; // inner padding border

          if (ball.x - r < pad) {
            ball.x = pad + r;
            ball.vx = -ball.vx * 0.6;
          } else if (ball.x + r > width - pad) {
            ball.x = width - pad - r;
            ball.vx = -ball.vx * 0.6;
          }

          if (ball.y - r < pad) {
            ball.y = pad + r;
            ball.vy = -ball.vy * 0.6;
          } else if (ball.y + r > height - pad) {
            ball.y = height - pad - r;
            ball.vy = -ball.vy * 0.6;
          }

          speedReadoutRef.current = Math.hypot(ball.vx, ball.vy);

          // Clear & Draw Test Arena
          ctx.clearRect(0, 0, width, height);

          // Background Deck
          const bgGrad = ctx.createRadialGradient(
            width / 2, height / 2, 10,
            width / 2, height / 2, width / 1.2
          );
          bgGrad.addColorStop(0, '#1e293b');
          bgGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);

          // Grid & Center Crosshair
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();

          // Target Center Ring
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, 24, 0, Math.PI * 2);
          ctx.stroke();

          // Border Walls
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

          // Shadow under Ball
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(ball.x, ball.y + 3, r, r * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Ball Body (Chrome/Cyan gradient)
          const ballGrad = ctx.createRadialGradient(
            ball.x - r * 0.3,
            ball.y - r * 0.3,
            r * 0.1,
            ball.x,
            ball.y,
            r
          );
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.4, '#22d3ee');
          ballGrad.addColorStop(1, '#0891b2');

          ctx.fillStyle = ballGrad;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Ball Inner Shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(ball.x - r * 0.3, ball.y - r * 0.3, r * 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Direction Vector Line
          if (Math.hypot(inputX, inputY) > 0.05) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(ball.x + inputX * 25 * localSens, ball.y + inputY * 25 * localSens);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [tiltX, tiltY, localSens, localInvX, localInvY]);

  // Touch / Drag event handlers on live test canvas
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isTouchingRef.current = true;
    updateTouchTilt(e);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (isTouchingRef.current) {
      updateTouchTilt(e);
    }
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    touchTiltRef.current = { x: 0, y: 0 };
  };

  const updateTouchTilt = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const relX = clientX - rect.left - rect.width / 2;
    const relY = clientY - rect.top - rect.height / 2;

    const normX = Math.min(Math.max(relX / (rect.width / 2), -1), 1);
    const normY = Math.min(Math.max(relY / (rect.height / 2), -1), 1);

    touchTiltRef.current = { x: normX, y: normY };
  };

  const handleResetBall = () => {
    ballRef.current.x = 150;
    ballRef.current.y = 80;
    ballRef.current.vx = 0;
    ballRef.current.vy = 0;
  };

  const handleSave = () => {
    onUpdateSettings({
      sensitivity: localSens,
      invertX: localInvX,
      invertY: localInvY,
      controlMode: localMode,
      hasCalibrated: true,
    });
    if (onContinueGame) {
      onContinueGame();
    } else {
      onClose();
    }
  };

  const handleRequest = async () => {
    setRequesting(true);
    const success = await onRequestSensorPermission();
    setRequesting(false);
    if (success) {
      setLocalMode('sensor');
    }
  };

  const handleCalibrate = () => {
    onCalibrateZero();
    setCalibratedMsg(true);
    setTimeout(() => setCalibratedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] my-auto">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                {isFirstTime ? 'First-Time Tilt Setup' : 'Tilt & Sensitivity Setup'}
              </h2>
              {isFirstTime && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  Step 1
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isFirstTime
                ? 'Roll the ball below to test tilt speed before starting your run!'
                : 'Adjust sensitivity and test live physics response'}
            </p>
          </div>
        </div>

        {/* Live Test Pad Canvas Container */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Rolling Test Pad
            </span>
            <button
              onClick={handleResetBall}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Center Ball
            </button>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-inner group">
            <canvas
              ref={canvasRef}
              width={300}
              height={160}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-[160px] cursor-grab active:cursor-grabbing touch-none block"
            />

            {/* Instruction Overlay on Canvas */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm text-[10px]">
              <span className="text-slate-400">Tilt phone or drag on pad</span>
              <span className="font-mono text-cyan-300 font-bold">
                {localSens.toFixed(1)}x Scale
              </span>
            </div>
          </div>
        </div>

        {/* Tilt Sensitivity Slider */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300 uppercase tracking-wider">Adjust Sensitivity</span>
            <span className="text-cyan-400 font-mono text-sm">{localSens.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={localSens}
            onChange={(e) => setLocalSens(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-slate-700"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>0.5x (Gentle)</span>
            <span>1.0x (Standard)</span>
            <span>2.5x (Fast)</span>
          </div>
        </div>

        {/* Motion Sensor & Calibration Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCalibrate}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{calibratedMsg ? 'Calibrated! ✓' : 'Set Flat Position'}</span>
          </button>

          {!hasSensorPermission ? (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="py-2.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enable Gyro</span>
            </button>
          ) : (
            <div className="py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Gyro Ready</span>
            </div>
          )}
        </div>

        {/* Control Method Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Control Input Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sensor', label: 'Tilt Gyro', icon: '📱' },
              { id: 'touch', label: 'Virtual Joystick', icon: '🕹️' },
              { id: 'hybrid', label: 'Hybrid Both', icon: '⚡' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLocalMode(m.id as 'sensor' | 'touch' | 'hybrid')}
                className={`p-2 rounded-xl border font-bold text-[11px] flex flex-col items-center gap-0.5 transition-all ${
                  localMode === m.id
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Axis Inversions */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer hover:bg-slate-800/70">
            <span className="font-semibold text-slate-300">Invert X Axis</span>
            <input
              type="checkbox"
              checked={localInvX}
              onChange={(e) => setLocalInvX(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer hover:bg-slate-800/70">
            <span className="font-semibold text-slate-300">Invert Y Axis</span>
            <input
              type="checkbox"
              checked={localInvY}
              onChange={(e) => setLocalInvY(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Save & Continue Action Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
        >
          {isFirstTime ? (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Save & Continue to Stage!</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Save & Apply Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
