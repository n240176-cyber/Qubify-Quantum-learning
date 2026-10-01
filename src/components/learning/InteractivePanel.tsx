import React, { useState } from 'react';
import { Sparkles, RefreshCw, Eye, Binary, Zap, ArrowRight } from 'lucide-react';

interface InteractivePanelProps {
  lessonTitle: string;
  onActionComplete?: () => void;
}

export const InteractivePanel: React.FC<InteractivePanelProps> = ({
  lessonTitle,
  onActionComplete,
}) => {
  // Interactive state for demonstration of measurement and superposition
  const [qubitState, setQubitState] = useState<'zero' | 'superposition' | 'one'>('superposition');
  const [measuredOutcome, setMeasuredOutcome] = useState<'0' | '1' | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleMeasure = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      let outcome: '0' | '1';
      if (qubitState === 'zero') outcome = '0';
      else if (qubitState === 'one') outcome = '1';
      else outcome = Math.random() > 0.5 ? '1' : '0';

      setMeasuredOutcome(outcome);
      setIsMeasuring(false);
      setAttempts((prev) => prev + 1);
      if (onActionComplete) onActionComplete();
    }, 400);
  };

  const handleApplyHadamard = () => {
    setQubitState('superposition');
    setMeasuredOutcome(null);
  };

  const handleApplyX = () => {
    setQubitState((prev) => (prev === 'zero' ? 'one' : 'zero'));
    setMeasuredOutcome(null);
  };

  const handleReset = () => {
    setQubitState('superposition');
    setMeasuredOutcome(null);
  };

  return (
    <div 
      id="central-interactive-learning-panel"
      className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm transition-all"
    >
      {/* Panel Top Label */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Interactive Quantum Stage
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          {lessonTitle}
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Left: Visual Quantum State Representation */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative min-h-[240px]">
          
          {/* Visual Qubit Representation */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            
            {/* Outer coordinate ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
              qubitState === 'superposition' 
                ? 'border-cyan-400 animate-spin-slow' 
                : 'border-slate-300'
            }`} />

            {/* Orbiting particles */}
            {qubitState === 'superposition' && (
              <div className="absolute inset-0 animate-spin">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-md shadow-cyan-400/50" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-md shadow-purple-500/50" />
              </div>
            )}

            {/* Center State Orb */}
            <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 transform ${
              isMeasuring 
                ? 'scale-90 opacity-60 bg-slate-700' 
                : measuredOutcome !== null
                ? measuredOutcome === '0'
                  ? 'bg-blue-600 ring-4 ring-blue-200'
                  : 'bg-purple-600 ring-4 ring-purple-200'
                : qubitState === 'superposition'
                ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 shadow-cyan-500/30'
                : qubitState === 'zero'
                ? 'bg-blue-600 shadow-blue-500/30'
                : 'bg-purple-600 shadow-purple-500/30'
            }`}>
              {isMeasuring ? (
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-300" />
              ) : measuredOutcome !== null ? (
                <>
                  <span className="text-xs uppercase tracking-wider text-white/80 font-mono">Collapsed</span>
                  <span className="text-3xl font-black font-mono">|{measuredOutcome}⟩</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">State</span>
                  <span className="text-lg font-mono font-black">
                    {qubitState === 'superposition' ? '|+⟩' : qubitState === 'zero' ? '|0⟩' : '|1⟩'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Probability Gauge */}
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
              <span>P(|0⟩): {qubitState === 'superposition' ? '50%' : qubitState === 'zero' ? '100%' : '0%'}</span>
              <span>P(|1⟩): {qubitState === 'superposition' ? '50%' : qubitState === 'one' ? '100%' : '0%'}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-600 h-full transition-all duration-300" 
                style={{ width: qubitState === 'superposition' ? '50%' : qubitState === 'zero' ? '100%' : '0%' }}
              />
              <div 
                className="bg-purple-600 h-full transition-all duration-300" 
                style={{ width: qubitState === 'superposition' ? '50%' : qubitState === 'one' ? '100%' : '0%' }}
              />
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 text-center">
            {measuredOutcome !== null ? (
              <span className="text-emerald-700 font-semibold">
                ✓ State collapsed into definite basis state |{measuredOutcome}⟩
              </span>
            ) : qubitState === 'superposition' ? (
              <span>Qubit in equal superposition (|0⟩ + |1⟩) / √2</span>
            ) : (
              <span>Qubit prepared in deterministic computational basis</span>
            )}
          </div>
        </div>

        {/* Right: Interaction Controls & Observe Guidance */}
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Observe the effect</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Interactive State Collider
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Before measurement, a qubit exists in a superposition of states. When you measure it, the wavefunction collapses into either <strong>0</strong> or <strong>1</strong>.
            </p>
          </div>

          {/* Try It Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-700">Try it yourself:</div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                id="interactive-measure-btn"
                onClick={handleMeasure}
                disabled={isMeasuring}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Measure Now</span>
              </button>

              <button
                id="interactive-hadamard-btn"
                onClick={handleApplyHadamard}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Apply H Gate</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                id="interactive-flip-btn"
                onClick={handleApplyX}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
              >
                Flip Qubit (X Gate)
              </button>

              <button
                id="interactive-reset-btn"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset state</span>
              </button>
            </div>
          </div>

          {/* Feedback badge */}
          {attempts > 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Measured {attempts} time{attempts > 1 ? 's' : ''}. Notice how quantum probability manifests across multiple trials!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
