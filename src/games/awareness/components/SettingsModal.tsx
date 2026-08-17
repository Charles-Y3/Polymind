import React, { useState } from 'react';
import { translations } from '../utils/i18n';
import { AppSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });

  const t = translations[localSettings.language];

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {t.settings}
            </h2>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>

        {/* Audio & Accessibility Toggles */}
        <div className="py-4 border-b border-slate-800 space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">{t.soundEffects}</span>
            <button
              id="settings-toggle-sound"
              type="button"
              onClick={() => setLocalSettings((p) => ({ ...p, sound: !p.sound }))}
              className={`w-12 h-6 rounded-full transition-all relative ${
                localSettings.sound ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-all ${
                  localSettings.sound ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">{t.highContrast}</span>
            <button
              id="settings-toggle-contrast"
              type="button"
              onClick={() => setLocalSettings((p) => ({ ...p, highContrast: !p.highContrast }))}
              className={`w-12 h-6 rounded-full transition-all relative ${
                localSettings.highContrast ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-all ${
                  localSettings.highContrast ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">{t.reducedMotion}</span>
            <button
              id="settings-toggle-motion"
              type="button"
              onClick={() => setLocalSettings((p) => ({ ...p, reducedMotion: !p.reducedMotion }))}
              className={`w-12 h-6 rounded-full transition-all relative ${
                localSettings.reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-all ${
                  localSettings.reducedMotion ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-3">
          <button
            id="settings-save-btn"
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
