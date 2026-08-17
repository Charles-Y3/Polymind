import React from 'react';
import { Play, RotateCcw, Home, Sliders, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenGyroSettings: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  soundEnabled,
  onToggleSound,
  onResume,
  onRestart,
  onOpenGyroSettings,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-white text-center">
        <h2 className="text-2xl font-black tracking-tight text-white">GAME PAUSED</h2>
        <p className="text-xs text-slate-400">Take a breath and adjust your balance</p>

        <div className="flex flex-col gap-2.5 mt-2">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Game</span>
          </button>

          {/* Restart Stage */}
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Restart Level</span>
          </button>

          {/* Gyro Calibration */}
          <button
            onClick={onOpenGyroSettings}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Tilt & Sensitivity</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Sound: Enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Sound: Muted</span>
              </>
            )}
          </button>

          {/* Main Menu */}
          <button
            onClick={onHome}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-800"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
