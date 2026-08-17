import React, { useState, useEffect, useRef } from 'react';
import { Compass, Smartphone } from 'lucide-react';

interface VirtualTiltControlProps {
  onTiltChange: (x: number, y: number) => void;
  activeControlMode: 'sensor' | 'touch' | 'hybrid';
  hasSensorPermission: boolean;
}

export const VirtualTiltControl: React.FC<VirtualTiltControlProps> = ({
  onTiltChange,
  activeControlMode,
  hasSensorPermission,
}) => {
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const padRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Arrow Keys / WASD Support for Desktop
  useEffect(() => {
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.key.toLowerCase());
      updateKeyboardTilt();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key.toLowerCase());
      updateKeyboardTilt();
    };

    const updateKeyboardTilt = () => {
      let x = 0;
      let y = 0;

      if (keysDown.has('arrowleft') || keysDown.has('a')) x -= 0.8;
      if (keysDown.has('arrowright') || keysDown.has('d')) x += 0.8;
      if (keysDown.has('arrowup') || keysDown.has('w')) y -= 0.8;
      if (keysDown.has('arrowdown') || keysDown.has('s')) y += 0.8;

      onTiltChange(x, y);
      setTouchPos({ x: x * 35, y: y * 35 });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeControlMode, onTiltChange]);

  // Touch / Pointer Drag Handler on Virtual Tilt Pad
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateTouchTilt(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateTouchTilt(e);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setTouchPos({ x: 0, y: 0 });
    onTiltChange(0, 0);
  };

  const updateTouchTilt = (e: React.PointerEvent) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;

    setTouchPos({ x: dx * 0.7, y: dy * 0.7 });
    onTiltChange(normX, normY);
  };

  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-center pointer-events-auto">
      {/* On-Screen Virtual Tilt Joystick */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-28 h-28 rounded-full bg-slate-900/80 border-2 border-cyan-500/40 shadow-xl backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-cyan-400 transition-colors"
      >
        {/* Directional Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-slate-600 text-[10px] font-bold">
          <span>◀</span>
          <span>▶</span>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-between py-2 text-slate-600 text-[10px] font-bold">
          <span>▲</span>
          <span>▼</span>
        </div>

        {/* Joystick Center Knob */}
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_#38bdf8] flex items-center justify-center text-white text-xs font-bold transition-transform duration-75"
          style={{
            transform: `translate(${touchPos.x}px, ${touchPos.y}px)`,
          }}
        >
          <Compass className="w-5 h-5 text-white animate-spin-slow" />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
        <Smartphone className="w-3 h-3 text-cyan-400" />
        <span>Drag or Use Arrow Keys / Tilt</span>
      </div>
    </div>
  );
};
