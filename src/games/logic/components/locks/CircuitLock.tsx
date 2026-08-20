import { useState } from 'react';
import { evaluateCircuitFull } from '../../engine/locks/circuit';
import { useI18n } from '../../i18n/context';
import { CircuitPuzzle } from '../../types';
import { PrimaryButton } from '../../../../ui';
import { sound } from '../../utils/audio';

const ACCENT = { from: 'from-violet-500', to: 'to-purple-600', text: 'text-violet-300', ring: 'ring-violet-500/40' };

export function CircuitLock({ puzzle, disabled, onSubmit }: { puzzle: CircuitPuzzle; disabled: boolean; onSubmit: (answer: boolean[]) => void }) {
  const { t } = useI18n();
  const [switches, setSwitches] = useState<boolean[]>(() => Array(puzzle.inputIds.length).fill(false));
  const [probesLeft, setProbesLeft] = useState(puzzle.probes ?? 0);
  const [showSignals, setShowSignals] = useState(false);
  // The output lamp is only revealed briefly right after a submit attempt — never live —
  // so players have to reason from the gate clues instead of toggling switches until it goes green.
  const [revealedOutput, setRevealedOutput] = useState<boolean | null>(null);

  const nodeValues = evaluateCircuitFull(puzzle.inputIds, puzzle.gates, switches);

  const handleProbe = () => {
    if (probesLeft <= 0) return;
    sound.playClick();
    setProbesLeft((p) => p - 1);
    setShowSignals(true);
    window.setTimeout(() => setShowSignals(false), 2000);
  };

  const handleSetSwitch = (idx: number) => {
    sound.playClick();
    setRevealedOutput(null);
    setSwitches(switches.map((v, i) => (i === idx ? !v : v)));
  };

  const handleSubmitClick = () => {
    sound.playClick();
    setRevealedOutput(nodeValues.get(puzzle.outputId) ?? false);
    window.setTimeout(() => setRevealedOutput(null), 1200);
    onSubmit(switches);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-400">{t('circuit.instructions')}</p>

      <div className="flex flex-wrap gap-2">
        {puzzle.inputIds.map((id, i) => (
          <button
            key={id}
            disabled={disabled}
            onClick={() => handleSetSwitch(i)}
            className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
              switches[i] ? 'bg-violet-500/20 border-violet-500 text-violet-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            S{i + 1}: {switches[i] ? 'ON' : 'OFF'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-1.5">
        {puzzle.gates.map((gate) => {
          const label = (id: string) => (id.startsWith('in-') ? `S${puzzle.inputIds.indexOf(id) + 1}` : `G${puzzle.gates.findIndex((g) => g.id === id) + 1}`);
          const val = showSignals ? nodeValues.get(gate.id) : undefined;
          return (
            <p key={gate.id} className="text-xs text-slate-300 font-mono">
              G{puzzle.gates.indexOf(gate) + 1} = {gate.kind}({gate.inputs.map(label).join(', ')})
              {val !== undefined && <span className={val ? 'text-emerald-400' : 'text-red-400'}> → {val ? '1' : '0'}</span>}
            </p>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
            revealedOutput === null
              ? 'bg-slate-900 border-slate-700 text-slate-600'
              : revealedOutput
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                : 'bg-red-500/20 border-red-500 text-red-300'
          }`}
        >
          {revealedOutput === null ? '?' : revealedOutput ? '1' : '0'}
        </div>
        <span className="text-xs text-slate-500">{t('circuit.output')}</span>
        {puzzle.probes! > 0 && (
          <button onClick={handleProbe} disabled={disabled || probesLeft <= 0} className="ml-auto text-xs font-semibold text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed">
            {t('session.probes')}: {probesLeft}
          </button>
        )}
      </div>

      <PrimaryButton accent={ACCENT} disabled={disabled} onClick={handleSubmitClick}>
        {t('session.submit')}
      </PrimaryButton>
    </div>
  );
}
