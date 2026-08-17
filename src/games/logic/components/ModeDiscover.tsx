import React, { useState, useEffect } from 'react';
import { PuzzleDataValue, PuzzleExample } from '../types';
import { sound } from '../utils/audio';
import { Play, FlaskConical, History, CheckCircle2, Send } from 'lucide-react';

interface ModeDiscoverProps {
  questionInput: PuzzleDataValue;
  expectedOutput?: PuzzleDataValue;
  ruleEvaluator?: (input: any) => any;
  onSubmitAnswer: (answer: PuzzleDataValue) => void;
  onRunTestInput?: (testInput: PuzzleDataValue, testOutput: PuzzleDataValue) => void;
  disabled?: boolean;
}

export const ModeDiscover: React.FC<ModeDiscoverProps> = ({
  questionInput,
  expectedOutput,
  ruleEvaluator,
  onSubmitAnswer,
  onRunTestInput,
  disabled = false,
}) => {
  const [testInputVal, setTestInputVal] = useState('');
  const [testLogs, setTestLogs] = useState<PuzzleExample[]>([]);
  const [finalAnswerInput, setFinalAnswerInput] = useState('');

  // Clear inputs and logs when moving to a new question or enabling interactive mode
  useEffect(() => {
    if (!disabled) {
      setTestInputVal('');
      setTestLogs([]);
      setFinalAnswerInput('');
    }
  }, [questionInput, disabled]);

  // Default evaluator fallback if ruleEvaluator is not explicitly defined in puzzle
  const safeEval = (inp: number): number => {
    if (ruleEvaluator) return ruleEvaluator(inp);
    if (typeof expectedOutput === 'number') {
      return expectedOutput;
    }
    return inp * 2;
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInputVal.trim() || disabled) return;
    sound.playMachineRun();

    const numInp = Number(testInputVal.trim());
    const validInp = !isNaN(numInp) ? numInp : testInputVal.trim();

    // Calculate machine output
    let outVal: any = '?';
    if (typeof validInp === 'number') {
      outVal = safeEval(validInp);
    } else {
      outVal = validInp;
    }

    const newLog: PuzzleExample = {
      input: validInp,
      output: outVal,
      notes: 'Experimental Test Run',
    };

    setTestLogs((prev) => [newLog, ...prev]);
    if (onRunTestInput) {
      onRunTestInput(validInp, outVal);
    }
    setTestInputVal('');
  };

  const handleSubmitFinalAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAnswerInput.trim() || disabled) return;
    sound.playClick();

    const num = Number(finalAnswerInput.trim());
    if (!isNaN(num)) {
      onSubmitAnswer(num);
    } else {
      onSubmitAnswer(finalAnswerInput.trim());
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold px-2.5 py-1 bg-rose-950/60 rounded-full border border-rose-500/30">
          MODE 4 — EXPERIMENTAL DISCOVERY LAB
        </span>
        <h4 className="text-slate-200 text-sm mt-2 font-medium">
          Send test inputs into the machine to observe its behavior and crack the hidden rule!
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TEST BENCH INPUT CONTROLLER */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
            <FlaskConical className="w-4 h-4" />
            <span>TEST MACHINE CONTROLLER</span>
          </div>

          <form onSubmit={handleRunTest} className="flex gap-2">
            <input
              type="text"
              disabled={disabled}
              value={testInputVal}
              onChange={(e) => setTestInputVal(e.target.value)}
              placeholder="Enter test input (e.g. 5, 10)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-200 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!testInputVal.trim() || disabled}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold font-mono text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>RUN TEST</span>
            </button>
          </form>

          {/* RUN HISTORY LOG TABLE */}
          <div className="mt-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5 font-bold flex items-center gap-1">
              <History className="w-3 h-3 text-rose-400" /> EXPERIMENT HISTORY ({testLogs.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {testLogs.length === 0 ? (
                <div className="text-xs text-slate-600 font-mono italic p-2 bg-slate-900/50 rounded border border-slate-800 text-center">
                  No tests run yet. Type a test input above!
                </div>
              ) : (
                testLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-400">In: <strong className="text-cyan-300">{log.input.toString()}</strong></span>
                    <span className="text-rose-400 font-bold">➔</span>
                    <span className="text-slate-400">Out: <strong className="text-emerald-300">{log.output.toString()}</strong></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT FINAL ANSWER FOR QUESTION */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>SOLVE QUESTION INPUT: {questionInput.toString()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Based on your experiments, what output will the machine produce for <strong className="text-cyan-300">{questionInput.toString()}</strong>?
            </p>
          </div>

          <form onSubmit={handleSubmitFinalAnswer} className="space-y-2">
            <input
              type="text"
              disabled={disabled}
              value={finalAnswerInput}
              onChange={(e) => setFinalAnswerInput(e.target.value)}
              placeholder={`Enter output for ${questionInput.toString()}...`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center font-mono text-lg font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!finalAnswerInput.trim() || disabled}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
            >
              <span>SUBMIT HYPOTHESIS ANSWER</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
