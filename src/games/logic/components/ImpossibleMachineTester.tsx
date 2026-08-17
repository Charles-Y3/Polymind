import React, { useState } from 'react';
import { DistinguishingExperiment } from '../types';
import { sound } from '../utils/audio';
import { useI18n } from '../i18n/context';
import { TestTube, CheckCircle, ArrowRight } from 'lucide-react';

interface ImpossibleMachineTesterProps {
  hypothesisA: string;
  hypothesisB: string;
  experiments: DistinguishingExperiment[];
  correctHypothesis: 'A' | 'B';
  correctExperimentId: string;
  onSubmitDiscovery: (hypothesisChoice: 'A' | 'B', testedExperimentId: string) => void;
  disabled?: boolean;
}

export const ImpossibleMachineTester: React.FC<ImpossibleMachineTesterProps> = ({
  hypothesisA,
  hypothesisB,
  experiments,
  correctHypothesis,
  correctExperimentId,
  onSubmitDiscovery,
  disabled = false,
}) => {
  const { t } = useI18n();
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<'A' | 'B' | null>(null);
  const [testResultFeedback, setTestResultFeedback] = useState<string | null>(null);

  const activeExp = experiments.find((e) => e.id === selectedExpId);

  const handleRunExperiment = (exp: DistinguishingExperiment) => {
    if (disabled) return;
    sound.playMachineRun();
    setSelectedExpId(exp.id);
    setTestResultFeedback(exp.explanation);
  };

  const handleSelectHypothesis = (hyp: 'A' | 'B') => {
    if (disabled) return;
    sound.playClick();
    setSelectedHypothesis(hyp);
  };

  const handleSubmitFinalDiscovery = () => {
    if (!selectedHypothesis || !selectedExpId || disabled) return;
    sound.playClick();
    onSubmitDiscovery(selectedHypothesis, selectedExpId);
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 p-5 shadow-2xl space-y-5">
      <div className="text-center border-b border-slate-800 pb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold px-3 py-1 bg-amber-950/80 rounded-full border border-amber-500/40 flex items-center gap-1.5 w-max mx-auto">
          <TestTube className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('impossible.badge')}</span>
        </span>
        <h3 className="text-slate-100 text-base font-bold mt-2">
          {t('impossible.title')}
        </h3>
        <p className="text-slate-400 text-xs mt-1 max-w-xl mx-auto leading-relaxed">
          {t('impossible.subtitle')}
        </p>
      </div>

      {/* RIVAL HYPOTHESES CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          onClick={() => handleSelectHypothesis('A')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedHypothesis === 'A'
              ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">{t('impossible.hypA')}</span>
            {selectedHypothesis === 'A' && <CheckCircle className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">{hypothesisA}</div>
        </div>

        <div
          onClick={() => handleSelectHypothesis('B')}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedHypothesis === 'B'
              ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">{t('impossible.hypB')}</span>
            {selectedHypothesis === 'B' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
          </div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1">{hypothesisB}</div>
        </div>
      </div>

      {/* CHOOSE EXPERIMENT TO RUN */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase block">
          {t('impossible.step1')}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              disabled={disabled}
              onClick={() => handleRunExperiment(exp)}
              className={`p-3 rounded-lg border font-mono text-xs font-bold transition-all ${
                selectedExpId === exp.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>{exp.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                {t('impossible.ruleAOutcome')} {exp.hypothesisAOutcome.toString()} | {t('impossible.ruleBOutcome')} {exp.hypothesisBOutcome.toString()}
              </div>
            </button>
          ))}
        </div>

        {/* TEST OUTCOME DISPLAY */}
        {activeExp && (
          <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-lg text-xs font-mono text-slate-300 space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <TestTube className="w-3.5 h-3.5" />
              <span>{t('impossible.testResultFor')} {activeExp.input.toString()}</span>
            </div>
            <p className="text-slate-300">{testResultFeedback}</p>
          </div>
        )}
      </div>

      {/* SUBMIT DISCOVERY BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          disabled={!selectedHypothesis || !selectedExpId || disabled}
          onClick={handleSubmitFinalDiscovery}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>{t('impossible.submitBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
