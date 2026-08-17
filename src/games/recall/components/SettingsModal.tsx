import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Music, Sparkles, ShieldAlert, Type, Key, Lock, Eye, EyeOff, Check, AlertCircle, ExternalLink, RefreshCw, Trash2, ShieldCheck, Unlock } from 'lucide-react';
import { AgeTier, BgmMode, FontSize, Language, PlayerStats } from '../types';
import { soundManager } from '../utils/audio';
import { t } from '../utils/i18n';
import { loadSettings, saveSettings } from '../utils/storage';
import { encryptApiKeyLocally, decryptApiKeyLocally } from '../utils/crypto';

interface SettingsModalProps {
  language: Language;
  soundEnabled: boolean;
  bgmMode: BgmMode;
  fontSize: FontSize;
  ageTier: AgeTier;
  stats: PlayerStats;
  customApiKey?: string;
  onToggleSound: () => void;
  onChangeBgmMode: (mode: BgmMode) => void;
  onChangeFontSize: (size: FontSize) => void;
  onChangeAgeTier: (tier: AgeTier) => void;
  onChangeCustomApiKey: (key: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  soundEnabled,
  bgmMode,
  fontSize,
  ageTier,
  customApiKey = '',
  onToggleSound,
  onChangeBgmMode,
  onChangeFontSize,
  onChangeAgeTier,
  onChangeCustomApiKey,
  onClose,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isEncryptedInStorage, setIsEncryptedInStorage] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state with storage on mount
  useEffect(() => {
    const s = loadSettings();
    if (s.isKeyEncrypted && s.encryptedApiKeyPayload) {
      setIsEncryptedInStorage(true);
    } else {
      setIsEncryptedInStorage(false);
    }
  }, []);

  const handleEncryptAndSave = async () => {
    const cleanKey = apiKeyInput.trim() || customApiKey;
    const cleanPassphrase = passphraseInput.trim();

    if (!cleanKey) {
      setFeedbackNotice({
        type: 'error',
        message: t(language, 'apiKeyRequired'),
      });
      return;
    }

    if (!cleanPassphrase || cleanPassphrase.length < 4) {
      setFeedbackNotice({
        type: 'error',
        message: t(language, 'apiPassphraseRequired'),
      });
      return;
    }

    soundManager.playTap();
    setIsEncrypting(true);
    setFeedbackNotice(null);

    try {
      const encryptedPayload = await encryptApiKeyLocally(cleanKey, cleanPassphrase);
      const current = loadSettings();
      const updated = {
        ...current,
        customGeminiApiKey: '', // Stored strictly encrypted, never plaintext in localStorage
        isKeyEncrypted: true,
        encryptedApiKeyPayload: encryptedPayload,
      };
      saveSettings(updated);
      onChangeCustomApiKey(cleanKey); // Active in runtime memory
      setIsEncryptedInStorage(true);
      soundManager.playCorrect();
      setFeedbackNotice({
        type: 'success',
        message: t(language, 'passphraseSaved'),
      });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch {
      soundManager.playWrong();
      setFeedbackNotice({
        type: 'error',
        message: language.startsWith('zh') ? '加密失败，请重试' : 'Encryption failed. Please try again.',
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleUnlockWithPassphrase = async () => {
    const cleanPassphrase = passphraseInput.trim();
    if (!cleanPassphrase) {
      setFeedbackNotice({
        type: 'error',
        message: language.startsWith('zh') ? '请输入解密口令' : 'Please enter your decryption passphrase.',
      });
      return;
    }

    const current = loadSettings();
    if (!current.encryptedApiKeyPayload) {
      setFeedbackNotice({
        type: 'error',
        message: language.startsWith('zh') ? '未找到已加密的密钥' : 'No encrypted key payload found.',
      });
      return;
    }

    soundManager.playTap();
    setIsDecrypting(true);
    setFeedbackNotice(null);

    try {
      const decrypted = await decryptApiKeyLocally(current.encryptedApiKeyPayload, cleanPassphrase);
      if (decrypted && decrypted.trim().length > 0) {
        onChangeCustomApiKey(decrypted);
        setApiKeyInput(decrypted);
        soundManager.playCorrect();
        setFeedbackNotice({
          type: 'success',
          message: t(language, 'passphraseValid'),
        });
        setTimeout(() => setFeedbackNotice(null), 3500);
      } else {
        throw new Error('Empty decrypted key');
      }
    } catch {
      soundManager.playWrong();
      setFeedbackNotice({
        type: 'error',
        message: t(language, 'passphraseInvalid'),
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleClearKey = () => {
    soundManager.playTap();
    setApiKeyInput('');
    setPassphraseInput('');
    const current = loadSettings();
    const updated = {
      ...current,
      customGeminiApiKey: '',
      isKeyEncrypted: false,
      encryptedApiKeyPayload: undefined,
    };
    saveSettings(updated);
    onChangeCustomApiKey('');
    setIsEncryptedInStorage(false);
    setTestResult(null);
    setFeedbackNotice(null);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim() || customApiKey;
    if (!keyToTest) {
      setTestResult({
        status: 'error',
        message: language.startsWith('zh') ? '请先输入或解锁 API 密钥' : 'Please enter or unlock an API key first.',
      });
      return;
    }

    soundManager.playTap();
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({ customApiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        soundManager.playCorrect();
        setTestResult({
          status: 'success',
          message: data.message || t(language, 'apiKeyStatusValid'),
        });
      } else {
        soundManager.playWrong();
        setTestResult({
          status: 'error',
          message: data.error || t(language, 'apiKeyStatusInvalid'),
        });
      }
    } catch {
      soundManager.playWrong();
      setTestResult({
        status: 'error',
        message: 'Network error contacting verification endpoint.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{t(language, 'settingsTitle')}</h2>
              <p className="text-xs text-slate-400">{t(language, 'settingsSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Sound Effects Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t(language, 'soundEffects')}</div>
              <div className="text-[11px] text-slate-500">{soundEnabled ? t(language, 'soundOn') : t(language, 'soundOff')}</div>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onToggleSound();
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${soundEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 2. 3-Way BGM Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-purple-400" />
              {t(language, 'bgmMode')}
            </span>
            <span className="text-[11px] font-medium text-purple-400/80">
              {bgmMode === 'off' ? t(language, 'bgmOff') : bgmMode === 'calm' ? t(language, 'bgmCalm') : t(language, 'bgmArcade')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'off' as BgmMode, label: t(language, 'bgmOff'), desc: 'Muted' },
              { id: 'calm' as BgmMode, label: t(language, 'bgmCalm'), desc: 'Lo-Fi Chill' },
              { id: 'arcade' as BgmMode, label: t(language, 'bgmArcade'), desc: 'Synth Beat' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={async () => {
                  soundManager.playTap();
                  await soundManager.unlockAudio();
                  onChangeBgmMode(item.id);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  bgmMode === item.id
                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Font Size Adjuster */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-400" />
              {t(language, 'fontSize')}
            </span>
            <span className="text-[11px] font-medium text-emerald-400/80">
              {fontSize === 'normal' ? '100%' : fontSize === 'large' ? '115%' : '130%'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal' as FontSize, label: t(language, 'fontSizeNormal'), symbol: 'Aa', sizeClass: 'text-xs' },
              { id: 'large' as FontSize, label: t(language, 'fontSizeLarge'), symbol: 'Aa+', sizeClass: 'text-sm' },
              { id: 'xl' as FontSize, label: t(language, 'fontSizeXl'), symbol: 'Aa++', sizeClass: 'text-base font-black' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playTap();
                  onChangeFontSize(item.id);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  fontSize === item.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <div className={`font-mono text-emerald-400 font-bold ${item.sizeClass}`}>{item.symbol}</div>
                <div className="text-[10px] font-bold leading-tight">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Age Tier Mode */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            {t(language, 'selectAgeTierMode')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'kids' as AgeTier, label: t(language, 'kidsTierShort'), icon: '🌱' },
              { id: 'teen' as AgeTier, label: t(language, 'teenTierShort'), icon: '⚡' },
              { id: 'adult' as AgeTier, label: t(language, 'adultTierShort'), icon: '🧠' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => {
                  soundManager.playTap();
                  onChangeAgeTier(tier.id);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  ageTier === tier.id
                    ? 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-md shadow-orange-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <div className="text-sm">{tier.icon}</div>
                <div className="text-[11px] font-bold mt-1 leading-tight">{tier.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Personal Gemini API Key & Local AES-256 Passphrase Encryption */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-950 border border-indigo-500/30 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{t(language, 'apiKeySettingsTitle')}</span>
                  {customApiKey ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  ) : isEncryptedInStorage ? (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      LOCKED
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded border border-slate-700">
                      OPTIONAL
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {(customApiKey || isEncryptedInStorage) && (
              <button
                onClick={handleClearKey}
                title={t(language, 'clearApiKey')}
                className="text-[10px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t(language, 'clearApiKey')}</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {t(language, 'apiKeySettingsDesc')}
          </p>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <span>Gemini API Key</span>
              {customApiKey && (
                <span className="text-[9px] text-emerald-400 font-normal">({t(language, 'keyActiveInMemory')})</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={t(language, 'apiKeyPlaceholder')}
                className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Local Passphrase Input for AES-256 Encryption / Decryption */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t(language, 'apiPassphraseTitle')}</span>
              </label>
              {isEncryptedInStorage && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  AES-256
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              {t(language, 'apiPassphraseDesc')}
            </p>

            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder={t(language, 'apiPassphrasePlaceholder')}
                className="w-full bg-slate-900 border border-amber-500/30 rounded-xl pl-3 pr-10 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
              >
                {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* If key is encrypted in storage and not yet unlocked in memory, provide Unlock button */}
            {isEncryptedInStorage && !customApiKey && (
              <button
                type="button"
                onClick={handleUnlockWithPassphrase}
                disabled={isDecrypting || !passphraseInput.trim()}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <Unlock className={`w-3.5 h-3.5 ${isDecrypting ? 'animate-spin' : ''}`} />
                <span>{isDecrypting ? t(language, 'decrypting') : t(language, 'testPassphrase')}</span>
              </button>
            )}
          </div>

          {/* Action Buttons: Save & Encrypt API Key, Test */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleEncryptAndSave}
              disabled={isEncrypting || (!apiKeyInput.trim() && !customApiKey) || !passphraseInput.trim()}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow shadow-amber-600/20 active:scale-[0.99]"
            >
              <Lock className={`w-3.5 h-3.5 ${isEncrypting ? 'animate-spin' : ''}`} />
              <span>{isEncrypting ? t(language, 'encrypting') : t(language, 'savePassphrase')}</span>
            </button>

            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTestingKey || (!apiKeyInput.trim() && !customApiKey)}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
              <span>{isTestingKey ? t(language, 'testingApiKey') : t(language, 'testApiKey')}</span>
            </button>
          </div>

          {/* Feedback notice banner */}
          {feedbackNotice && (
            <div
              className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                feedbackNotice.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {feedbackNotice.type === 'success' ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{feedbackNotice.message}</span>
            </div>
          )}

          {/* Test result status badge */}
          {testResult && (
            <div
              className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                testResult.status === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.status === 'success' ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Privacy & Link Footer */}
          <div className="pt-1 flex flex-col gap-1 text-[10px]">
            <span className="text-slate-400">
              {t(language, 'apiKeyStoredLocallyNotice')}
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 hover:underline pt-0.5"
            >
              <span>{t(language, 'getFreeApiKeyLink')}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
        >
          {t(language, 'done')}
        </button>
      </div>
    </div>
  );
};
