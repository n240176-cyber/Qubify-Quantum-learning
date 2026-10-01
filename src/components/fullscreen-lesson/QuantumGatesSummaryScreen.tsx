import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Layers, SlidersHorizontal, Radio, GitBranch } from 'lucide-react';

interface QuantumGatesSummaryScreenProps {
  onNextLesson: () => void;
  onBackToPath: () => void;
  onBack?: () => void;
  isAlreadyViewed?: boolean;
}

export const QuantumGatesSummaryScreen: React.FC<QuantumGatesSummaryScreenProps> = ({
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

    const t1 = setTimeout(() => setRevealedStep(2), 600);
    const t2 = setTimeout(() => setRevealedStep(3), 1200);
    const t3 = setTimeout(() => setRevealedStep(4), 1800);
    const t4 = setTimeout(() => setRevealedStep(5), 2400);
    const t5 = setTimeout(() => setRevealedStep(6), 3000);

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
          LEFT SIDE (~55%): SEE / OBSERVE - Progressive Flow & Gate Reference
          ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-lg flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div 
            className="absolute -inset-4 rounded-3xl blur-2xl -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(79, 124, 255, 0.12) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 70%)',
            }}
          />

          {/* Container Card */}
          <div className="w-full bg-[#132238]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
                Quantum Execution Flow
              </span>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                Summary Architecture
              </span>
            </div>

            {/* Progressive Workflow Pipeline Diagram */}
            <div className="bg-[#0D1B2A] border border-[#243B55] rounded-2xl p-4 sm:p-5 flex flex-col items-center space-y-2.5 relative">
              
              {/* Stage 1: Prepare |0⟩ */}
              <div className="w-full py-2 px-3.5 rounded-xl bg-[#132238] border border-[#22D3EE]/40 flex items-center justify-between shadow-xs">
                <span className="text-xs font-mono text-[#94A3B8]">1. Initialization</span>
                <span className="font-mono font-extrabold text-sm text-[#22D3EE]">Prepare |0⟩</span>
              </div>

              <div className="text-slate-500 font-mono text-xs">↓</div>

              {/* Stage 2: Apply Gate(s) */}
              <div className="w-full py-2 px-3.5 rounded-xl bg-[#132238] border border-[#4F7CFF]/50 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span className="text-xs font-mono text-[#94A3B8]">2. Transformation</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-400/40 text-indigo-300">
                    X
                  </span>
                  <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/40 text-cyan-300">
                    H
                  </span>
                </div>
              </div>

              <div className="text-slate-500 font-mono text-xs">↓</div>

              {/* Stage 3: Quantum state changes */}
              <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-indigo-950/40 to-purple-950/30 border border-[#4F7CFF]/40 flex items-center justify-between shadow-xs">
                <span className="text-xs font-mono text-[#94A3B8]">3. Evolution</span>
                <span className="font-mono font-bold text-xs text-[#F8FAFC]">Quantum state changes</span>
              </div>

              <div className="text-slate-500 font-mono text-xs">↓</div>

              {/* Stage 4: Measure */}
              <div className="w-full py-2 px-3.5 rounded-xl bg-[#132238] border border-amber-500/40 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono text-[#94A3B8]">4. Readout</span>
                </div>
                <span className="font-mono font-bold text-xs text-amber-300">Measure</span>
              </div>

              <div className="text-slate-500 font-mono text-xs">↓</div>

              {/* Stage 5: Classical outcome */}
              <div className="w-full py-2 px-3.5 rounded-xl bg-[#132238] border border-[#22C55E]/60 flex items-center justify-between shadow-xs">
                <span className="text-xs font-mono text-[#94A3B8]">5. Output</span>
                <span className="font-mono font-black text-sm text-[#22C55E]">0 or 1</span>
              </div>

            </div>

            {/* Essential Gate Reference Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              {/* X Gate Reference */}
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 text-center">
                <div className="inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 mb-1">
                  X Gate
                </div>
                <div className="font-mono font-black text-sm text-[#F8FAFC]">
                  <span className="text-[#22D3EE]">|0⟩</span> ↔ <span className="text-purple-300">|1⟩</span>
                </div>
                <div className="text-[11px] text-[#94A3B8] font-mono">
                  State Inverter / Swaps amplitudes
                </div>
              </div>

              {/* H Gate Reference */}
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#243B55] space-y-1.5 text-center">
                <div className="inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 mb-1">
                  H Gate
                </div>
                <div className="font-mono font-bold text-xs text-[#F8FAFC]">
                  <span className="text-[#22D3EE]">|0⟩</span> → Superposition
                </div>
                <div className="text-[11px] text-[#22D3EE] font-mono">
                  50% 0 | 50% 1
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE (~45%): UNDERSTAND - Key Takeaways & Circuit Transition
          ========================================================================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center text-left items-start space-y-6">
        
        {/* Completion Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono font-bold tracking-wide">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Quantum Gates complete</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
            What did you learn?
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] font-medium">
            Review the essential principles of state manipulation and measurement collapse.
          </p>
        </div>

        {/* Takeaway Items (Revealed sequentially) */}
        <div className="space-y-3 w-full">
          
          {revealedStep >= 2 && (
            <div className="p-3 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Measurement gives <strong className="text-white">0 or 1</strong> and leaves the qubit in the corresponding measured state.
              </p>
            </div>
          )}

          {revealedStep >= 3 && (
            <div className="p-3 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                To repeat the same experiment, we <strong className="text-[#22D3EE]">prepare the original state again</strong>.
              </p>
            </div>
          )}

          {revealedStep >= 4 && (
            <div className="p-3 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Quantum gates are used to <strong className="text-white">intentionally change or prepare</strong> qubit states.
              </p>
            </div>
          )}

          {revealedStep >= 5 && (
            <div className="p-3 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                4
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                <strong className="text-indigo-300 font-mono">X</strong> changes <strong className="text-[#22D3EE]">|0⟩</strong> and <strong className="text-purple-300">|1⟩</strong> into each other.
              </p>
            </div>
          )}

          {revealedStep >= 6 && (
            <div className="p-3 rounded-2xl bg-[#0D1B2A] border border-[#243B55] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-6 h-6 rounded-full bg-[#132238] border border-[#4F7CFF]/40 text-[#22D3EE] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                5
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                <strong className="text-cyan-300 font-mono">H</strong> can prepare an <strong className="text-white">equal superposition</strong> from <strong className="text-[#22D3EE]">|0⟩</strong>.
              </p>
            </div>
          )}

          {/* Final Transition Banner */}
          {revealedStep >= 6 && (
            <div className="p-4 rounded-2xl bg-[#132238] border-2 border-[#4F7CFF]/50 shadow-md shadow-[#4F7CFF]/10 space-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-400">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE]">
                <GitBranch className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Next Horizon</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#FFFFFF] leading-snug">
                “We now have a qubit, gates, and measurement. How do we arrange all of these together into a computational pipeline?”
              </p>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="pt-2 w-full flex flex-col sm:flex-row items-center gap-3">
          
          {/* Back button to revisit previous step */}
          {onBack && (
            <button
              id="gates-summary-back-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer bg-[#132238] hover:bg-[#1a2f4c] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#243B55] hover:border-[#4F7CFF]/40 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Primary Action Button: NEXT: QUANTUM CIRCUITS */}
          <button
            id="gates-next-lesson-btn"
            type="button"
            onClick={onNextLesson}
            className="w-full sm:flex-1 group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer bg-gradient-to-r from-[#4F7CFF] to-[#6366F1] hover:from-[#3d6bf0] hover:to-[#5558e6] text-white shadow-lg shadow-[#4F7CFF]/25 ring-1 ring-[#22D3EE]/30 active:scale-[0.98]"
          >
            <span>NEXT: QUANTUM CIRCUITS</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Action: Back to learning path */}
          <button
            id="gates-back-to-path-btn"
            type="button"
            onClick={onBackToPath}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-full text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#132238] transition-colors cursor-pointer"
          >
            <span>Learning path</span>
          </button>

        </div>

      </div>

    </div>
  );
};
