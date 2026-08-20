import React from 'react';
import { ActivePowerUp } from '../types';
import { Pause, RotateCcw, Shield, Anchor, Zap, Magnet, Maximize2, ShieldAlert, Clock } from 'lucide-react';

interface TiltHUDProps {
  score: number;
  combo: number;
  lives: number;
  hasWalls: boolean;
  tiltX: number; // -1 to +1
  tiltY: number; // -1 to +1
  activePowerUps: ActivePowerUp[];
  stageTitle: string;
  // Seconds left to clear the stage (campaign only). Undefined hides the chip.
  secondsToClear?: number;
  onPause: () => void;
  onCalibrate: () => void;
}

export const TiltHUD: React.FC<TiltHUDProps> = ({
  score,
  combo,
  lives,
  hasWalls,
  tiltX,
  tiltY,
  activePowerUps,
  stageTitle,
  secondsToClear,
  onPause,
  onCalibrate,
}) => {
  // Bubble level position offset (-1..1 mapped to pixels inside bubble ring)
  const bubbleX = Math.min(Math.max(tiltX * 24, -24), 24);
  const bubbleY = Math.min(Math.max(tiltY * 24, -24), 24);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Stage Name & Score */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/50 backdrop-blur-md w-fit">
            {stageTitle}
          </span>
          {secondsToClear !== undefined && (
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-700/50 backdrop-blur-md w-fit mt-0.5">
              <Clock className="w-3 h-3" />
              Clear in {secondsToClear}s
            </span>
          )}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono">
              {score.toLocaleString()}
            </span>
            {combo > 1 && (
              <span className="text-sm font-extrabold text-amber-400 animate-pulse bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600">
                {combo}x COMBO!
              </span>
            )}
          </div>
        </div>

        {/* Artificial Horizon Bubble Level */}
        <div className="flex items-center gap-3">
          <div className="pointer-events-auto flex flex-col items-center">
            <div 
              onClick={onCalibrate}
              title="Click to Calibrate Tilt Zero"
              className="relative w-14 h-14 rounded-full bg-slate-900/90 border-2 border-slate-700/80 flex items-center justify-center shadow-lg backdrop-blur-md cursor-pointer hover:border-cyan-400 transition-colors group"
            >
              {/* Crosshair target lines */}
              <div className="absolute w-full h-[1px] bg-slate-700/60" />
              <div className="absolute h-full w-[1px] bg-slate-700/60" />
              <div className="w-8 h-8 rounded-full border border-cyan-500/30 border-dashed" />

              {/* Moving Tilt Bubble */}
              <div
                className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] transition-transform duration-75"
                style={{
                  transform: `translate(${bubbleX}px, ${bubbleY}px)`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 group-hover:text-cyan-300">
              Calibrate
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Middle HUD: Lives / Hearts */}
      {hasWalls && (
        <div className="flex items-center gap-1.5 self-start bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform duration-300 ${
                i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-30 grayscale'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      {/* Bottom HUD: Active Power-Ups Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {activePowerUps.map((pwr) => {
          const timeLeftSec = Math.max(Math.ceil((pwr.endTime - Date.now()) / 1000), 0);
          return (
            <div
              key={pwr.type}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md text-white text-xs font-bold shadow-lg animate-fade-in"
            >
              {pwr.type === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
              {pwr.type === 'anchor' && <Anchor className="w-4 h-4 text-amber-400" />}
              {pwr.type === 'slow_mo' && <Zap className="w-4 h-4 text-cyan-300" />}
              {pwr.type === 'magnet' && <Magnet className="w-4 h-4 text-purple-400" />}
              {pwr.type === 'safety_net' && <ShieldAlert className="w-4 h-4 text-emerald-400" />}
              {pwr.type === 'shrink' && <Maximize2 className="w-4 h-4 text-pink-400" />}
              <span className="capitalize">{pwr.type.replace('_', ' ')}</span>
              <span className="text-cyan-400 font-mono ml-1">{timeLeftSec}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
