import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Terminal, Cpu, Play, BarChart3, Radio, RefreshCw, HelpCircle } from 'lucide-react';

interface QiskitSummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const QiskitSummaryScreen: React.FC<QiskitSummaryScreenProps> = ({
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  const [revealedStep, setRevealedStep] = useState(isAlreadyViewed ? 6 : 1);

  useEffect(() => {
    if (isAlreadyViewed) {
      setRevealedStep(6);
      return;
    }

    const t1 = setTimeout(() => setRevealedStep(2), 400);
    const t2 = setTimeout(() => setRevealedStep(3), 800);
    const t3 = setTimeout(() => setRevealedStep(4), 1200);
    const t4 = setTimeout(() => setRevealedStep(5), 1600);
    const t5 = setTimeout(() => setRevealedStep(6), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isAlreadyViewed]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 my-auto py-4">
      
      {/* =========================================================================
          LEFT SIDE (~50%): Complete Flow Map
          ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="relative w-full max-w-lg flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.14) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
            }}
          />

          {/* Flow Visualizer Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                QUANTUM WORKFLOW
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Qiskit Lab Complete
              </span>
            </div>

            {/* Step-by-step pipeline */}
            <div className="space-y-2.5 font-mono text-xs">
              
              {/* 1. YOU */}
              <div className="p-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#132238] text-white flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  <span className="text-white font-bold">YOU (Quantum Developer)</span>
                </div>
                <span className="text-[#94A3B8] text-[11px]">Design idea</span>
              </div>

              <div className="flex justify-center -my-1 text-[#4F7CFF]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* 2. Circuit & Code */}
              <div className="p-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#132238] text-[#22D3EE] flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[#22D3EE] font-bold">Build Circuit & Qiskit Code</span>
                    <span className="text-[10px] text-[#CBD5E1]">qc = QuantumCircuit(1); qc.h(0)...</span>
                  </div>
                </div>
                <Terminal className="w-4 h-4 text-[#22D3EE]" />
              </div>

              <div className="flex justify-center -my-1 text-[#4F7CFF]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* 3. Simulator / Hardware */}
              <div className="p-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#132238] text-[#4F7CFF] flex items-center justify-center font-bold text-[10px]">
                    3
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[#4F7CFF] font-bold">Backend Simulator</span>
                    <span className="text-[10px] text-[#CBD5E1]">Executes circuit mathematically</span>
                  </div>
                </div>
                <Cpu className="w-4 h-4 text-[#4F7CFF]" />
              </div>

              <div className="flex justify-center -my-1 text-[#4F7CFF]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* 4. Shots & Sampling */}
              <div className="p-2.5 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#132238] text-purple-300 flex items-center justify-center font-bold text-[10px]">
                    4
                  </span>
                  <div className="flex flex-col">
                    <span className="text-purple-300 font-bold">Shots (e.g. 100 runs)</span>
                    <span className="text-[10px] text-[#CBD5E1]">Repeats experiment from initial preparation</span>
                  </div>
                </div>
                <RefreshCw className="w-4 h-4 text-purple-300" />
              </div>

              <div className="flex justify-center -my-1 text-[#4F7CFF]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* 5. Counts & Histogram */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                    5
                  </span>
                  <div className="flex flex-col">
                    <span className="text-emerald-300 font-bold">Counts & Histogram</span>
                    <span className="text-[10px] text-[#CBD5E1]">0: 48, 1: 52 → Probability distribution</span>
                  </div>
                </div>
                <BarChart3 className="w-4 h-4 text-emerald-300" />
              </div>

            </div>

            {/* Core takeaway banner */}
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#4F7CFF]/30 text-center font-mono text-xs">
              <span className="text-white font-semibold">
                “Qiskit lets us turn quantum circuits into experiments we can actually run.”
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~50%): UNDERSTAND - Key Takeaways & Transition
          ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center text-left items-start space-y-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hands-On Mastery
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            What did you learn?
          </h2>
        </div>

        {/* Takeaway Cards */}
        <div className="w-full space-y-2.5">
          
          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/20 mt-0.5 shrink-0">
              SOFTWARE
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Qiskit is Python software.</strong> It is used to compose circuits and send them to simulators or quantum computers.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-400/20 mt-0.5 shrink-0">
              EQUIVALENCE
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Your circuit and Qiskit code describe the exact same experiment.</strong> Adding a gate visually corresponds directly to Python methods like <code className="text-[#22D3EE]">qc.h(0)</code>.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#4F7CFF] bg-blue-950/60 px-2 py-0.5 rounded border border-[#4F7CFF]/20 mt-0.5 shrink-0">
              SIMULATOR
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Simulators execute circuits immediately.</strong> Classical computers calculate the quantum probabilities mathematically without needing physical dilution fridges.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-400/20 mt-0.5 shrink-0">
              COUNTS & STATS
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Shots repeat the circuit.</strong> Counts and histograms show empirical frequencies, revealing how your quantum circuit behaves.
            </span>
          </div>

        </div>

        {/* Next step teaser */}
        <div className={`w-full p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 transition-all duration-300 ${
          revealedStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#22D3EE] font-bold">Up Next:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            You have mastered Bits, Probabilities, Qubits, Gates, Circuits, Shots, and Qiskit.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white">
            “Ready to put your knowledge to the test in the Beginner Capstone Challenge?”
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center gap-3">
          {onBack && (
            <button
              id="qiskit-summary-back-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#132238] hover:bg-[#1a2e48] border border-[#243B55] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            id="qiskit-summary-capstone-btn"
            type="button"
            onClick={onNextLesson}
            className="flex-1 w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
          >
            <span>START BEGINNER CHALLENGE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="qiskit-summary-path-btn"
            type="button"
            onClick={onBackToPath}
            className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#132238]/60 cursor-pointer transition-all"
          >
            Back to learning path
          </button>
        </div>

      </div>

    </div>
  );
};
