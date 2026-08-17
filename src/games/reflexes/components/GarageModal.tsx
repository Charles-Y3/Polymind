import React from 'react';
import { BallSkin } from '../types';
import { BALL_SKINS } from '../data/skins';
import { Sparkles, Lock, Check, X } from 'lucide-react';

interface GarageModalProps {
  currentSkinId: string;
  unlockedSkins: string[];
  onSelectSkin: (skinId: string) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  currentSkinId,
  unlockedSkins,
  onSelectSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ball Customizer</h2>
              <p className="text-xs text-slate-400">Unlock unique sphere skins & particle trails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {BALL_SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = currentSkinId === skin.id;

            return (
              <button
                key={skin.id}
                onClick={() => {
                  if (isUnlocked) onSelectSkin(skin.id);
                }}
                disabled={!isUnlocked}
                className={`relative p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : isUnlocked
                    ? 'bg-slate-800/50 border-slate-700/60 hover:border-slate-500'
                    : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Visual Ball Sphere Preview */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg relative overflow-hidden border border-white/20"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${skin.color} 50%, ${skin.accentColor} 100%)`,
                      boxShadow: `0 0 16px ${skin.glowColor}`,
                    }}
                  >
                    <span>{skin.icon}</span>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-cyan-500 text-slate-950 shadow-md">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="p-1.5 rounded-full bg-slate-800 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm tracking-tight">{skin.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                    {isUnlocked ? `Trail: ${skin.trailType.toUpperCase()}` : skin.unlockCriteria}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
