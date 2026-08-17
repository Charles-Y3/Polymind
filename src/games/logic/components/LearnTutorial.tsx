import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { BookOpen, ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface LearnTutorialProps {
  onStartJourney: () => void;
}

export const LearnTutorial: React.FC<LearnTutorialProps> = ({ onStartJourney }) => {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: t('learn.step1Title'),
      subtitle: t('learn.step1Subtitle'),
      icon: '⚙️',
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            {t('learn.step1P1')}
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center font-mono">
            <div className="text-cyan-400 font-bold">2 → 5</div>
            <div className="text-cyan-400 font-bold">3 → 7</div>
            <div className="text-cyan-400 font-bold">4 → 9</div>
            <div className="text-amber-400 font-bold mt-2">6 → ?</div>
          </div>
          <p>
            {t('learn.step1P2')}
          </p>
        </div>
      ),
    },
    {
      title: t('learn.step2Title'),
      subtitle: t('learn.step2Subtitle'),
      icon: '🔀',
      content: (
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-cyan-400 block mb-1">{t('learn.mode1Title')}</strong>
              {t('learn.mode1Desc')}
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">{t('learn.mode2Title')}</strong>
              {t('learn.mode2Desc')}
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-amber-400 block mb-1">{t('learn.mode3Title')}</strong>
              {t('learn.mode3Desc')}
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-rose-400 block mb-1">{t('learn.mode4Title')}</strong>
              {t('learn.mode4Desc')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('learn.step3Title'),
      subtitle: t('learn.step3Subtitle'),
      icon: '🧠',
      content: (
        <div className="space-y-2 text-slate-300 text-sm leading-relaxed">
          <ul className="space-y-2 text-xs font-mono">
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
              <span>{t('learn.stage1')}</span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
              <span>{t('learn.stage2')}</span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
              <span>{t('learn.stage3')}</span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-950 text-rose-400 font-bold flex items-center justify-center shrink-0">4</span>
              <span>{t('learn.stage4')}</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold font-mono text-cyan-200">
              {t('learn.title')}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {t('learn.stepCounter', { current: activeStep + 1, total: steps.length })}
          </span>
        </div>

        {/* Step Card Content */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold font-mono text-cyan-300">
            <span>{steps[activeStep].icon}</span>
            <span>{steps[activeStep].title}</span>
          </div>
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {steps[activeStep].subtitle}
          </h4>
          <div className="pt-2">{steps[activeStep].content}</div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={activeStep === 0}
            onClick={() => { sound.playClick(); setActiveStep((s) => s - 1); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('learn.prev')}</span>
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => { sound.playClick(); setActiveStep((s) => s + 1); }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>{t('learn.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { sound.playClick(); onStartJourney(); }}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>{t('learn.startJourney')}</span>
              <Play className="w-4 h-4 fill-slate-950" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
