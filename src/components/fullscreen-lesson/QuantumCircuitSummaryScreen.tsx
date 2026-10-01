import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Cpu, SlidersHorizontal, Radio, Layers, ArrowDown } from 'lucide-react';

interface QuantumCircuitSummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const QuantumCircuitSummaryScreen: React.FC<QuantumCircuitSummaryScreenProps> = ({
  onNextLesson,
  onBackToPath,
  onBack,
  isAlreadyViewed = false,
}) => {
  // Reveal key takeaways progressively for calm, digestible learning
  const [revealedStep, setRevealedStep] = useState(isAlreadyViewed ? 6 : 1);

  useEffect(() => {
    if (isAlreadyViewed) {
      setRevealedStep(6);
      return;
    }

    const t1 = setTimeout(() => setRevealedStep(2), 500);
    const t2 = setTimeout(() => setRevealedStep(3), 1000);
    const t3 = setTimeout(() => setRevealedStep(4), 1500);
    const t4 = setTimeout(() => setRevealedStep(5), 2000);
    const t5 = setTimeout(() => setRevealedStep(6), 2500);

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
          LEFT SIDE (~55%): Clean Circuit Architecture & Unified Flow
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-xl flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.14) 0%, rgba(34, 211, 238, 0.07) 50%, transparent 70%)',
            }}
          />

          {/* Container Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                CIRCUIT ARCHITECTURE
              </span>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Lesson 5 Complete
              </span>
            </div>

            {/* Circuit Examples Display */}
            <div className="space-y-4">
              
              {/* 1-Qubit Circuit Example */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    One-Qubit Circuit
                  </span>
                  <span className="text-[11px] font-mono text-[#22D3EE]">
                    1 wire • 2 operations
                  </span>
                </div>

                <div className="relative flex items-center py-3 px-4 bg-[#132238] rounded-xl border border-[#243B55] overflow-hidden">
                  <div className="flex items-center gap-3 font-mono text-sm z-10 w-full">
                    <span className="font-bold text-[#94A3B8] w-6">q0:</span>
                    <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-bold">
                      |0⟩
                    </span>
                    
                    {/* Wire with gates */}
                    <div className="flex-1 flex items-center justify-evenly relative">
                      <div className="absolute inset-x-0 h-0.5 bg-[#334155] -z-0" />
                      
                      <div className="z-10 px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-400/60 text-purple-200 text-xs font-bold shadow-xs">
                        H
                      </div>

                      <div className="z-10 px-3 py-1 rounded-lg bg-cyan-950/80 border border-[#22D3EE]/60 text-[#67E8F9] text-xs font-bold shadow-xs flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#22D3EE]" />
                        <span>M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Qubit Circuit Example */}
              <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Two-Qubit Circuit
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300">
                    2 wires • independent timelines
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-[#132238] rounded-xl border border-[#243B55]">
                  {/* q0 wire */}
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="font-bold text-[#94A3B8] w-6">q0:</span>
                    <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-bold">
                      |0⟩
                    </span>
                    <div className="flex-1 flex items-center justify-evenly relative">
                      <div className="absolute inset-x-0 h-0.5 bg-[#334155] -z-0" />
                      <div className="z-10 px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-400/60 text-purple-200 text-xs font-bold shadow-xs">
                        H
                      </div>
                      <div className="z-10 px-3 py-1 rounded-lg bg-cyan-950/80 border border-[#22D3EE]/60 text-[#67E8F9] text-xs font-bold shadow-xs flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#22D3EE]" />
                        <span>M</span>
                      </div>
                    </div>
                  </div>

                  {/* q1 wire */}
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="font-bold text-[#94A3B8] w-6">q1:</span>
                    <span className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#22D3EE]/40 text-[#22D3EE] text-xs font-bold">
                      |0⟩
                    </span>
                    <div className="flex-1 flex items-center justify-evenly relative">
                      <div className="absolute inset-x-0 h-0.5 bg-[#334155] -z-0" />
                      <div className="z-10 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-400/60 text-blue-200 text-xs font-bold shadow-xs">
                        X
                      </div>
                      <div className="z-10 px-3 py-1 rounded-lg bg-cyan-950/80 border border-[#22D3EE]/60 text-[#67E8F9] text-xs font-bold shadow-xs flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#22D3EE]" />
                        <span>M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Final Execution Flow Diagram */}
            <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55]">
              <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-3 text-center">
                Unified Quantum Execution Flow
              </div>
              
              <div className="flex items-center justify-between text-xs font-mono">
                
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#132238] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[#F8FAFC] font-bold mt-1.5">Qubit</span>
                  <span className="text-[10px] text-[#94A3B8]">State carrier</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4F7CFF]" />

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#132238] border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <span className="text-[#F8FAFC] font-bold mt-1.5">Gate(s)</span>
                  <span className="text-[10px] text-[#94A3B8]">Transform</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4F7CFF]" />

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#132238] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="text-[#F8FAFC] font-bold mt-1.5">Measure</span>
                  <span className="text-[10px] text-[#94A3B8]">Readout</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#4F7CFF]" />

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                    0 / 1
                  </div>
                  <span className="text-[#F8FAFC] font-bold mt-1.5">Result</span>
                  <span className="text-[10px] text-[#94A3B8]">Classical bit</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Synthesis & Takeaways
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Quantum Circuit complete
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            What did you learn?
          </h2>
        </div>

        {/* Core Definition Banner */}
        <div className="w-full p-4 rounded-2xl bg-[#132238] border border-[#4F7CFF]/30 space-y-1">
          <p className="text-sm font-semibold text-white leading-snug">
            “A quantum circuit is an ordered sequence of operations performed on one or more qubits.”
          </p>
        </div>

        {/* Takeaway Cards */}
        <div className="w-full space-y-2.5">
          
          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/20 mt-0.5">
              QUBIT
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">What we operate on.</strong> Each horizontal wire represents one physical or logical qubit line.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-400/20 mt-0.5">
              GATES
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">How we change the state.</strong> Operations (like X or H) execute strictly from left to right.
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-[#67E8F9] bg-cyan-950/60 px-2 py-0.5 rounded border border-[#22D3EE]/20 mt-0.5">
              MEASURE
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">How we read the result.</strong> Converts the quantum superposition into a definitive classical bit (0 or 1).
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 transition-all duration-300 ${
            revealedStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <span className="font-mono font-bold text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-400/20 mt-0.5">
              CIRCUIT
            </span>
            <span className="text-xs sm:text-sm text-[#CBD5E1]">
              <strong className="text-white">Puts these operations together in order.</strong> Qubits can run in parallel without interfering.
            </span>
          </div>

        </div>

        {/* Transition Teaser */}
        <div className={`w-full p-4 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 transition-all duration-300 ${
          revealedStep >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#22D3EE] font-bold">Upcoming Concept:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            We can run a circuit once and see one outcome.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white">
            “But what if we run the same circuit many times?”
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center gap-3">
          {onBack && (
            <button
              id="circuit-summary-back-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#132238] hover:bg-[#1a2e48] border border-[#243B55] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            id="circuit-summary-next-shots-btn"
            type="button"
            onClick={onNextLesson}
            className="flex-1 w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4F7CFF]/20 active:scale-[0.99] transition-all"
          >
            <span>NEXT: SHOTS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="circuit-summary-path-btn"
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
