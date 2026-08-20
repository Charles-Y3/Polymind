import { Award, Brain, Medal, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/context';
import { Grade, GRADES, PlayerProgress } from '../types';
import { Card, SegmentedTabs, Tile } from '../../../ui';
import { sound } from '../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

interface MainMenuProps {
  progress: PlayerProgress;
  onChangeGrade: (grade: Grade) => void;
  onStartHeists: () => void;
  onStartDaily: () => void;
  onStartGauntlet: () => void;
  onOpenPractice: () => void;
  onOpenMindProfile: () => void;
  onOpenBests: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
}

function ModeCard({
  emoji,
  title,
  desc,
  disabled,
  badge,
  onClick,
  delay = 0,
}: {
  emoji: string;
  title: string;
  desc: string;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 26 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={() => {
        if (disabled) return;
        sound.playClick();
        onClick();
      }}
      disabled={disabled}
      className="text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Card className="p-4 flex items-center gap-4 hover:border-violet-500/50 transition-colors">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
        </div>
        {badge && <div className="text-[10px] font-bold text-amber-300 border border-amber-500/30 rounded-full px-2 py-1">{badge}</div>}
      </Card>
    </motion.button>
  );
}

export function MainMenu({
  progress,
  onChangeGrade,
  onStartHeists,
  onStartDaily,
  onStartGauntlet,
  onOpenPractice,
  onOpenMindProfile,
  onOpenBests,
  onOpenAchievements,
  onOpenLeaderboard,
}: MainMenuProps) {
  const { t } = useI18n();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyDone = progress.lastDailyDate === todayStr;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full flex flex-col gap-5">
        <div className="shrink-0 flex flex-col items-center text-center pt-2 mb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-violet-400 text-xs font-semibold mb-2 shadow-lg">
            <span>🔐</span>
            <span>{t('brand.tagline')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            {t('menu.heroHeading')}
          </h1>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wide">{t('grade.select')}</p>
          <SegmentedTabs
            accent={ACCENT}
            value={progress.grade}
            onChange={onChangeGrade}
            options={GRADES.map((g) => ({ value: g, label: t(`grade.${g}` as any) }))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <ModeCard emoji="🎯" title={t('menu.heists')} desc={t('menu.heistsDesc')} onClick={onStartHeists} delay={0} />
          <ModeCard
            emoji="🗓️"
            title={t('menu.daily')}
            desc={dailyDone ? t('menu.dailyDone') : t('menu.dailyDesc')}
            disabled={dailyDone}
            badge={progress.dailyStreak > 0 ? `🔥${progress.dailyStreak}` : undefined}
            onClick={onStartDaily}
            delay={0.05}
          />
          <ModeCard
            emoji="♾️"
            title={t('menu.gauntlet')}
            desc={t('menu.gauntletDesc')}
            badge={progress.gauntletBest > 0 ? `${progress.gauntletBest}` : undefined}
            onClick={onStartGauntlet}
            delay={0.1}
          />
          <ModeCard emoji="🛠️" title={t('menu.practice')} desc={t('menu.practiceDesc')} onClick={onOpenPractice} delay={0.15} />
        </div>
      </div>

      <div className="shrink-0 w-full h-[68px] border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-2xl mx-auto h-full flex items-center gap-2 px-4">
          <Tile icon={<Brain className="w-5 h-5" />} label={t('nav.mindProfile')} onClick={onOpenMindProfile} accentText="text-violet-400" />
          <Tile icon={<Trophy className="w-5 h-5" />} label={t('nav.bests')} onClick={onOpenBests} accentText="text-amber-400" />
          <Tile icon={<Medal className="w-5 h-5" />} label={t('nav.leaderboard')} onClick={onOpenLeaderboard} accentText="text-cyan-400" />
          <Tile icon={<Award className="w-5 h-5" />} label={t('nav.achievements')} onClick={onOpenAchievements} accentText="text-purple-400" />
        </div>
      </div>
    </div>
  );
}
