import React, { useState } from 'react';
import { GameMode, LevelConfig, PlayerStats, PowerUpType } from '../types';
import { CAMPAIGN_LEVELS } from '../data/levels';
import { 
  Play, 
  Infinity as EndlessIcon, 
  Trophy, 
  Sparkles, 
  Award, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Star, 
  Lock, 
  Smartphone,
  ChevronRight,
  Info,
  Shield,
  Anchor,
  Magnet,
  Zap,
  Clock,
  Shuffle,
  LifeBuoy,
  Ban
} from 'lucide-react';
import { STARTER_POWERUPS, getUnlockedStarterPowerUps } from '../data/starterLoadouts';
import { TopBar, StatChip, Tile, SegmentedTabs } from '../../../ui';
import { getGame } from '../../../shell/games';
import { t, getLevelText } from '../utils/i18n';

const ACCENT = getGame('reflexes').accent;

interface MainMenuProps {
  stats: PlayerStats;
  selectedStarterPowerUp: PowerUpType | 'none';
  onSelectStarterPowerUp: (pwr: PowerUpType | 'none') => void;
  onStartGame: (mode: GameMode, level: LevelConfig) => void;
  onOpenLeaderboard: () => void;
  onOpenGarage: () => void;
  onOpenAchievements: () => void;
  onOpenGyroSettings: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  selectedStarterPowerUp,
  onSelectStarterPowerUp,
  onStartGame,
  onOpenLeaderboard,
  onOpenGarage,
  onOpenAchievements,
  onOpenGyroSettings,
  onToggleSound,
}) => {
  const [selectedTab, setSelectedTab] = useState<'campaign' | 'endless' | 'zen'>('campaign');
  const lang = stats.language;

  const starValues = Object.values(stats.starsEarned || {}) as number[];
  const totalStars = starValues.reduce((a, b) => a + b, 0);
  const hasThreeStarReward = starValues.some((s) => s >= 3) || totalStars >= 3;

  const unlockedStarterTypes = getUnlockedStarterPowerUps(stats.starsEarned);
  const unlockedCount = unlockedStarterTypes.length;

  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'shield': return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      case 'anchor': return <Anchor className="w-3.5 h-3.5 text-amber-400" />;
      case 'magnet': return <Magnet className="w-3.5 h-3.5 text-purple-400" />;
      case 'slow_mo': return <Clock className="w-3.5 h-3.5 text-sky-400" />;
      case 'score_multiplier': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'safety_net': return <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white relative overflow-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar: Profile & Quick Controls */}
      <TopBar
        title={t(lang, 'gameTitle')}
        icon="⚡"
        accent={ACCENT}
        sticky={false}
        leftSlot={<StatChip icon={<Star className="w-3.5 h-3.5 fill-current" />} value={totalStars} label={t(lang, 'stars')} accent={{...ACCENT, text: 'text-amber-300'}} />}
        rightSlot={
          <>
            <button
              onClick={onToggleSound}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg backdrop-blur-md"
              aria-label={t(lang, 'toggleSound')}
            >
              {stats.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onOpenGyroSettings}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg backdrop-blur-md"
              aria-label={t(lang, 'tiltSettings')}
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          </>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto relative z-10">
      <div className="max-w-2xl mx-auto w-full flex flex-col p-4 sm:p-6">

      {/* Hero Title Section */}
      <div className="shrink-0 flex flex-col items-center text-center my-3 sm:my-4">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[11px] font-bold mb-1 shadow-lg">
          <Smartphone className="w-3 h-3 animate-bounce" />
          <span>{t(lang, 'tagline')}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
          {t(lang, 'heroHook')}
        </h1>
      </div>

      {/* Mode Selector Tabs */}
      <div className="shrink-0 w-full">
        <SegmentedTabs<'campaign' | 'endless' | 'zen'>
          accent={ACCENT}
          value={selectedTab}
          onChange={setSelectedTab}
          options={[
            {value: 'campaign', label: t(lang, 'campaign')},
            {value: 'endless', label: t(lang, 'endless')},
            {value: 'zen', label: t(lang, 'zenPractice')},
          ]}
        />
      </div>

      {/* Main Mode Content Area */}
      <div className="w-full mt-3 space-y-3">
        {selectedTab === 'campaign' && (
          <div className="space-y-3">
            {/* 3-Star Reward Starter Power-Up Loadout Selector */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {t(lang, 'starterLoadoutTitle')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
                  {unlockedCount} / {STARTER_POWERUPS.length} {t(lang, 'starterLoadoutUnlocked')}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mb-2">
                {t(lang, 'starterLoadoutDesc')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {/* Option 1: None */}
                <button
                  onClick={() => onSelectStarterPowerUp('none')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedStarterPowerUp === 'none'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t(lang, 'none')}</span>
                </button>

                {/* Option 2: Random (unlocked if at least 1 stage has 3 stars) */}
                <button
                  disabled={unlockedCount === 0}
                  onClick={() => unlockedCount > 0 && onSelectStarterPowerUp('random')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedStarterPowerUp === 'random'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : unlockedCount > 0
                      ? 'bg-slate-900/80 border-slate-800 text-purple-300 hover:text-white hover:border-slate-700'
                      : 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                  title={unlockedCount === 0 ? t(lang, 'randomLocked') : t(lang, 'randomHint')}
                >
                  <Shuffle className={`w-3.5 h-3.5 ${unlockedCount > 0 ? 'text-purple-400' : 'text-slate-600'}`} />
                  <span>{t(lang, 'random')}</span>
                  {unlockedCount === 0 && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
                </button>

                {/* Option 3-N: Stage Specific Unlocks */}
                {STARTER_POWERUPS.map((item) => {
                  const isUnlocked = (stats.starsEarned?.[item.stageId] || 0) >= 3;
                  const isSelected = selectedStarterPowerUp === item.type;

                  return (
                    <button
                      key={item.stageId}
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && onSelectStarterPowerUp(item.type)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-1 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : isUnlocked
                          ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700'
                          : 'bg-slate-950/60 border-slate-900 text-slate-500 cursor-not-allowed opacity-75'
                      }`}
                      title={isUnlocked ? item.description : t(lang, 'unlockHint', {stage: String(item.stageId), label: item.label})}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {getPowerUpIcon(item.type)}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {!isUnlocked && (
                        <span className="text-[9px] font-extrabold text-amber-500/90 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-800/40 flex items-center gap-0.5 shrink-0">
                          <Lock className="w-2.5 h-2.5" /> 3★ St.{item.stageId}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage List */}
            {CAMPAIGN_LEVELS.map((level, idx) => {
              const starsEarned = Number(stats.starsEarned?.[level.id] || (stats.starsEarned as any)?.[String(level.id)] || 0);
              const prevLevel = idx > 0 ? CAMPAIGN_LEVELS[idx - 1] : null;
              const prevStars = prevLevel ? Number(stats.starsEarned?.[prevLevel.id] || (stats.starsEarned as any)?.[String(prevLevel.id)] || 0) : 0;
              const isUnlocked = level.unlockedByDefault || idx === 0 || prevStars > 0;
              const levelText = getLevelText(lang, level.id);

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (isUnlocked) onStartGame('campaign', level);
                  }}
                  disabled={!isUnlocked}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/80 hover:bg-slate-800/80 shadow-md group'
                      : 'bg-slate-900/30 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {levelText.title}
                      </span>
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{levelText.description}</p>

                    {/* Star ratings */}
                    {isUnlocked && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= starsEarned ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {isUnlocked && (
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedTab === 'endless' && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-lg">
              <EndlessIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t(lang, 'endlessTitle')}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {t(lang, 'endlessDesc')}
              </p>
            </div>

            <div className="w-full p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">{t(lang, 'highestScore')}</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {(stats.highestScore || 0).toLocaleString()} PTS
              </span>
            </div>

            <button
              onClick={() => onStartGame('endless', CAMPAIGN_LEVELS[2])}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t(lang, 'startEndless')}</span>
            </button>
          </div>
        )}

        {selectedTab === 'zen' && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 shadow-lg">
              <Info className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t(lang, 'zenTitle')}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {t(lang, 'zenDesc')}
              </p>
            </div>

            <button
              onClick={() => onStartGame('zen', CAMPAIGN_LEVELS[0])}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t(lang, 'startZen')}</span>
            </button>
          </div>
        )}
      </div>

      </div>
      </div>

      {/* Lowest Panel: Customizer, Leaderboard, Badges (Fixed at bottom) */}
      <div className="shrink-0 relative z-10 w-full h-[68px] border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-2xl mx-auto h-full flex items-center gap-3 px-3 sm:px-4">
          <Tile icon={<Sparkles className="w-5 h-5" />} label={t(lang, 'customizer')} onClick={onOpenGarage} accentText={ACCENT.text} />
          <Tile icon={<Trophy className="w-5 h-5" />} label={t(lang, 'leaderboard')} onClick={onOpenLeaderboard} accentText="text-amber-400" />
          <Tile icon={<Award className="w-5 h-5" />} label={t(lang, 'badges')} onClick={onOpenAchievements} accentText="text-purple-400" />
        </div>
      </div>
    </div>
  );
};
